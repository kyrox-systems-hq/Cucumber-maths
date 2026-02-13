import { useState, useEffect, useCallback } from 'react';

type ChatSide = 'left' | 'right';
const STORAGE_KEY = 'cucumber-layout-chat-side';

export function useLayoutPreference() {
    const [chatSide, setChatSide] = useState<ChatSide>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === 'right' ? 'right' : 'left';
        } catch {
            return 'left';
        }
    });

    const swapSidebars = useCallback(() => {
        setChatSide(prev => {
            const next = prev === 'left' ? 'right' : 'left';
            try { localStorage.setItem(STORAGE_KEY, next); } catch { }
            return next;
        });
    }, []);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && (e.newValue === 'left' || e.newValue === 'right')) {
                setChatSide(e.newValue);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return { chatSide, swapSidebars } as const;
}
