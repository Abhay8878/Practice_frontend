/**
 * @file chatService.ts
 * @description Provides methods to interact with the chat backend.
 * This service is responsible for searching users, fetching threads, and sending/receiving messages.
 * Using a service class makes the UI components decoupled from the actual API implementation.
 */

import type { ChatUser, ChatMessage, ChatThread } from '../types/chat.types';

/**
 * Normalizes date inputs to ensure they are treated as UTC if missing timezone info.
 * This prevents the "UTC-as-local" display bug.
 */
export const normalizeDate = (dateInput: any): Date => {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === 'number') return new Date(dateInput);

    if (typeof dateInput === 'string') {
        // If it already has Z or offset, browser will handle it correctly
        if (dateInput.includes('Z') || dateInput.includes('+')) {
            return new Date(dateInput);
        }

        // For raw database strings missing 'Z' (e.g., "2026-02-23 19:47:00"), 
        // we force it to ISO format and append 'Z' to treat it as UTC.
        let normalized = dateInput.trim().replace(' ', 'T');
        if (normalized.includes(':') && !normalized.includes('Z')) {
            normalized += 'Z';
        }

        const date = new Date(normalized);
        if (!isNaN(date.getTime())) return date;
    }

    return new Date(dateInput);
};

// In a real application, this would use axios or fetch to call the backend
class ChatService {
    private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    private getHeaders() {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        return {
            'Authorization': `Bearer ${token}`,
            'x-user-id': userId || '', // 👈 Crucial for backend to identify user without real JWT
            'Content-Type': 'application/json'
        };
    }

    /**
     * Searches for Lab users by email or name.
     * Only users with practitionerType 'Lab' will be returned.
     * @param query The search query (email or name).
     * @returns A promise that resolves to an array of matching ChatUsers.
     */
    async searchUsers(query: string): Promise<ChatUser[]> {
        try {
            const response = await fetch(`${this.baseUrl}/users/search?query=${query}&practitionerType=Lab`, {
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to search users');
            const result = await response.json();
            const data = result.data ?? result;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }

    /**
     * Fetches all chat threads for the current user.
     * @returns A promise that resolves to an array of ChatThreads.
     */
    async getThreads(): Promise<ChatThread[]> {
        try {
            const response = await fetch(`${this.baseUrl}/chat/threads`, {
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch threads');
            const result = await response.json();
            const data = result.data ?? result;

            if (Array.isArray(data)) {
                return data.map(thread => ({
                    ...thread,
                    lastMessage: thread.lastMessage ? {
                        ...thread.lastMessage,
                        timestamp: normalizeDate(thread.lastMessage.timestamp || (thread.lastMessage as any).createdAt)
                    } : undefined
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching threads:', error);
            return [];
        }
    }

    /**
     * Fetches the message history between the current user and another user.
     * @param recipientId The ID of the other user.
     * @returns A promise that resolves to an array of ChatMessages.
     */
    async getMessages(recipientId: string): Promise<ChatMessage[]> {
        try {
            const response = await fetch(`${this.baseUrl}/chat/messages/${recipientId}`, {
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const result = await response.json();
            const data = result.data ?? result;

            if (Array.isArray(data)) {
                return data.map(msg => ({
                    ...msg,
                    timestamp: normalizeDate(msg.timestamp || (msg as any).createdAt)
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    /**
     * Sends a message to a recipient.
     * @param recipientId The ID of the user to send the message to.
     * @param content The text content of the message.
     * @returns A promise that resolves to the sent ChatMessage.
     */
    async sendMessage(recipientId: string, content: string): Promise<ChatMessage | null> {
        try {
            const response = await fetch(`${this.baseUrl}/chat/send`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ recipientId, content })
            });
            if (!response.ok) throw new Error('Failed to send message');
            const result = await response.json();
            return result.data ?? result;
        } catch (error) {
            console.error('Error sending message:', error);
            return null;
        }
    }

    /**
     * Marks all messages in a conversation as read.
     * @param participantId The ID of the participant whose messages are being read.
     */
    async markConversationAsRead(participantId: string): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/chat/conversations/${participantId}/read`, {
                method: 'PATCH',
                headers: this.getHeaders()
            });
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    }
}

export const chatService = new ChatService();
