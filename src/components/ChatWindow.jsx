import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import { useChatStore } from '../store/chatStore';
import { useChat } from '../hooks/useChat';

export default function ChatWindow() {
  const { getCurrentSession, currentSessionId, isStreaming } = useChatStore();
  const { send, regenerate, stopGeneration } = useChat();
  const bottomRef = useRef(null);

  const session = getCurrentSession();
  const messages = session?.messages ?? [];

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    await send(text, currentSessionId);
  };

  const handleSuggestion = (text) => {
    handleSend(text);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {showWelcome ? (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {/* Regenerate button */}
            {!isStreaming && messages.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <button
                  onClick={regenerate}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-sky-500 transition-colors py-2 px-4 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                  <RefreshCw size={12} />
                  Regenerate response
                </button>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="max-w-3xl w-full mx-auto">
        <ChatInput
          onSend={handleSend}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
