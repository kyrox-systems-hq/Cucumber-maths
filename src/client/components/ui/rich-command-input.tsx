import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@client/lib/utils';

/* ─── Command catalogue ─── */

export interface CommandItem {
    id: string;
    label: string;
    description: string;
    category: string;
    insert: string;        // what gets inserted as styled token text
}

const CQL_COMMANDS: CommandItem[] = [
    { id: 'sum', label: 'SUM', description: 'Sum numeric values', category: 'Aggregate', insert: 'SUM()' },
    { id: 'count', label: 'COUNT', description: 'Count records', category: 'Aggregate', insert: 'COUNT()' },
    { id: 'avg', label: 'AVG', description: 'Average value', category: 'Aggregate', insert: 'AVG()' },
    { id: 'min', label: 'MIN', description: 'Minimum value', category: 'Aggregate', insert: 'MIN()' },
    { id: 'max', label: 'MAX', description: 'Maximum value', category: 'Aggregate', insert: 'MAX()' },
    { id: 'where', label: 'WHERE', description: 'Filter rows', category: 'Filter', insert: 'WHERE ' },
    { id: 'group-by', label: 'GROUP BY', description: 'Group results by field', category: 'Group', insert: 'GROUP BY ' },
    { id: 'order-by', label: 'ORDER BY', description: 'Sort results', category: 'Sort', insert: 'ORDER BY ' },
    { id: 'join', label: 'JOIN', description: 'Join two data sources', category: 'Join', insert: 'JOIN ' },
    { id: 'pivot', label: 'PIVOT', description: 'Pivot table transformation', category: 'Transform', insert: 'PIVOT ' },
    { id: 'select', label: 'SELECT', description: 'Select specific columns', category: 'Query', insert: 'SELECT ' },
    { id: 'distinct', label: 'DISTINCT', description: 'Remove duplicates', category: 'Filter', insert: 'DISTINCT ' },
    { id: 'create-table', label: 'CREATE TABLE', description: 'Create a new data table', category: 'DDL', insert: 'CREATE TABLE ' },
    { id: 'compute', label: 'COMPUTE', description: 'Run computation chain', category: 'Transform', insert: 'COMPUTE ' },
];

const DATA_REFERENCES: CommandItem[] = [
    { id: 'ref-revenue', label: 'revenue', description: 'Total revenue', category: 'Metrics', insert: 'revenue' },
    { id: 'ref-customers', label: 'customers', description: 'Customer records table', category: 'Tables', insert: 'customers' },
    { id: 'ref-orders', label: 'orders', description: 'Orders table', category: 'Tables', insert: 'orders' },
    { id: 'ref-products', label: 'products', description: 'Products catalogue', category: 'Tables', insert: 'products' },
    { id: 'ref-region', label: 'region', description: 'Geographic region field', category: 'Fields', insert: 'region' },
    { id: 'ref-quarter', label: 'quarter', description: 'Fiscal quarter', category: 'Fields', insert: 'quarter' },
    { id: 'ref-category', label: 'product_category', description: 'Product category field', category: 'Fields', insert: 'product_category' },
    { id: 'ref-churn', label: 'churn_rate', description: 'Customer churn rate metric', category: 'Metrics', insert: 'churn_rate' },
    { id: 'ref-last-order', label: 'last_order_date', description: 'Date of last order', category: 'Fields', insert: 'last_order_date' },
    { id: 'ref-sales', label: 'sales', description: 'Sales records table', category: 'Tables', insert: 'sales' },
];

/* ─── Props ─── */

export interface RichCommandInputProps {
    /** Called whenever the text content changes (plain text with embedded tokens) */
    onChange?: (text: string) => void;
    /** Placeholder shown when the editor is empty */
    placeholder?: string;
    /** Additional CSS classes on the outer wrapper */
    className?: string;
    /** Additional CSS classes on the contenteditable area */
    editorClassName?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Keyboard shortcut handler — receives the KeyboardEvent for custom dispatch */
    onKeyDown?: (e: React.KeyboardEvent) => void;
    /** Whether to auto-focus */
    autoFocus?: boolean;
    /** Minimum height CSS value */
    minHeight?: string;
    /** Ref forwarding for the contenteditable div */
    editorRef?: React.RefObject<HTMLDivElement | null>;
}

/* ─── Component ─── */

