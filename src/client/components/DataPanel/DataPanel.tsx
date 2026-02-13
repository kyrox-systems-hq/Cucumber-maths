import { Upload, Database, BarChart3, Hash, Type, Calendar } from 'lucide-react';
import { cn } from '@client/lib/utils';

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

interface DataPanelProps {
    className?: string;
}

export function DataPanel({ className }: DataPanelProps) {
    return (
        <div className={cn('flex flex-col bg-card overflow-hidden', className)}>
            {/* Panel header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border shrink-0">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">Data</span>
            </div>

            <div className="flex-1 overflow-y-auto">
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
            </div>
        </div>
    );
}
