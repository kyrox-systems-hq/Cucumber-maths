import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { ChatMessage, CanvasBlock } from '@shared/types';

/* ══════════════════════════════════════════════
 * 🥒 Cucumber Maths — App Shell
 * Split-pane: Chat + Canvas
 * ══════════════════════════════════════════════ */

// ── Suggestion chips shown on empty state ────
const SUGGESTIONS = [
    "What's 15% tip on $47.50?",
    'Upload a CSV and show summary stats',
    'Plot y = sin(x) from 0 to 2π',
    'Calculate compound interest on $10,000 at 5% for 10 years',
    'Explain standard deviation in simple terms',
];

export function App() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate agent response (will be replaced with real agent call)
        setTimeout(() => {
            const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: getSimulatedResponse(userMessage.content),
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Add a demo block to canvas
            const newBlock = createDemoBlock(userMessage.content);
            if (newBlock) {
                setBlocks(prev => [...prev, newBlock]);
            }

            setIsLoading(false);
        }, 1200);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    return (
        <div className="app">
            {/* ── Header ──────────────────────────── */}
            <header className="header">
                <div className="header__logo">
                    <span className="header__logo-icon">🥒</span>
                    <span>Cucumber Maths</span>
                </div>
                <div className="header__workspace">
                    <span>Workspace</span>
                </div>
            </header>

            {/* ── Main: Sidebar + Chat + Canvas ──── */}
            <main className="main">
                {/* Sidebar */}
                <nav className="sidebar">
                    <button className="sidebar__btn sidebar__btn--active" title="Chat">💬</button>
                    <button className="sidebar__btn" title="Datasets">📁</button>
                    <button className="sidebar__btn" title="History">🕐</button>
                </nav>

                {/* Chat Panel */}
                <aside className="chat-panel">
                    <div className="chat-panel__header">Chat</div>

                    <div className="chat-panel__messages">
                        {messages.length === 0 ? (
                            <div className="chat-panel__empty">
                                <span className="chat-panel__empty-icon">🥒</span>
                                <span className="chat-panel__empty-title">Cucumber Maths</span>
                                <span className="chat-panel__empty-hint">
                                    Ask anything — from basic arithmetic to advanced scientific modeling.
                                    Agents run the engines, you see the results.
                                </span>
                                <div className="suggestions">
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            className="suggestion-chip"
                                            onClick={() => handleSuggestionClick(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map(msg => (
                                    <div key={msg.id} className={`message message--${msg.role}`}>
                                        <div className="message__bubble">{msg.content}</div>
                                        <span className="message__time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="message message--assistant">
                                        <div className="message__bubble">
                                            <div className="pulse">
                                                <span className="pulse__dot" />
                                                <span className="pulse__dot" />
                                                <span className="pulse__dot" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    <div className="chat-input">
                        <form className="chat-input__form" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                className="chat-input__field"
                                placeholder="Ask anything..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="chat-input__send"
                                disabled={!input.trim() || isLoading}
                            >
                                ↑
                            </button>
                        </form>
                    </div>
                </aside>

                {/* Canvas */}
                <section className="canvas">
                    {blocks.length === 0 ? (
                        <div className="canvas__empty">
                            <span className="canvas__empty-icon">📊</span>
                            <span className="canvas__empty-title">Your workspace is empty</span>
                            <span className="canvas__empty-subtitle">
                                Start a conversation and results will appear here — tables, charts, equations, insights, and more.
                            </span>
                        </div>
                    ) : (
                        blocks.map(block => (
                            <div key={block.id} className="block">
                                <div className="block__header">
                                    <div className="block__title">
                                        <span className="block__title-icon">{getBlockIcon(block.type)}</span>
                                        <span>{block.title}</span>
                                    </div>
                                    <div className="block__actions">
                                        <button className="block__action-btn" title="Show code">{'</>'}</button>
                                        <button className="block__action-btn" title="Ask about this">💬</button>
                                    </div>
                                </div>
                                <div className="block__body">
                                    {renderBlockContent(block)}
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

// ── Helpers ────────────────────────────────────

function getBlockIcon(type: string): string {
    const icons: Record<string, string> = {
        table: '🗄️', chart: '📈', metric: '🔢',
        equation: '∑', narrative: '📝', code: '💻',
        model: '📊', simulation: '🎲',
    };
    return icons[type] || '📋';
}

function renderBlockContent(block: CanvasBlock): JSX.Element {
    switch (block.type) {
        case 'metric': {
            const data = block.content as { value: string; trend: string; direction: 'up' | 'down' };
            return (
                <div className="metric-block">
                    <span className="metric-block__value">{data.value}</span>
                    <span className={`metric-block__trend metric-block__trend--${data.direction}`}>
                        {data.direction === 'up' ? '↑' : '↓'} {data.trend}
                    </span>
                </div>
            );
        }
        case 'equation': {
            const eq = block.content as string;
            return <div className="equation-block">{eq}</div>;
        }
        case 'narrative': {
            const text = block.content as string;
            return <div className="narrative-block"><p>{text}</p></div>;
        }
        case 'table': {
            const tableData = block.content as { headers: string[]; rows: string[][] };
            return (
                <div className="table-block">
                    <table>
                        <thead>
                            <tr>{tableData.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {tableData.rows.map((row, ri) => (
                                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        default:
            return <div className="narrative-block"><p>{String(block.content)}</p></div>;
    }
}

// ── Simulated responses (placeholder until agents are wired) ──

function getSimulatedResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('tip') || lower.includes('%')) {
        return 'The tip is $7.13, making the total $54.63. I\'ve added the calculation to your canvas.';
    }
    if (lower.includes('csv') || lower.includes('upload')) {
        return 'Ready for your CSV! Drag a file onto the upload zone, or I can work with the data you describe.';
    }
    if (lower.includes('sin') || lower.includes('cos') || lower.includes('plot')) {
        return 'I\'ve plotted the function on your canvas. The Numerical Engine computed 500 sample points and the Visualization Engine rendered the chart.';
    }
    if (lower.includes('compound') || lower.includes('interest')) {
        return 'After 10 years at 5% annual compound interest, $10,000 becomes $16,288.95. That\'s $6,288.95 in interest earned. Added to your canvas.';
    }
    if (lower.includes('standard deviation')) {
        return 'Standard deviation measures how spread out numbers are from their average. If your test scores are 80, 85, 90, 95, 100 — the mean is 90 and the standard deviation is about 7.07, meaning most scores fall within ~7 points of the average.';
    }
    return 'I understand your request. In the full version, I\'d route this to the appropriate compute engine and display results on your canvas. The engine registry supports: Tabular, Statistical, Numerical, Symbolic, Simulation, Visualization, and Narrative engines.';
}

function createDemoBlock(input: string): CanvasBlock | null {
    const lower = input.toLowerCase();

    if (lower.includes('tip') || lower.includes('%')) {
        return {
            id: crypto.randomUUID(),
            type: 'metric',
            title: 'Tip Calculation',
            content: { value: '$7.13', trend: 'Total: $54.63', direction: 'up' },
            position: { x: 0, y: 0 },
            size: { width: 300, height: 120 },
            createdAt: Date.now(),
        };
    }

    if (lower.includes('compound') || lower.includes('interest')) {
        return {
            id: crypto.randomUUID(),
            type: 'table',
            title: 'Compound Interest — $10,000 at 5%',
            content: {
                headers: ['Year', 'Balance', 'Interest Earned'],
                rows: [
                    ['1', '$10,500.00', '$500.00'],
                    ['2', '$11,025.00', '$525.00'],
                    ['5', '$12,762.82', '$1,340.10'],
                    ['10', '$16,288.95', '$1,551.33'],
                ],
            },
            position: { x: 0, y: 0 },
            size: { width: 500, height: 250 },
            createdAt: Date.now(),
        };
    }

    if (lower.includes('standard deviation')) {
        return {
            id: crypto.randomUUID(),
            type: 'equation',
            title: 'Standard Deviation Formula',
            content: 'σ = √[ Σ(xᵢ - μ)² / N ]',
            position: { x: 0, y: 0 },
            size: { width: 400, height: 100 },
            createdAt: Date.now(),
        };
    }

    if (lower.includes('sin') || lower.includes('plot')) {
        return {
            id: crypto.randomUUID(),
            type: 'narrative',
            title: 'Plot: y = sin(x)',
            content: 'Chart visualization will render here once the Visualization Engine is connected. The Numerical Engine would compute 500 sample points from 0 to 2π, and D3.js would render the interactive plot.',
            position: { x: 0, y: 0 },
            size: { width: 600, height: 300 },
            createdAt: Date.now(),
        };
    }

    return null;
}
