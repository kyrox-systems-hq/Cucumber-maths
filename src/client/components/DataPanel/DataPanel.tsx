import { Upload, Database, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@client/lib/utils';

/* ─────────────────────────────────────────────
 * DataPanel — Dataset browser + upload + profiling
 * Sits on one side of the layout (swappable)
 * ───────────────────────────────────────────── */

const MOCK_DATASETS = [
    {
        id: '1',
        name: 'sales_q4.csv',
        rowCount: 12847,
        columns: 8,
        columnDefs: [
            { name: 'date', type: 'date', nulls: 0 },
            { name: 'region', type: 'category', nulls: 0 },
            { name: 'product', type: 'text', nulls: 12 },
            { name: 'revenue', type: 'number', nulls: 47 },
            { name: 'units', type: 'number', nulls: 3 },
            { name: 'channel', type: 'category', nulls: 0 },
            { name: 'discount', type: 'percentage', nulls: 89 },
            { name: 'notes', type: 'text', nulls: 4201 },
        ],
    },
    {
        id: '2',
        name: 'customers.json',
        rowCount: 3420,
        columns: 5,
        columnDefs: [
            { name: 'customer_id', type: 'text', nulls: 0 },
            { name: 'name', type: 'text', nulls: 0 },
            { name: 'email', type: 'text', nulls: 14 },
            { name: 'signup_date', type: 'date', nulls: 0 },
            { name: 'segment', type: 'category', nulls: 0 },
        ],
    },
];

const TYPE_ICONS: Record<string, string> = {
    text: 'Aa',
    number: '#',
    date: '📅',
    category: '◎',
    boolean: '◉',
    currency: '$',
    percentage: '%',
};

interface DataPanelProps {
    className?: string;
}

export function DataPanel({ className }: DataPanelProps) {
    return (
        <div className={cn('flex flex-col h-full bg-card overflow-hidden', className)}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
                <span className="text-sm font-semibold">Data</span>
            </div>

            {/* Upload zone */}
            <div className="p-4 border-b border-border shrink-0">
                <button className="w-full flex flex-col items-center gap-1.5 py-5 rounded-[10px] border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-colors duration-150 group">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-150" />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-150">
                        Drop CSV, JSON, or Excel
                    </span>
                </button>
            </div>

            {/* Dataset list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="px-1 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                        Datasets
                    </span>
                </div>

                {MOCK_DATASETS.map(ds => (
                    <DatasetItem key={ds.id} dataset={ds} />
                ))}
            </div>
        </div>
    );
}

function DatasetItem({ dataset }: { dataset: (typeof MOCK_DATASETS)[0] }) {
    return (
        <div className="rounded-[10px] border border-border/50 bg-elevated/30 hover:bg-elevated/60 transition-colors duration-150 cursor-pointer group">
            <div className="p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Database className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">{dataset.name}</span>
                    </div>
                    <button
                        className="flex h-5 w-5 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        title="Remove dataset"
                        aria-label={`Remove ${dataset.name}`}
                    >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors duration-150" />
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                    <span>{dataset.rowCount.toLocaleString()} rows</span>
                    <span>·</span>
                    <span>{dataset.columns} cols</span>
                </div>

                {/* Column list */}
                <div className="space-y-0.5">
                    {dataset.columnDefs.slice(0, 5).map(col => (
                        <div
                            key={col.name}
                            className="flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded-md hover:bg-background/50 transition-colors duration-150"
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-muted-foreground font-mono text-[10px] w-3 text-center">
                                    {TYPE_ICONS[col.type] || '?'}
                                </span>
                                <span className="truncate text-foreground/80">{col.name}</span>
                            </div>
                            {col.nulls > 0 && (
                                <span className="inline-flex items-center rounded-md px-1 h-4 text-[9px] bg-destructive/10 text-destructive/80">
                                    {col.nulls} null
                                </span>
                            )}
                        </div>
                    ))}
                    {dataset.columnDefs.length > 5 && (
                        <button className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 px-1.5 py-0.5">
                            <ChevronRight className="h-2.5 w-2.5" />
                            {dataset.columnDefs.length - 5} more columns
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
