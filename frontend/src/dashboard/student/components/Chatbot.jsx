import React, { useState } from 'react';
import { sendMessage } from '../../../services/chatService';

function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hello! How can I assist you?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null; // Don't render if it's not open

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendMessage(input);
      const assistantMessage = { sender: 'assistant', text: reply };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { sender: 'assistant', text: `Sorry, an error occurred: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // This is the main modal container, fixed to the bottom-right
    <div className="fixed bottom-20 right-5 w-96 h-[60vh] flex flex-col bg-[var(--surface)] rounded-lg shadow-2xl z-50">
      {/* Header with a close button */}
      <div className="flex justify-between items-center p-3 border-b border-[var(--line)]">
        <h3 className="font-bold text-lg">Chat with Bodhya</h3>
        <button onClick={onClose} className="font-bold text-xl">&times;</button>
      </div>
      
      {/* Message Display Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 p-3 rounded-lg max-w-xs ${
            msg.sender === 'user' 
              ? 'bg-[var(--brand)] text-[var(--ink)] ml-auto' 
              : 'bg-[var(--surface)] text-[var(--ink)] mr-auto'
          }`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="p-3 bg-[var(--surface)] rounded-lg max-w-xs">Typing...</div>}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--line)] flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-2 bg-[var(--surface)] rounded-l-md focus:outline-none"
          disabled={isLoading}
        />
        <button type="submit" className="px-4 py-2 bg-[var(--brand)] rounded-r-md" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbot;