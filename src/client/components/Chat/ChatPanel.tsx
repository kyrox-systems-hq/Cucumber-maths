import { Sparkles, Code2, Send } from 'lucide-react';
import { cn } from '@client/lib/utils';
import { useState } from 'react';

/* ─────────────────────────────────────────────
 * ChatPanel — Natural language interface
 * Sits on one side of the layout (swappable)
 * ───────────────────────────────────────────── */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    code?: string;
}

const MOCK_MESSAGES: Message[] = [
    { id: '1', role: 'user', content: 'Show total revenue by region' },
    {
        id: '2',
        role: 'assistant',
        content:
            'Here\'s the revenue breakdown by region. APAC leads with $2.4M, followed by North America at $1.8M.',
        code: 'SELECT region, SUM(revenue) AS total_revenue\nFROM sales_q4\nGROUP BY region\nORDER BY total_revenue DESC',
    },
    { id: '3', role: 'user', content: 'What percentage is APAC of total?' },
    {
        id: '4',
        role: 'assistant',
        content:
            'APAC represents 35.6% of total revenue ($2.4M out of $6.75M total).',
        code: "SELECT\n  region,\n  SUM(revenue) AS total,\n  ROUND(SUM(revenue) * 100.0 / SUM(SUM(revenue)) OVER(), 1) AS pct\nFROM sales_q4\nGROUP BY region\nORDER BY pct DESC",
    },
];

const SUGGESTIONS = [
    'Show top 5 products by revenue',
    'What are the key trends?',
    'Chart revenue by month',
    'Find outliers in discount column',
];

interface ChatPanelProps {
    className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
    const [input, setInput] = useState('');
    const [expandedCode, setExpandedCode] = useState<string | null>(null);

    return (
        <div className={cn('flex flex-col h-full bg-card overflow-hidden', className)}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold">Chat</span>
                </div>
                <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                    gpt-4o-mini
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_MESSAGES.map(msg => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                        codeExpanded={expandedCode === msg.id}
                        onToggleCode={() =>
                            setExpandedCode(prev => (prev === msg.id ? null : msg.id))
                        }
                    />
                ))}
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-2 shrink-0">
                <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map(s => (
                        <button
                            key={s}
                            className="text-[11px] px-2.5 py-1 rounded-[10px] border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors duration-150"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border shrink-0">
                <div className="flex items-end gap-2 bg-elevated/50 rounded-[10px] border border-border p-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about your data…"
                        rows={1}
                        className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-h-[24px] max-h-[120px]"
                    />
                    <button
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 shrink-0"
                        aria-label="Send message"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Message bubble ──────────────────────────── */

function ChatMessage({
    message,
    codeExpanded,
    onToggleCode,
}: {
    message: Message;
    codeExpanded: boolean;
    onToggleCode: () => void;
}) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
            <div
                className={cn(
                    'max-w-[90%] rounded-[10px] px-3 py-2 text-sm leading-relaxed',
                    isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-elevated/60 text-foreground',
                )}
            >
                {message.content}
            </div>

            {/* Code transparency */}
            {message.code && !isUser && (
                <>
                    <button
                        onClick={onToggleCode}
                        className={cn(
                            'flex items-center gap-1 text-[10px] px-1 transition-colors duration-150',
                            codeExpanded ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Code2 className="h-3 w-3" />
                        {codeExpanded ? 'Hide code' : 'Show code'}
                    </button>

                    {codeExpanded && (
                        <div className="w-full max-w-[90%] rounded-[10px] bg-[#141922] border border-[rgba(255,255,255,0.05)] p-3 overflow-x-auto">
                            <pre className="text-[11px] font-mono text-[#C9D1D9] leading-relaxed whitespace-pre">
                                {message.code}
                            </pre>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
