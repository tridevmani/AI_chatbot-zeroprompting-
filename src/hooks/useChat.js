import { useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import { sendMessage, fetchSuggestions } from '../utils/api';

export function useChat() {
  const store = useChatStore();
  const abortRef = useRef(null);
  const readerRef = useRef(null);

  const getHistory = useCallback((sessionId) => {
    if (!store.memoryMode) return [];
    const session = store.sessions.find(s => s.id === sessionId);
    if (!session) return [];
    return session.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));
  }, [store.sessions, store.memoryMode]);

  const send = useCallback(async (text, sessionId) => {
    if (store.isStreaming) return;

    let activeSessionId = sessionId ?? store.currentSessionId;

    // Create session if none exists
    if (!activeSessionId) {
      activeSessionId = store.createSession(text);
    }

    // Add user message
    store.addMessage(activeSessionId, 'user', text);

    // Add placeholder AI message
    const aiMsgId = store.addMessage(activeSessionId, 'assistant', '', {
      isStreaming: true,
    });

    store.setIsStreaming(true);
    store.setStreamingMessageId(aiMsgId);

    const history = getHistory(activeSessionId);

    try {
      let fullContent = '';

      await sendMessage({
        message: text,
        history,
        personality: store.personality,
        stream: true,
        onChunk: (chunk, full, intent) => {
          fullContent = full;
          store.updateMessage(activeSessionId, aiMsgId, {
            content: full,
            isStreaming: true,
            intent,
          });
        },
        onDone: (full) => {
          store.updateMessage(activeSessionId, aiMsgId, {
            content: full || fullContent,
            isStreaming: false,
          });
        },
        onError: (err) => {
          store.updateMessage(activeSessionId, aiMsgId, {
            content: `❌ Error: ${err}`,
            isStreaming: false,
            isError: true,
          });
        },
      });

      // Fetch new suggestions based on context
      fetchSuggestions(text).then(suggestions => {
        if (suggestions.length > 0) store.setSuggestions(suggestions);
      });

    } catch (error) {
      store.updateMessage(activeSessionId, aiMsgId, {
        content: `❌ Failed to get response: ${error.message}`,
        isStreaming: false,
        isError: true,
      });
    } finally {
      store.setIsStreaming(false);
      store.setStreamingMessageId(null);
    }

    return activeSessionId;
  }, [store, getHistory]);

  const regenerate = useCallback(async () => {
    const session = store.getCurrentSession();
    if (!session || session.messages.length < 2) return;

    // Remove last AI message
    store.removeLastMessage(session.id);

    // Get last user message
    const lastUser = [...session.messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;

    await send(lastUser.content, session.id);
  }, [store, send]);

  const stopGeneration = useCallback(() => {
    // Mark streaming done
    const session = store.getCurrentSession();
    if (!session) return;

    const streamingMsg = session.messages.find(m => m.id === store.streamingMessageId);
    if (streamingMsg) {
      store.updateMessage(session.id, streamingMsg.id, {
        isStreaming: false,
        content: streamingMsg.content + '\n\n*[Generation stopped]*',
      });
    }

    store.setIsStreaming(false);
    store.setStreamingMessageId(null);
  }, [store]);

  return { send, regenerate, stopGeneration };
}
