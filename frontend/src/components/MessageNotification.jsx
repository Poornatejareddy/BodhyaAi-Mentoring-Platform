import React, { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

function MessageNotification({ message, onClose, onClick }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed top-20 right-4 z-50 bg-[var(--surface)]   text-[var(--ink)] rounded-lg shadow-2xl p-4 max-w-sm cursor-pointer transform transition-all duration-300 ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                }`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                <div className="bg-[var(--surface)] p-2 rounded-full flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="font-semibold text-sm">{message.senderName}</p>
                            <p className="text-[var(--ink)] text-sm mt-1 line-clamp-2">
                                {message.content}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="flex-shrink-0 hover:bg-[var(--surface)] rounded p-1 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-[var(--ink)] mt-2">Click to view message</p>
                </div>
            </div>
        </div>
    );
}

export default MessageNotification;
