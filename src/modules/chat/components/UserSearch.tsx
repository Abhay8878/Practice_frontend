/**
 * @file UserSearch.tsx
 * @description A component to search for users by email and start a new chat.
 */

import { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { chatService } from '../services/chatService';
import type { ChatUser } from '../types/chat.types';

interface UserSearchProps {
    onSelectUser: (user: ChatUser) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser, inputRef }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ChatUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Live search with debouncing
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const users = await chatService.searchUsers(query);
                setResults(users);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }, 400); // 400ms debounce to balance responsiveness and server load

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        const users = await chatService.searchUsers(query);
        setResults(users);
        setIsSearching(false);
    };

    return (
        <div>
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        ref={inputRef as any}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search labs by name or email..."
                        className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand outline-none transition-all shadow-sm"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {isSearching && (
                        <div className="absolute right-3 top-2.5">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                    )}
                </div>
            </form>

            {results.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {results.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => {
                                onSelectUser(user);
                                setResults([]);
                                setQuery('');
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-brand/5 dark:hover:bg-brand/10 rounded-lg transition-colors text-left"
                        >
                            <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">New</span>
                                <div className="flex items-center gap-1 text-xs text-brand font-medium">
                                    <span>Chat</span>
                                    <UserPlus className="h-4 w-4" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {query && results.length === 0 && !isSearching && query.length > 1 && (
                <p className="mt-2 text-xs text-gray-400 text-center">No labs found matching "{query}"</p>
            )}
        </div>
    );
};

export default UserSearch;
