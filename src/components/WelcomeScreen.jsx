import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function WelcomeScreen({ onSuggestion }) {
  const { suggestions } = useChatStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center h-full px-6 py-12 text-center"
    >
      {/* Logo */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-sky-500/30 mx-auto mb-4">
          <Brain size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent">
          GeminiChat
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Powered by Google Gemini · Zero-shot AI reasoning
        </p>
      </motion.div>

      {/* Suggestions */}
      <motion.div variants={itemVariants} className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Sparkles size={14} className="text-sky-400" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Try asking</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, i) => (
            <motion.button
              key={i}
              variants={itemVariants}
              onClick={() => onSuggestion(suggestion)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-left p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/10 transition-all duration-200 group"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-relaxed">
                {suggestion}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Capabilities */}
      <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-2 justify-center">
        {['Code Generation', 'Summarization', 'Q&A', 'Translation', 'Math', 'Creative Writing'].map(cap => (
          <span key={cap} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {cap}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
