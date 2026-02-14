import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@client/lib/utils';

/* ─── Command catalogue ─── */

export interface CommandItem {
    id: string;
    label: string;
    description: string;
    category: string;
    insert: string;        // what gets inserted as styled token text
    hasArgs?: boolean;      // if true, insert opens with ( and user types args, then closes with )
}

const CQL_COMMANDS: CommandItem[] = [
    { id: 'sum', label: 'SUM', description: 'Sum numeric values', category: 'Aggregate', insert: 'SUM', hasArgs: true },
    { id: 'count', label: 'COUNT', description: 'Count records', category: 'Aggregate', insert: 'COUNT', hasArgs: true },
    { id: 'avg', label: 'AVG', description: 'Average value', category: 'Aggregate', insert: 'AVG', hasArgs: true },
    { id: 'min', label: 'MIN', description: 'Minimum value', category: 'Aggregate', insert: 'MIN', hasArgs: true },
    { id: 'max', label: 'MAX', description: 'Maximum value', category: 'Aggregate', insert: 'MAX', hasArgs: true },
    { id: 'where', label: 'WHERE', description: 'Filter rows', category: 'Filter', insert: 'WHERE' },
    { id: 'group-by', label: 'GROUP BY', description: 'Group results by field', category: 'Group', insert: 'GROUP BY' },
    { id: 'order-by', label: 'ORDER BY', description: 'Sort results', category: 'Sort', insert: 'ORDER BY' },
    { id: 'join', label: 'JOIN', description: 'Join two data sources', category: 'Join', insert: 'JOIN' },
    { id: 'pivot', label: 'PIVOT', description: 'Pivot table transformation', category: 'Transform', insert: 'PIVOT' },
    { id: 'select', label: 'SELECT', description: 'Select specific columns', category: 'Query', insert: 'SELECT' },
    { id: 'distinct', label: 'DISTINCT', description: 'Remove duplicates', category: 'Filter', insert: 'DISTINCT' },
    { id: 'create-table', label: 'CREATE TABLE', description: 'Create a new data table', category: 'DDL', insert: 'CREATE TABLE' },
    { id: 'compute', label: 'COMPUTE', description: 'Run computation chain', category: 'Transform', insert: 'COMPUTE' },
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
    /** Called whenever the text content changes */
    onChange?: (text: string) => void;
    /** Placeholder shown when the editor is empty */
    placeholder?: string;
    /** Additional CSS classes on the outer wrapper */
    className?: string;
    /** Additional CSS classes on the contenteditable area */
    editorClassName?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Keyboard shortcut handler */
    onKeyDown?: (e: React.KeyboardEvent) => void;
    /** Whether to auto-focus */
    autoFocus?: boolean;
    /** Minimum height CSS value */
    minHeight?: string;
    /** Ref forwarding for the contenteditable div */
    editorRef?: React.RefObject<HTMLDivElement | null>;
    /** Direction the popup opens: 'up' = above input (for bottom-of-screen), 'down' = below (for top-of-screen) */
    popupDirection?: 'up' | 'down';
    /** If true, only CQL is allowed — every keystroke shows the command picker if not in an expression. No free prose. */
    cqlOnly?: boolean;
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
    popupDirection = 'down',
    cqlOnly = false,
}: RichCommandInputProps) {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = externalRef || internalRef;

    /* ─── popup state ─── */
    const [popup, setPopup] = useState<{ type: 'slash' | 'at'; filter: string } | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(0);

    /* ─── expression tracking: are we inside an open CQL expression? ─── */
    const [inExpression, setInExpression] = useState(false);

    const items = popup
        ? (popup.type === 'slash' ? CQL_COMMANDS : DATA_REFERENCES).filter(
            item => !popup.filter || item.label.toLowerCase().includes(popup.filter.toLowerCase()),
        )
        : [];

    /* ─── auto-focus ─── */
    useEffect(() => {
        if (autoFocus && ref.current) ref.current.focus();
    }, [autoFocus, ref]);

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
            const triggerChar = triggerType === 'slash' ? '/' : '@';
            let triggerPos = -1;
            for (let i = offset - 1; i >= 0; i--) {
                if (text[i] === triggerChar) { triggerPos = i; break; }
            }
            if (triggerPos >= 0) {
                node.textContent = text.slice(0, triggerPos) + text.slice(offset);
                range.setStart(node, triggerPos);
                range.setEnd(node, triggerPos);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else if (cqlOnly) {
            // In cqlOnly mode there is no trigger char — clear the filter text
            if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                node.textContent = '';
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

        // If hasArgs, add open bracket after token (user types args, then closes with ))
        if (item.hasArgs) {
            const openParen = document.createTextNode('(');
            span.parentNode?.insertBefore(openParen, span.nextSibling);
            // Move caret after the open bracket — user types args here
            const newRange = document.createRange();
            newRange.setStartAfter(openParen);
            newRange.setEndAfter(openParen);
            sel.removeAllRanges();
            sel.addRange(newRange);
            // We are now inside a CQL expression
            setInExpression(true);
        } else {
            // Add a trailing space after the token
            const space = document.createTextNode('\u00A0');
            span.parentNode?.insertBefore(space, span.nextSibling);
            const newRange = document.createRange();
            newRange.setStartAfter(space);
            newRange.setEndAfter(space);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }

        setPopup(null);
        setSelectedIdx(0);

        // Fire change
        if (onChange) {
            onChange(el.innerText || '');
        }
    }, [ref, onChange, cqlOnly]);

    /* ─── detect CQL context from text content ─── */
    const detectExpressionState = useCallback((el: HTMLElement) => {
        const text = el.innerText || '';
        // Count unmatched open parens
        let depth = 0;
        for (const ch of text) {
            if (ch === '(') depth++;
            if (ch === ')') depth = Math.max(0, depth - 1);
        }
        setInExpression(depth > 0);
    }, []);

    /* ─── input handler — detect trigger chars ─── */
    const handleInput = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        const text = el.innerText || '';
        onChange?.(text);

        // Track expression state (open parens)
        detectExpressionState(el);

        // In cqlOnly mode, always show the command picker when not in an expression
        if (cqlOnly) {
            const sel = window.getSelection();
            const caretNode = sel?.rangeCount ? sel.getRangeAt(0).startContainer : null;
            const caretOffset = sel?.rangeCount ? sel.getRangeAt(0).startOffset : 0;
            const textBefore = (caretNode?.nodeType === Node.TEXT_NODE ? caretNode.textContent?.slice(0, caretOffset) : '') || '';
            // Get the last word being typed as filter
            const lastWord = textBefore.match(/([a-zA-Z_ ]*)$/)?.[1] || '';

            // If not in an expression, show CQL picker
            const currentDepth = (() => { let d = 0; for (const ch of text) { if (ch === '(') d++; if (ch === ')') d = Math.max(0, d - 1); } return d; })();
            if (currentDepth === 0 && text.trim().length > 0) {
                setPopup({ type: 'slash', filter: lastWord.trim() });
                setSelectedIdx(0);
                return;
            }
            // Inside expression — show @ references for data fields
            if (currentDepth > 0) {
                setPopup({ type: 'at', filter: lastWord.trim() });
                setSelectedIdx(0);
                return;
            }
            setPopup(null);
            return;
        }

        // Standard mode — detect / and @ triggers
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
                setPopup({ type: 'slash', filter: slashMatch[1] });
                setSelectedIdx(0);
                return;
            }

            // Check for @ trigger
            const atMatch = textBefore.match(/@([a-zA-Z_]*)$/);
            if (atMatch) {
                setPopup({ type: 'at', filter: atMatch[1] });
                setSelectedIdx(0);
                return;
            }
        }

        setPopup(null);
    }, [ref, onChange, cqlOnly, detectExpressionState]);

    /* ─── key handler ─── */
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

        // In expression mode, closing bracket exits expression
        if (inExpression && e.key === ')') {
            // Allow the ) to be typed normally — detectExpressionState will update on next input
        }

        // In cqlOnly mode: if not in expression and no popup, trigger popup on any letter
        if (cqlOnly && !popup && !inExpression) {
            // Let the character be typed, handleInput will show the popup
        }

        onKeyDown?.(e);
    }, [popup, items, selectedIdx, insertToken, onKeyDown, inExpression, cqlOnly]);

    /* ─── popup positioning ─── */
    const popupPositionClass = popupDirection === 'up'
        ? 'bottom-full left-0 mb-1'
        : 'top-full left-0 mt-1';

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
                    cqlOnly && 'font-mono',
                    editorClassName,
                )}
                style={{ minHeight }}
            />

            {/* Popup — positioned via CSS class, not fixed coordinates */}
            {popup && items.length > 0 && (
                <div
                    className={cn(
                        'absolute w-[260px] max-h-[240px] overflow-y-auto rounded-lg border border-border bg-popover shadow-xl py-1 z-50',
                        popupPositionClass,
                    )}
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
                                'shrink-0 text-[11px] font-mono mt-0.5',
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
