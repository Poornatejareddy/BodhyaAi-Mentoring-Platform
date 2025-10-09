import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'; // npm install @heroicons/react
import Chatbot from '../dashboard/student/components/Chatbot';

function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-200 z-50"
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8" />
      </button>

      {/* Chatbot Modal */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

export default FloatingChatButton;
