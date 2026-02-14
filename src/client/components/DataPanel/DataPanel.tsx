import { useState, useRef } from 'react';
import { Upload, Database, BarChart3, Hash, Type, Calendar, Cpu, Boxes, Calculator, ChevronDown, ChevronRight, MoreVertical, Plus, Maximize2, Minimize2, FileEdit } from 'lucide-react';
import { cn } from '@client/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/components/ui/tabs';
import { RichCommandInput } from '@client/components/ui/rich-command-input';

/* ─── mock data ─── */

const MOCK_DATASETS = [
    { name: 'sales_q4.csv', rows: '12,847', cols: 14, size: '2.3 MB' },
    { name: 'customers.parquet', rows: '84,201', cols: 22, size: '18 MB' },
    { name: 'inventory.xlsx', rows: '3,415', cols: 8, size: '890 KB' },
];

const MOCK_COLUMNS = [
    { name: 'revenue', type: 'numeric', icon: Hash, stats: 'μ 524.30 · σ 182.44' },
    { name: 'region', type: 'categorical', icon: Type, stats: '6 unique' },
    { name: 'order_date', type: 'datetime', icon: Calendar, stats: '2024-01-01 → 2024-12-31' },
    { name: 'quantity', type: 'numeric', icon: Hash, stats: 'μ 42 · σ 15.8' },
];

const ENGINES = [
    { id: 'tabular', emoji: '🗄️', name: 'Tabular', tech: 'DuckDB', status: 'active' as const },
    { id: 'data-quality', emoji: '🧹', name: 'Data Quality', tech: 'DuckDB + Pyodide', status: 'active' as const },
    { id: 'inspection', emoji: '🔍', name: 'Inspection', tech: 'DuckDB + Viz', status: 'active' as const },
    { id: 'statistical', emoji: '📊', name: 'Statistical', tech: 'Pyodide', status: 'planned' as const },
    { id: 'numerical', emoji: '🔢', name: 'Numerical', tech: 'Pyodide', status: 'planned' as const },
    { id: 'symbolic', emoji: '∑', name: 'Symbolic', tech: 'Pyodide (SymPy)', status: 'planned' as const },
    { id: 'simulation', emoji: '🎲', name: 'Simulation', tech: 'Pyodide', status: 'planned' as const },
    { id: 'visualization', emoji: '📈', name: 'Visualization', tech: 'Observable Plot', status: 'active' as const },
    { id: 'narrative', emoji: '📝', name: 'Narrative', tech: 'LLM', status: 'active' as const },
];

/* ─── computation mock data ─── */

interface ComputationCard {
    id: string;
    expression: string;
    dataset: string;
    value: string;
    name: string;
}

interface ComputationGroup {
    id: string;
    name: string;
    cards: ComputationCard[];
    collapsed: boolean;
}

const INITIAL_GROUPS: ComputationGroup[] = [
    {
        id: 'g1', name: 'Revenue Metrics', collapsed: false,
        cards: [
            { id: 'c1', expression: 'SUM(sales.revenue)', dataset: 'sales', value: '$6,965', name: 'Total Revenue' },
            { id: 'c2', expression: 'AVG(sales.revenue)', dataset: 'sales', value: '$1,741', name: 'Average Revenue' },
            { id: 'c3', expression: 'MAX(sales.revenue)', dataset: 'sales', value: '$2,847', name: 'Peak Revenue' },
        ],
    },
    {
        id: 'g2', name: 'Customer Stats', collapsed: false,
        cards: [
            { id: 'c4', expression: 'COUNT(customers)', dataset: 'customers', value: '847', name: 'Total Customers' },
            { id: 'c5', expression: 'AVG(customers.mrr)', dataset: 'customers', value: '$89.50', name: 'Average MRR' },
        ],
    },
];

const CQL_FUNCTIONS = ['SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN', 'STDEV', 'VARIANCE', 'PERCENTILE', 'DISTINCT'];

function evalCQL(fn: string, column: string, datasetId: string): string {
    const fakes: Record<string, Record<string, Record<string, string>>> = {
        sales: { revenue: { SUM: '$6,965', AVG: '$1,741', MIN: '$124', MAX: '$2,847', MEDIAN: '$1,580', COUNT: '4', STDEV: '$892', VARIANCE: '$795k' } },
        customers: { mrr: { SUM: '$75,767', AVG: '$89.50', MIN: '$9.99', MAX: '$499', COUNT: '847' } },
    };
    return fakes[datasetId]?.[column]?.[fn] ?? `${fn}(…)`;
}

/* ─── main component ─── */

interface DataPanelProps {
    className?: string;
    scratchpadActive?: boolean;
}