export function RichCommandInput({
    onChange,
    placeholder = 'Type / for CQL commands, @ for data references…',
    className,
    editorClassName,
    disabled = false,
    onKeyDown,
    autoFocus = false,
    minHeight = '36px',
    editorRef: externalRef,
}: RichCommandInputProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    /* ─── slash / @ popup state ─── */
    const [popup, setPopup] = useState<{ type: 'slash' | 'at'; filter: string; caretRect: DOMRect | null } | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(0);

    const items = popup
        ? (popup.type === 'slash' ? CQL_COMMANDS : DATA_REFERENCES).filter(
            item => !popup.filter || item.label.toLowerCase().includes(popup.filter.toLowerCase()),
        )
        : [];

    /* ─── auto-focus ─── */
    useEffect(() => {
        if (autoFocus && ref.current) ref.current.focus();
    }, [autoFocus, ref]);

    /* ─── get caret world position ─── */
    const getCaretRect = useCallback((): DOMRect | null => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        const clientRect = range.getBoundingClientRect();
        return clientRect.width === 0 && clientRect.height === 0 ? null : clientRect;
    }, []);

    /* ─── insert styled token ─── */
    const insertToken = useCallback((item: CommandItem, triggerType: 'slash' | 'at') => {
        const el = ref.current;
        if (!el) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        // Delete backwards from caret to remove the trigger + filter text
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const text = node.textContent;
            // Find the trigger char position (searching backwards)
            const triggerChar = triggerType === 'slash' ? '/' : '@';
            let triggerPos = -1;
            for (let i = offset - 1; i >= 0; i--) {
                if (text[i] === triggerChar) { triggerPos = i; break; }
            }
            if (triggerPos >= 0) {
                // Delete from trigger to current offset
                node.textContent = text.slice(0, triggerPos) + text.slice(offset);
                // Set caret at triggerPos
                range.setStart(node, triggerPos);
                range.setEnd(node, triggerPos);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

        // Create the styled token span
        const span = document.createElement('span');
        span.className = 'cql-token';
        span.contentEditable = 'false';
        span.setAttribute('data-cql', item.id);
        span.textContent = item.insert;

        // Insert span at caret
        const insertRange = sel.getRangeAt(0);
        insertRange.insertNode(span);

        // Add a trailing space after the token so the user can keep typing
        const space = document.createTextNode('\u00A0');
        span.parentNode?.insertBefore(space, span.nextSibling);

        // Move caret after the space
        const newRange = document.createRange();
        newRange.setStartAfter(space);
        newRange.setEndAfter(space);
        sel.removeAllRanges();
        sel.addRange(newRange);

        setPopup(null);
        setSelectedIdx(0);

        // Fire change
        if (onChange && el.textContent) {
            onChange(el.textContent);
        }
    }, [ref, onChange]);

    /* ─── input handler — detect trigger chars ─── */
    const handleInput = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        // Notify parent of content change
        const text = el.innerText || '';
        onChange?.(text);

        // Check if we're in a trigger context
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;

        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const textBefore = node.textContent.slice(0, offset);

            // Check for / trigger
            const slashMatch = textBefore.match(/\/([a-zA-Z ]*)$/);
            if (slashMatch) {
                const caretRect = getCaretRect();
                setPopup({ type: 'slash', filter: slashMatch[1], caretRect });
                setSelectedIdx(0);
                return;
            }

            // Check for @ trigger
            const atMatch = textBefore.match(/@([a-zA-Z_]*)$/);
            if (atMatch) {
                const caretRect = getCaretRect();
                setPopup({ type: 'at', filter: atMatch[1], caretRect });
                setSelectedIdx(0);
                return;
            }
        }

        // No trigger context — close popup
        setPopup(null);
    }, [ref, onChange, getCaretRect]);

    /* ─── key handler (arrow nav + enter selection) ─── */
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (popup && items.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIdx(prev => (prev + 1) % items.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIdx(prev => (prev - 1 + items.length) % items.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertToken(items[selectedIdx], popup.type);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setPopup(null);
                return;
            }
        }

        // Forward to parent handler
        onKeyDown?.(e);
    }, [popup, items, selectedIdx, insertToken, onKeyDown]);

    /* ─── popup position ─── */
    const popupStyle: React.CSSProperties | undefined = popup?.caretRect && ref.current
        ? (() => {
            const containerRect = ref.current.getBoundingClientRect();
            return {
                position: 'fixed' as const,
                left: popup.caretRect.left,
                top: popup.caretRect.bottom + 4,
                zIndex: 100,
            };
        })()
        : popup
            ? { position: 'absolute' as const, bottom: '100%', left: 0, marginBottom: 4, zIndex: 100 }
            : undefined;

    return (
        <div className={cn('relative', className)}>
            {/* contenteditable editor */}
            <div
                ref={ref as React.RefObject<HTMLDivElement>}
                contentEditable={!disabled}
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
                className={cn(
                    'rich-command-input',
                    'outline-none text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words',
                    'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 empty:before:pointer-events-none',
                    disabled && 'opacity-40 pointer-events-none',
                    editorClassName,
                )}
                style={{ minHeight }}
            />

            {/* Popup */}
            {popup && items.length > 0 && (
                <div
                    style={popupStyle}
                    className="w-[260px] max-h-[240px] overflow-y-auto rounded-lg border border-border bg-popover shadow-xl py-1"
                >
                    <div className="px-2.5 py-1.5 border-b border-border/30">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {popup.type === 'slash' ? 'CQL Commands' : 'Data References'}
                        </span>
                    </div>
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            onMouseDown={e => { e.preventDefault(); insertToken(item, popup.type); }}
                            className={cn(
                                'w-full text-left px-2.5 py-1.5 flex items-start gap-2 transition-colors',
                                i === selectedIdx ? 'bg-accent' : 'hover:bg-accent/50',
                            )}
                        >
                            <span className={cn(
                                'shrink-0 text-[11px] font-mono font-semibold mt-0.5',
                                popup.type === 'slash' ? 'text-primary' : 'text-cyan-400',
                            )}>
                                {item.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-tight">
                                {item.description}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
