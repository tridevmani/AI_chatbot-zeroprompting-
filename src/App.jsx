import { useState, useEffect } from 'react';
import { useChatStore } from './store/chatStore';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const { darkMode, currentSessionId, createSession, setCurrentSession } = useChatStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-create initial session if none
  useEffect(() => {
    if (!currentSessionId) {
      const id = createSession();
      setCurrentSession(id);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0f1117] transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  );
}
