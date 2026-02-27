/**
 * @file MessageList.tsx
 * @description Renders a list of chat messages.
 */

import React, { useEffect, useRef } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage } from '../types/chat.types';
import { normalizeDate } from '../services/chatService';

interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-950"
        >
            {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                    No messages yet. Say hi!
                </div>
            ) : (
                messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                    ? 'bg-brand text-white rounded-tr-none'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <p
                                        className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-500'}`}
                                    >
                                        {normalizeDate(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {isMe && (
                                        <div className="flex">
                                            {msg.isRead ? (
                                                <CheckCheck className="h-3 w-3 text-blue-300" />
                                            ) : (
                                                <Check className="h-3 w-3 text-gray-300" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MessageList;
