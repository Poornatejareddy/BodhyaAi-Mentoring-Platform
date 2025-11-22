import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useAuth } from '../context/AuthContext';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // AI Chatbot - always available
  const aiBot = {
    id: 'ai-bot',
    name: 'BodhyaAI Assistant',
    role: 'ai',
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 z-40 flex items-center gap-2"
          aria-label="Chat with AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl rounded-2xl overflow-hidden">
          <ChatWindow
            recipientId={aiBot.id}
            recipientName={aiBot.name}
            recipientRole={aiBot.role}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
