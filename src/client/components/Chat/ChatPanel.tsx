import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Sparkles, Code2, ChevronDown } from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { ScrollArea } from '@client/components/ui/scroll-area';
import { Badge } from '@client/components/ui/badge';
import { cn } from '@client/lib/utils';

/* ─────────────────────────────────────────────
 * ChatPanel — Chat interface with streaming support
 * Left pane of the main split layout
 * ───────────────────────────────────────────── */

const SUGGESTIONS = [
    "Show total revenue by region",
    "What's the average order value?",
    "Find all rows with missing data",
    "Plot revenue trends over time",
    "Clean this dataset — remove nulls and duplicates",
];

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    engine?: string;
    code?: string;
}

// Mock messages for visual design
const MOCK_MESSAGES: Message[] = [
    {
        id: '1', role: 'user', content: 'Show total revenue by region',
        timestamp: Date.now() - 60000,
    },
    {
        id: '2', role: 'assistant',
        content: 'Here\'s the revenue breakdown by region. APAC leads with $2.4M (+34% YoY), while EMEA shows a 12% decline. I\'ve created a bar chart on the canvas.',
        timestamp: Date.now() - 55000,
        engine: 'tabular',
        code: 'SELECT region, SUM(revenue) as total\nFROM sales_q4\nGROUP BY region\nORDER BY total DESC',
    },
];

interface ChatPanelProps {
    className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSuggestion = (s: string) => {
        setInput(s);
        inputRef.current?.focus();
    };

    return (
        <div className={cn('flex flex-col h-full bg-card', className)}>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Chat</span>
                </div>
                <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
                    GPT-4o mini
                </Badge>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="p-4 space-y-4">
                    {/* Welcome state */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Ask anything about your data</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                Upload a dataset, then ask questions in plain English. Or type CQL.
                            </p>
                        </div>
                    )}

                    {/* Message list */}
                    {messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                </div>
            </ScrollArea>

            {/* Suggestions */}
            {showSuggestions && messages.length <= 2 && (
                <div className="px-3 pb-2">
                    <div className="flex flex-wrap gap-1.5">
                        {SUGGESTIONS.map(s => (
                            <button
                                key={s}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors duration-150 border border-border/50"
                                onClick={() => handleSuggestion(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border">
                <div className="flex items-end gap-2 bg-muted/50 rounded-lg border border-border/50 focus-within:border-primary/50 transition-colors p-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your data, or type CQL..."
                        className="flex-1 bg-transparent border-0 text-sm resize-none focus:outline-none min-h-[20px] max-h-[120px] placeholder:text-muted-foreground/50"
                        rows={1}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-7 w-7 shrink-0 bg-primary hover:bg-primary/90"
                        disabled={!input.trim()}
                    >
                        <Send className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </form>
        </div>
    );
}

/* ── Individual message ────────────────────────── */

function ChatMessage({ message }: { message: Message }) {
    const [showCode, setShowCode] = useState(false);
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
            <div
                className={cn(
                    'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                    isUser
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                )}
            >
                {message.content}
            </div>

            {/* Code transparency */}
            {message.code && (
                <div className="max-w-[85%]">
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1"
                    >
                        <Code2 className="h-3 w-3" />
                        <span>{message.engine} engine</span>
                        <ChevronDown className={cn('h-2.5 w-2.5 transition-transform', showCode && 'rotate-180')} />
                    </button>

                    {showCode && (
                        <div className="mt-1 rounded-lg bg-background border border-border p-2.5 overflow-x-auto">
                            <pre className="text-[11px] font-mono text-muted-foreground leading-relaxed">
                                {message.code}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
