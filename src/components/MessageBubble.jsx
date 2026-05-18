import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Brain, AlertCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ inline, className, children, ...props }) {
  const { darkMode } = useChatStore();
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  if (!inline && match) {
    return (
      <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
          <CopyButton text={code} />
        </div>
        <SyntaxHighlighter
          style={darkMode ? oneDark : oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.82rem' }}
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="font-mono text-[0.85em] bg-gray-100 dark:bg-gray-700 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded-md" {...props}>
      {children}
    </code>
  );
}

const INTENT_BADGES = {
  coding: { label: 'Code', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  summarization: { label: 'Summary', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  classification: { label: 'Classification', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  translation: { label: 'Translation', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  creative: { label: 'Creative', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  math: { label: 'Math', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const isError = message.isError;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badge = INTENT_BADGES[message.intent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
        isUser
          ? 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-md'
          : isError
          ? 'bg-red-100 dark:bg-red-900/30'
          : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-md'
      }`}>
        {isUser
          ? <User size={15} className="text-white" />
          : isError
          ? <AlertCircle size={15} className="text-red-500" />
          : <Brain size={15} className="text-white" />
        }
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Intent badge */}
        {!isUser && badge && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
        )}

        {/* Bubble */}
        <div className={`relative ${isUser ? 'chat-bubble-user' : isError ? 'border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-full' : 'chat-bubble-ai'}`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className={`markdown-body text-sm ${isStreaming ? 'streaming-cursor' : ''}`}>
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <div className="flex gap-1.5 items-center py-1">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && message.content && !isStreaming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyMessage}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
