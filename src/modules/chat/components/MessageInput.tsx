/**
 * @file MessageInput.tsx
 * @description A component to type and send messages.
 */

import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || disabled) return;

        onSendMessage(content);
        setContent('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 border-t bg-white dark:bg-gray-950 flex items-center gap-2"
        >
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                disabled={disabled}
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-brand outline-none transition-all disabled:opacity-50 text-sm"
            />
            <button
                type="submit"
                disabled={!content.trim() || disabled}
                className="h-10 w-10 flex items-center justify-center bg-brand text-white rounded-full hover:bg-brand/90 disabled:opacity-50 transition-colors shadow-sm"
            >
                <SendHorizontal className="h-5 w-5" />
            </button>
        </form>
    );
};

export default MessageInput;
