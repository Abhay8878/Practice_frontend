/**
 * @file chat.types.ts
 * @description Defines the core data structures for the decoupled chat module.
 * Being decoupled means these types are generic and can represent users and messages
 * from any part of the application.
 */

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date | string;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  participant: ChatUser;
  lastMessage?: ChatMessage;
  unreadCount: number;
}