export function DataPanel({ className, scratchpadActive }: DataPanelProps) {
    return (
        <div className={cn('flex flex-col h-full bg-card overflow-hidden', className)}>
            <Tabs defaultValue="sources" className="flex flex-col h-full">
                {/* Tab header */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0">
                    <TabsList className="h-7 bg-transparent p-0 gap-0.5">
                        <TabsTrigger
                            value="sources"
                            className="h-6 px-2 text-[11px] rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Database className="h-3 w-3 mr-1" />
                            Sources
                        </TabsTrigger>
                        <TabsTrigger
                            value="engines"
                            className="h-6 px-2 text-[11px] rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Cpu className="h-3 w-3 mr-1" />
                            Engines
                        </TabsTrigger>
                        <TabsTrigger
                            value="computations"
                            className="h-6 px-2 text-[11px] rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Calculator className="h-3 w-3 mr-1" />
                            Computations
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Sources tab — existing DataPanel content */}
                <TabsContent value="sources" className="flex-1 mt-0 overflow-y-auto">
                    {/* Upload zone */}
                    <div className="px-3 pt-3 pb-1">
                        <div className="rounded-[10px] border border-dashed border-border hover:border-primary/40 transition-colors duration-150 p-4 flex flex-col items-center gap-2 cursor-pointer group">
                            <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-150" />
                            <p className="text-xs text-muted-foreground text-center">
                                Drop CSV, Parquet, or Excel
                            </p>
                        </div>
                    </div>

                    {/* Datasets */}
                    <div className="px-3 pt-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                            Datasets
                        </span>
                        <div className="mt-1.5 space-y-0.5">
                            {MOCK_DATASETS.map(ds => (
                                <button
                                    key={ds.name}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-accent transition-colors duration-150 group"
                                >
                                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">{ds.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono">
                                            {ds.rows} rows · {ds.cols} cols · {ds.size}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Column profiling */}
                    <div className="px-3 pt-4 pb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                            Columns — sales_q4.csv
                        </span>
                        <div className="mt-1.5 space-y-0.5">
                            {MOCK_COLUMNS.map(col => {
                                const Icon = col.icon;
                                return (
                                    <div
                                        key={col.name}
                                        className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors duration-150"
                                    >
                                        <Icon className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium">{col.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{col.stats}</p>
                                        </div>
                                        <span className="ml-auto inline-flex items-center rounded-md border border-border px-1 py-0.5 text-[9px] text-muted-foreground shrink-0">
                                            {col.type}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </TabsContent>

                {/* Engines tab */}
                <TabsContent value="engines" className="flex-1 mt-0 overflow-y-auto">
                    <div className="px-3 pt-3 pb-2">
                        <div className="flex items-center gap-1.5 mb-3 px-1">
                            <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Engine Registry
                            </span>
                            <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                                {ENGINES.filter(e => e.status === 'active').length}/{ENGINES.length} active
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            {ENGINES.map(engine => (
                                <div
                                    key={engine.id}
                                    className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-accent transition-colors duration-150"
                                >
                                    <span className="text-sm shrink-0">{engine.emoji}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium">{engine.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{engine.tech}</p>
                                    </div>
                                    <span className={cn(
                                        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] shrink-0',
                                        engine.status === 'active'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                    )}>
                                        {engine.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* Computations tab */}
                <ComputationsTab scratchpadActive={scratchpadActive} />
            </Tabs>
        </div>
    );
}

/* ─── Computations Tab ─── */

function ComputationsTab({ scratchpadActive }: { scratchpadActive?: boolean }) {
    const [groups, setGroups] = useState<ComputationGroup[]>(INITIAL_GROUPS);
    const [cqlInput, setCqlInput] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    const toggleGroup = (groupId: string) => {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, collapsed: !g.collapsed } : g));
    };

    const addComputation = () => {
        if (!cqlInput.trim()) return;
        const expr = cqlInput.trim();
        const match = expr.match(/^(\w+)\((\w+)\.(\w+)\)$/);
        let value = '—';
        let dataset = 'sales';
        if (match) {
            const [, fn, ds, col] = match;
            dataset = ds;
            value = evalCQL(fn.toUpperCase(), col, ds);
        }
        const card: ComputationCard = {
            id: `cc-${Date.now()}`, expression: expr, dataset, value,
            name: expr.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(),
        };
        // Add to Unsaved group (create if missing)
        setGroups(prev => {
            const unsaved = prev.find(g => g.id === 'unsaved');
            if (unsaved) {
                return prev.map(g => g.id === 'unsaved' ? { ...g, cards: [...g.cards, card] } : g);
            }
            return [...prev, { id: 'unsaved', name: 'Unsaved', collapsed: false, cards: [card] }];
        });
        setCqlInput('');
    };

    const deleteCard = (groupId: string, cardId: string) => {
        setGroups(prev => prev.map(g => g.id === groupId
            ? { ...g, cards: g.cards.filter(c => c.id !== cardId) }
            : g
        ).filter(g => g.cards.length > 0 || g.id !== 'unsaved'));
        setMenuOpen(null);
        setConfirmDelete(null);
    };

    const addGroup = () => {
        const name = `Group ${groups.length + 1}`;
        setGroups(prev => [...prev, { id: `g-${Date.now()}`, name, collapsed: false, cards: [] }]);
    };

    return (
        <TabsContent value="computations" className="flex-1 mt-0 overflow-y-auto">
            {/* CQL input */}
            <div className="px-3 pt-3 pb-2">
                {scratchpadActive ? (
                    <div className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/30 px-2.5 py-2 cursor-not-allowed">
                        <FileEdit className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground/50 italic">Working in Scratchpad</span>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            'flex gap-1.5 border border-border/50 rounded-md px-2.5 py-1.5 focus-within:border-primary/50 transition-all duration-200',
                            expanded ? 'flex-col' : 'items-center',
                        )}>
                            <RichCommandInput
                                onChange={setCqlInput}
                                placeholder="Type to search CQL commands…"
                                className="flex-1 min-w-0"
                                editorClassName="text-xs"
                                minHeight={expanded ? '100px' : '20px'}
                                autoFocus={expanded}
                                popupDirection="down"
                                cqlOnly
                                onKeyDown={e => {
                                    if (expanded && e.key === 'Escape') { setExpanded(false); }
                                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                        e.preventDefault(); addComputation();
                                    }
                                    if (!expanded && e.key === 'Enter' && cqlInput.trim()) {
                                        e.preventDefault(); addComputation();
                                    }
                                }}
                            />
                            <div className="flex items-center gap-1 shrink-0 self-end">
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors"
                                    title={expanded ? 'Collapse (Esc)' : 'Expand editor'}
                                >
                                    {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                                </button>
                                <button onClick={addComputation} disabled={!cqlInput.trim()}
                                    className="text-[10px] text-primary hover:text-primary/80 disabled:text-muted-foreground/30 transition-colors px-2 py-1 rounded-md border border-primary/20 hover:border-primary/40 disabled:border-border/30 shrink-0">
                                    Compute
                                </button>
                            </div>
                            {expanded && (
                                <p className="text-[9px] text-muted-foreground/40 self-end">Ctrl+Enter to compute · Esc to collapse</p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {CQL_FUNCTIONS.slice(0, 6).map(fn => (
                                <button key={fn} onClick={() => setCqlInput(fn + '(')}
                                    className="text-[9px] text-muted-foreground/60 hover:text-primary border border-border/30 hover:border-primary/30 rounded px-1.5 py-0.5 transition-colors font-mono">
                                    {fn}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Groups */}
            <div className="px-3 pb-3 space-y-2">
                {groups.map(group => (
                    <div key={group.id} className="rounded-lg border border-border/40 overflow-hidden">
                        {/* Group header */}
                        <button onClick={() => toggleGroup(group.id)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 bg-muted/20 hover:bg-muted/40 transition-colors text-left">
                            {group.collapsed
                                ? <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />}
                            <span className="text-xs font-medium flex-1 truncate">{group.name}</span>
                            <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">{group.cards.length}</span>
                        </button>

                        {/* Cards */}
                        {!group.collapsed && (
                            <div className="p-1.5 space-y-1.5">
                                {group.cards.map(card => (
                                    <div key={card.id}
                                        className="relative rounded-md border border-border/30 border-l-2 border-l-primary/40 bg-card px-3 py-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-semibold text-primary leading-tight">{card.value}</p>
                                                <p className="text-[11px] text-foreground mt-0.5 truncate">{card.name}</p>
                                                <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5 truncate">{card.expression}</p>
                                            </div>
                                            {/* ⋮ menu */}
                                            <div className="relative shrink-0">
                                                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === card.id ? null : card.id); setConfirmDelete(null); }}
                                                    className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors">
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </button>
                                                {menuOpen === card.id && (
                                                    <div className="absolute right-0 top-6 z-20 w-28 rounded-md border border-border bg-popover shadow-md py-0.5">
                                                        {confirmDelete === card.id ? (
                                                            <button onClick={() => deleteCard(group.id, card.id)}
                                                                className="w-full text-left px-2.5 py-1.5 text-[11px] text-destructive hover:bg-destructive/10 transition-colors">
                                                                Confirm?
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => setConfirmDelete(card.id)}
                                                                    className="w-full text-left px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {group.cards.length === 0 && (
                                    <p className="px-2 py-3 text-[10px] text-muted-foreground/50 italic text-center">No computations in this group</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* New Group button */}
                <button onClick={addGroup}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border/40 hover:border-primary/30 text-muted-foreground/60 hover:text-primary transition-colors">
                    <Plus className="h-3 w-3" />
                    <span className="text-[10px]">New Group</span>
                </button>
            </div>
        </TabsContent >
    );
}
