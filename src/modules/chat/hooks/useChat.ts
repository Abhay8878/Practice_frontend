/**
 * @file useChat.ts
 * @description Custom hook for managing real-time chat messages via the global ChatSocketContext.
 * Handles receiving messages and sending them via the existing socket connection.
 */

import { useState, useEffect, useCallback } from 'react';
import { useChatSocket } from '../context/ChatSocketContext';
import type { ChatMessage } from '../types/chat.types';
import { normalizeDate } from '../services/chatService';

export const useChat = (userId: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const { socket, userStatuses } = useChatSocket();

    useEffect(() => {
        if (!socket || !userId) return;

        const handleReceiveMessage = (message: any) => {
            console.log('[Chat] Message received via socket:', message);
            const mappedMessage: ChatMessage = {
                ...message,
                timestamp: normalizeDate(message.timestamp || message.createdAt)
            };

            setMessages((prev) => {
                const exists = prev.some(m => m.id === mappedMessage.id);
                if (exists) return prev;

                const now = new Date().getTime();
                const optimisticMatchIndex = prev.findIndex(m =>
                    m.id.startsWith('temp-') &&
                    m.senderId === mappedMessage.senderId &&
                    m.receiverId === mappedMessage.receiverId &&
                    m.content === mappedMessage.content &&
                    (now - new Date(m.timestamp).getTime()) < 5000
                );

                if (optimisticMatchIndex !== -1) {
                    const updated = [...prev];
                    updated[optimisticMatchIndex] = mappedMessage;
                    return updated;
                }

                return [...prev, mappedMessage];
            });
        };

        const handleMessagesRead = (data: { readBy: string, senderId: string }) => {
            setMessages((prev) => prev.map(m =>
                (m.receiverId === data.readBy && m.senderId === userId)
                    ? { ...m, isRead: true }
                    : m
            ));
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('messagesRead', handleMessagesRead);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('messagesRead', handleMessagesRead);
        };
    }, [socket, userId]);

    const sendMessage = useCallback((receiverId: string, content: string) => {
        if (socket) {
            const optimisticMessage: ChatMessage = {
                id: `temp-${Date.now()}`,
                senderId: userId,
                receiverId,
                content,
                timestamp: new Date(),
                isRead: false,
            };
            setMessages((prev) => [...prev, optimisticMessage]);

            socket.emit('sendMessage', {
                senderId: userId,
                receiverId,
                content,
            });
        }
    }, [socket, userId]);

    const markAsRead = useCallback((otherUserId: string) => {
        if (socket && userId && otherUserId) {
            socket.emit('markAsRead', {
                userId: userId,
                senderId: otherUserId
            });
        }
    }, [socket, userId]);

    return {
        messages,
        setMessages,
        sendMessage,
        markAsRead,
        userStatuses, // From global context
    };
};
