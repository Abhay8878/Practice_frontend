import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect user activity and manage idle state globally.
 */
export const useUserActivity = (
    onStatusChange: (status: 'online' | 'offline') => void,
    idleTimeoutMs: number = 120000 // 2 minutes default
) => {
    const statusRef = useRef<'online' | 'offline'>('online');
    const timeoutRef = useRef<any>(null);

    const setStatus = useCallback((newStatus: 'online' | 'offline') => {
        if (statusRef.current !== newStatus) {
            statusRef.current = newStatus;
            console.log(`[Activity] Status changed to ${newStatus}`);
            onStatusChange(newStatus);
        }
    }, [onStatusChange]);

    const resetTimer = useCallback(() => {
        // If we were offline/idle, moving again makes us online
        if (statusRef.current === 'offline') {
            setStatus('online');
        }

        // Clear existing timer
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Start new timer
        timeoutRef.current = setTimeout(() => {
            setStatus('offline');
        }, idleTimeoutMs);
    }, [idleTimeoutMs, setStatus]);

    useEffect(() => {
        // Initial timer start
        resetTimer();

        // Events to track
        const events = [
            'mousemove',
            'mousedown',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return {
        currentStatus: statusRef.current,
    };
};
