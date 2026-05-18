import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Paperclip, Square, X, Loader2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { uploadFile } from '../utils/api';
import { useChatStore } from '../store/chatStore';

export default function ChatInput({ onSend, onStop, isStreaming }) {
  const [input, setInput] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const { personality } = useChatStore();

  const handleVoiceResult = useCallback((transcript) => {
    setInput(prev => prev + (prev ? ' ' : '') + transcript);
    textareaRef.current?.focus();
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useVoice(handleVoiceResult);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    let finalMessage = text;
    if (fileInfo?.summary) {
      finalMessage = `[File: ${fileInfo.fileName}]\n\n${fileInfo.summary}\n\n---\nUser question: ${text}`;
    }

    onSend(finalMessage);
    setInput('');
    setFileInfo(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file);
      setFileInfo({ fileName: file.name, summary: result.summary, charCount: result.charCount });
    } catch (error) {
      alert(`File upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const canSend = input.trim().length > 0 && !isStreaming;

  return (
    <div className="p-4">
      {/* File preview */}
      <AnimatePresence>
        {fileInfo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2 flex items-center gap-2 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800"
          >
            <Paperclip size={13} className="text-sky-500 shrink-0" />
            <span className="text-xs text-sky-700 dark:text-sky-300 flex-1 truncate">
              {fileInfo.fileName} ({fileInfo.charCount?.toLocaleString()} chars) — summarized
            </span>
            <button onClick={() => setFileInfo(null)} className="text-sky-400 hover:text-sky-600">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-2xl p-2 shadow-xl">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message GeminiChat (${personality} mode)...`}
          rows={1}
          className="w-full bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none outline-none max-h-48"
          disabled={isStreaming}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-2 pb-1">
          <div className="flex items-center gap-1">
            {/* File upload */}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".txt,.md,.json,.csv,.html,.js,.py,.ts,.jsx,.tsx,.css"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || isStreaming}
              className="p-2 rounded-xl text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all disabled:opacity-40"
              title="Upload file"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
            </button>

            {/* Voice input */}
            {isSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isStreaming}
                className={`p-2 rounded-xl transition-all disabled:opacity-40 ${
                  isListening
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse'
                    : 'text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Stop button */}
            {isStreaming && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onStop}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
              >
                <Square size={11} />
                Stop
              </motion.button>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`p-2.5 rounded-xl transition-all ${
                canSend
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-sky-400 hover:to-blue-500 active:scale-95'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-2">
        Powered by Gemini 1.5 Flash · Press Shift+Enter for new line
      </p>
    </div>
  );
}
