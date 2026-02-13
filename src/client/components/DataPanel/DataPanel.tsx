import { Upload, Database, ChevronRight, BarChart3, Table2, FileText, Trash2 } from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { Card } from '@client/components/ui/card';
import { ScrollArea } from '@client/components/ui/scroll-area';
import { Badge } from '@client/components/ui/badge';
import { Separator } from '@client/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@client/components/ui/tooltip';
import { cn } from '@client/lib/utils';

/* ─────────────────────────────────────────────
 * DataPanel — Dataset browser + upload + profiling
 * Left sidebar or collapsible panel
 * ───────────────────────────────────────────── */

// Mock data for visual design
const MOCK_DATASETS = [
    {
        id: '1', name: 'sales_q4.csv', rowCount: 12847, columns: 8,
        columnDefs: [
            { name: 'date', type: 'date', nulls: 0 },
            { name: 'region', type: 'category', nulls: 0 },
            { name: 'product', type: 'text', nulls: 12 },
            { name: 'revenue', type: 'number', nulls: 47 },
            { name: 'units', type: 'number', nulls: 3 },
            { name: 'channel', type: 'category', nulls: 0 },
            { name: 'discount', type: 'percentage', nulls: 89 },
            { name: 'notes', type: 'text', nulls: 4201 },
        ]
    },
    {
        id: '2', name: 'customers.json', rowCount: 3420, columns: 5,
        columnDefs: [
            { name: 'customer_id', type: 'text', nulls: 0 },
            { name: 'name', type: 'text', nulls: 0 },
            { name: 'email', type: 'text', nulls: 14 },
            { name: 'signup_date', type: 'date', nulls: 0 },
            { name: 'segment', type: 'category', nulls: 0 },
        ]
    },
];

const TYPE_ICONS: Record<string, string> = {
    text: 'Aa', number: '#', date: '📅', category: '◎',
    boolean: '◉', currency: '$', percentage: '%',
};

interface DataPanelProps {
    className?: string;
}

export function DataPanel({ className }: DataPanelProps) {
    return (
        <div className={cn('flex flex-col h-full bg-card', className)}>
            {/* Upload zone */}
            <div className="p-3 border-b border-border">
                <Button
                    variant="outline"
                    className="w-full h-20 border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                    <div className="flex flex-col items-center gap-1.5">
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                            Drop CSV, JSON, or Excel
                        </span>
                    </div>
                </Button>
            </div>

            {/* Dataset list */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    <div className="px-2 py-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Datasets
                        </span>
                    </div>

                    {MOCK_DATASETS.map(ds => (
                        <DatasetItem key={ds.id} dataset={ds} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function DatasetItem({ dataset }: { dataset: typeof MOCK_DATASETS[0] }) {
    return (
        <Card className="p-0 overflow-hidden bg-muted/30 hover:bg-muted/60 transition-colors border-border/50 cursor-pointer group">
            <div className="p-2.5">
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Database className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">{dataset.name}</span>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove dataset</TooltipContent>
                    </Tooltip>
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
                        <div key={col.name} className="flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded hover:bg-background/50 transition-colors">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-muted-foreground font-mono text-[10px] w-3 text-center">
                                    {TYPE_ICONS[col.type] || '?'}
                                </span>
                                <span className="truncate text-foreground/80">{col.name}</span>
                            </div>
                            {col.nulls > 0 && (
                                <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-destructive/10 text-destructive/80 border-0">
                                    {col.nulls} null
                                </Badge>
                            )}
                        </div>
                    ))}
                    {dataset.columnDefs.length > 5 && (
                        <button className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5">
                            <ChevronRight className="h-2.5 w-2.5" />
                            {dataset.columnDefs.length - 5} more columns
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}
