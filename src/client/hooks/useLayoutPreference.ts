import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'cucumber:layout-preference';

type ChatSide = 'left' | 'right';

interface LayoutPreference {
    chatSide: ChatSide;
    swapSidebars: () => void;
}

function readPreference(): ChatSide {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'left' || stored === 'right') return stored;
    } catch {
        // localStorage unavailable — use default
    }
    return 'left';
}

/**
 * Manages sidebar layout preference with localStorage persistence.
 *
 * Default: Chat on the left, Data on the right.
 * User can swap via the header toggle button.
 */
export function useLayoutPreference(): LayoutPreference {
    const [chatSide, setChatSide] = useState<ChatSide>(readPreference);

    const swapSidebars = useCallback(() => {
        setChatSide(prev => {
            const next = prev === 'left' ? 'right' : 'left';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // silent — preference just won't persist
            }
            return next;
        });
    }, []);

    // Sync across tabs via storage event
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && (e.newValue === 'left' || e.newValue === 'right')) {
                setChatSide(e.newValue);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return { chatSide, swapSidebars };
}
