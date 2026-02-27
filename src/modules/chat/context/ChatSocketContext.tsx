import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserActivity } from '../../../hooks/useUserActivity';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ChatSocketContextType {
    socket: Socket | null;
    userStatuses: Record<string, 'online' | 'offline'>;
}

const ChatSocketContext = createContext<ChatSocketContextType | undefined>(undefined);

export const ChatSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userStatuses, setUserStatuses] = useState<Record<string, 'online' | 'offline'>>({});
    const userId = localStorage.getItem('userId');

    // Memoized status update handler
    const handleStatusChange = useCallback((status: 'online' | 'offline') => {
        if (socket && userId) {
            console.log(`[Presence] Emitting status: ${status}`);
            socket.emit('updateStatus', { userId, status });
        }
    }, [socket, userId]);

    useUserActivity(handleStatusChange);

    useEffect(() => {
        if (!userId || userId === 'undefined' || userId === 'null') return;

        const newSocket = io(SOCKET_URL, {
            query: { userId },
        });

        setSocket(newSocket);

        // Initial status broadcast
        newSocket.on('connect', () => {
            newSocket.emit('updateStatus', { userId, status: 'online' });
        });

        // Listen for current statuses upon connecting
        newSocket.on('initialUserStatuses', (statuses: Record<string, 'online' | 'offline'>) => {
            console.log('[Presence] Received initial statuses:', statuses);
            setUserStatuses(prev => ({
                ...prev,
                ...statuses
            }));
        });

        // Listen for status changes from other users (including cross-portal)
        newSocket.on('userStatusChanged', (data: { userId: string, status: 'online' | 'offline' }) => {
            console.log(`[Presence] User ${data.userId} status changed to ${data.status}`);
            setUserStatuses(prev => ({
                ...prev,
                [data.userId]: data.status
            }));
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    return (
        <ChatSocketContext.Provider value={{ socket, userStatuses }}>
            {children}
        </ChatSocketContext.Provider>
    );
};

export const useChatSocket = () => {
    const context = useContext(ChatSocketContext);
    if (context === undefined) {
        throw new Error('useChatSocket must be used within a ChatSocketProvider');
    }
    return context;
};
