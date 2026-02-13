import { MessageSquare, Send, Code2, Sparkles, Clock, BookOpen } from 'lucide-react';
import { cn } from '@client/lib/utils';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/components/ui/tabs';

/* ─── types & mock data ─── */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    code?: string;
    engine?: string;
}

const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        role: 'user',
        content: 'Show me revenue by region for Q4',
    },
    {
        id: '2',
        role: 'assistant',
        content: 'Here\'s the revenue breakdown by region for Q4. APAC leads at $2.4M with 34% YoY growth.',
        code: 'SELECT region, SUM(revenue) as total\nFROM sales_q4\nGROUP BY region\nORDER BY total DESC',
        engine: 'tabular',
    },
    {
        id: '3',
        role: 'user',
        content: 'What\'s driving the EMEA decline?',
    },
    {
        id: '4',
        role: 'assistant',
        content: 'The EMEA decline (-12%) correlates with the October pricing restructure. Enterprise segment dropped 23% while SMB remained flat.',
        engine: 'narrative',
    },
];

const SUGGESTIONS = [
    'Compare regions YoY',
    'Forecast Q1',
    'Drill into APAC',
    'Export table',
];

const MOCK_HISTORY = [
    { id: '1', title: 'Revenue by region analysis', date: '2 hours ago', messages: 4 },
    { id: '2', title: 'Customer segmentation', date: 'Yesterday', messages: 12 },
    { id: '3', title: 'EMEA deep-dive', date: '2 days ago', messages: 8 },
    { id: '4', title: 'Quarterly KPI dashboard', date: '3 days ago', messages: 15 },
];

/* ─── main component ─── */

interface ChatPanelProps {
    className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
    const [input, setInput] = useState('');

    return (
        <div className={cn('flex flex-col h-full bg-card overflow-hidden', className)}>
            <Tabs defaultValue="chat" className="flex flex-col h-full">
                {/* Tab header */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0">
                    <TabsList className="h-7 bg-transparent p-0 gap-0.5">
                        <TabsTrigger
                            value="chat"
                            className="h-6 px-2 text-[11px] rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="h-6 px-2 text-[11px] rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Clock className="h-3 w-3 mr-1" />
                            History
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Chat tab — existing chat interface */}
                <TabsContent value="chat" className="flex-1 mt-0 flex flex-col overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {MOCK_MESSAGES.map(msg => (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex flex-col gap-1.5',
                                    msg.role === 'user' ? 'items-end' : 'items-start',
                                )}
                            >
                                {/* Bubble */}
                                <div
                                    className={cn(
                                        'max-w-[85%] rounded-[10px] px-3 py-2 text-xs leading-relaxed',
                                        msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground',
                                    )}
                                >
                                    {msg.content}
                                </div>

                                {/* Code transparency — ledger styling */}
                                {msg.code && (
                                    <div className="max-w-[85%] rounded-[10px] bg-[--ledger-bg] border border-[--ledger-border] p-2.5 overflow-x-auto">
                                        <div className="flex items-center gap-1 mb-1.5">
                                            <Code2 className="h-3 w-3 text-muted-foreground" />
                                            {msg.engine && (
                                                <span className="inline-flex items-center rounded-md border border-border px-1 py-0.5 text-[9px] text-muted-foreground">
                                                    {msg.engine}
                                                </span>
                                            )}
                                        </div>
                                        <pre className="text-[11px] font-mono text-[--code] leading-relaxed whitespace-pre">
                                            {msg.code}
                                        </pre>
                                    </div>
                                )}

                                {/* Engine badge (when no code) */}
                                {!msg.code && msg.engine && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        {msg.engine}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Suggestions */}
                    <div className="px-3 pb-1.5 flex flex-wrap gap-1 shrink-0">
                        {SUGGESTIONS.map(s => (
                            <button
                                key={s}
                                className="inline-flex items-center rounded-[10px] border border-border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors duration-150"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="px-3 pb-3 shrink-0">
                        <div className="flex items-center gap-2 rounded-[10px] border border-border bg-background px-3 py-2 focus-within:border-primary/50 transition-colors duration-150">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask anything about your data…"
                                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                            />
                            <button
                                className={cn(
                                    'p-1 rounded-md transition-colors duration-150',
                                    input.trim()
                                        ? 'text-primary hover:bg-primary/10'
                                        : 'text-muted-foreground/40 cursor-default',
                                )}
                                disabled={!input.trim()}
                            >
                                <Send className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </TabsContent>

                {/* History tab */}
                <TabsContent value="history" className="flex-1 mt-0 overflow-y-auto">
                    <div className="px-3 pt-3 pb-2">
                        <div className="flex items-center gap-1.5 mb-3 px-1">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Recent Conversations
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            {MOCK_HISTORY.map(item => (
                                <button
                                    key={item.id}
                                    className="w-full flex items-start gap-2.5 px-2 py-2 rounded-md text-left hover:bg-accent transition-colors duration-150"
                                >
                                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">{item.title}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {item.date} · {item.messages} messages
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
