import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Check, X, MessageSquare,
  Moon, Sun, Cpu, BookOpen, Smile, Brain, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';

const PERSONALITIES = [
  { id: 'default', label: 'Default', icon: Cpu, color: 'text-sky-500' },
  { id: 'developer', label: 'Developer', icon: Zap, color: 'text-green-500' },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, color: 'text-amber-500' },
  { id: 'friendly', label: 'Friendly', icon: Smile, color: 'text-pink-500' },
];

function SessionItem({ session, isActive, onSelect, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(session.title);

  const handleRename = () => {
    if (title.trim()) onRename(session.id, title.trim());
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
      onClick={() => !editing && onSelect(session.id)}
    >
      <MessageSquare size={14} className="shrink-0 opacity-60" />

      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="flex-1 text-xs bg-transparent outline-none border-b border-sky-400"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-xs truncate">{session.title}</span>
      )}

      <div className={`flex gap-1 shrink-0 ${editing ? 'flex' : 'hidden group-hover:flex'}`}>
        {editing ? (
          <>
            <button onClick={e => { e.stopPropagation(); handleRename(); }} className="p-0.5 hover:text-green-500">
              <Check size={12} />
            </button>
            <button onClick={e => { e.stopPropagation(); setEditing(false); }} className="p-0.5 hover:text-red-500">
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <button onClick={e => { e.stopPropagation(); setEditing(true); setTitle(session.title); }} className="p-0.5 opacity-60 hover:opacity-100">
              <Edit3 size={12} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(session.id); }} className="p-0.5 opacity-60 hover:opacity-100 hover:text-red-500">
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const {
    sessions, currentSessionId, createSession, deleteSession,
    renameSession, setCurrentSession, darkMode, toggleDarkMode,
    personality, setPersonality, memoryMode, toggleMemoryMode,
  } = useChatStore();

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full flex flex-col bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700/50 relative overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0">
            <Brain size={16} className="text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-sm text-gray-900 dark:text-white"
            >
              GeminiChat
            </motion.span>
          )}
        </div>

        {/* New Chat */}
        <div className="px-3 pb-3 shrink-0">
          <button
            onClick={() => {
              const id = createSession();
              setCurrentSession(id);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-md hover:shadow-lg`}
          >
            <Plus size={16} className="shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Chat List */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto px-3 space-y-1 min-h-0">
            {sessions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No chats yet</p>
            ) : (
              <AnimatePresence>
                {sessions.map(session => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onSelect={setCurrentSession}
                    onDelete={deleteSession}
                    onRename={renameSession}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Bottom controls */}
        <div className={`p-3 border-t border-gray-200 dark:border-gray-700/50 space-y-2 shrink-0 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {!collapsed && (
            <>
              {/* Personality */}
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Personality</p>
                <div className="grid grid-cols-2 gap-1">
                  {PERSONALITIES.map(p => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPersonality(p.id)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                          personality === p.id
                            ? 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-sky-400/50 text-gray-900 dark:text-white'
                            : 'text-gray-500 hover:bg-white/60 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        <Icon size={11} className={personality === p.id ? p.color : ''} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Memory Mode */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Memory Mode</span>
                <button
                  onClick={toggleMemoryMode}
                  className={`w-9 h-5 rounded-full transition-colors relative ${memoryMode ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${memoryMode ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
            </>
          )}

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-xl text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
