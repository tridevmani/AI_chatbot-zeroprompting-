import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const generateMsgId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_SUGGESTIONS = [
  'Write a Python function to fetch data from a REST API',
  'Explain the difference between TCP and UDP protocols',
  'Help me write a cover letter for a software engineer role',
  'Summarize the key concepts of machine learning',
];

export const useChatStore = create(
  persist(
    (set, get) => ({
      // ── Chat Sessions ──────────────────────────────────────────────
      sessions: [],
      currentSessionId: null,

      createSession: (firstMessage = null) => {
        const id = generateId();
        const title = firstMessage
          ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '')
          : 'New Chat';

        const session = {
          id,
          title,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(state => ({
          sessions: [session, ...state.sessions],
          currentSessionId: id,
        }));

        return id;
      },

      deleteSession: (id) => {
        set(state => {
          const sessions = state.sessions.filter(s => s.id !== id);
          const currentSessionId =
            state.currentSessionId === id
              ? sessions[0]?.id ?? null
              : state.currentSessionId;
          return { sessions, currentSessionId };
        });
      },

      renameSession: (id, title) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === id ? { ...s, title, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      setCurrentSession: (id) => set({ currentSessionId: id }),

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find(s => s.id === currentSessionId) ?? null;
      },

      // ── Messages ───────────────────────────────────────────────────
      addMessage: (sessionId, role, content, meta = {}) => {
        const msg = {
          id: generateMsgId(),
          role,
          content,
          timestamp: new Date().toISOString(),
          ...meta,
        };

        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, msg],
                  updatedAt: new Date().toISOString(),
                  // Auto-title from first user message
                  title:
                    s.messages.length === 0 && role === 'user'
                      ? content.slice(0, 40) + (content.length > 40 ? '...' : '')
                      : s.title,
                }
              : s
          ),
        }));

        return msg.id;
      },

      updateMessage: (sessionId, msgId, updates) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === msgId ? { ...m, ...updates } : m
                  ),
                }
              : s
          ),
        }));
      },

      removeLastMessage: (sessionId) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, messages: s.messages.slice(0, -1) }
              : s
          ),
        }));
      },

      clearMessages: (sessionId) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId ? { ...s, messages: [] } : s
          ),
        }));
      },

      // ── UI State ───────────────────────────────────────────────────
      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }),

      streamingMessageId: null,
      setStreamingMessageId: (id) => set({ streamingMessageId: id }),

      // ── Settings ───────────────────────────────────────────────────
      darkMode: false,
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),

      personality: 'default',
      setPersonality: (p) => set({ personality: p }),

      memoryMode: true,
      toggleMemoryMode: () => set(state => ({ memoryMode: !state.memoryMode })),

      suggestions: DEFAULT_SUGGESTIONS,
      setSuggestions: (s) => set({ suggestions: s }),
    }),
    {
      name: 'gemini-chat-storage',
      partialize: (state) => ({
        sessions: state.sessions.map(s => ({
          ...s,
          // Keep only last 50 messages per session for localStorage
          messages: s.messages.slice(-50),
        })),
        currentSessionId: state.currentSessionId,
        darkMode: state.darkMode,
        personality: state.personality,
        memoryMode: state.memoryMode,
      }),
    }
  )
);
