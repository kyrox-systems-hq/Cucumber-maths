import { Plus, Table2, BarChart3, Type, Hash, Code2 } from 'lucide-react';
import { cn } from '@client/lib/utils';
import { useState } from 'react';

interface CanvasBlock {
    id: string;
    type: 'table' | 'chart' | 'metric' | 'narrative';
    title: string;
    engine: string;
    code?: string;
}

const MOCK_BLOCKS: CanvasBlock[] = [
    { id: '1', type: 'chart', title: 'Revenue by Region', engine: 'visualization', code: 'CHART bar\n  x: region\n  y: SUM(revenue)\n  sort: desc' },
    { id: '2', type: 'metric', title: 'Total Revenue', engine: 'tabular', code: 'SELECT SUM(revenue) FROM sales_q4' },
    { id: '3', type: 'metric', title: 'Avg Order Value', engine: 'tabular', code: 'SELECT AVG(revenue / units) FROM sales_q4' },
    { id: '4', type: 'table', title: 'Revenue Breakdown', engine: 'tabular', code: 'SELECT region, SUM(revenue), COUNT(*)\nFROM sales_q4\nGROUP BY region\nORDER BY SUM(revenue) DESC' },
    { id: '5', type: 'narrative', title: 'Key Insights', engine: 'narrative' },
];

const BLOCK_ICONS: Record<string, typeof Table2> = {
    table: Table2, chart: BarChart3, metric: Hash, narrative: Type,
};

const CHART_DATA = [
    { region: 'APAC', revenue: 2400000, color: '#2E8F8C' },
    { region: 'North America', revenue: 1800000, color: '#3F5C7A' },
    { region: 'Europe', revenue: 1200000, color: '#5C6BC0' },
    { region: 'LATAM', revenue: 600000, color: '#C58F2C' },
    { region: 'MEA', revenue: 400000, color: '#A94A5A' },
    { region: 'EMEA', revenue: 350000, color: '#64748B' },
];
const MAX_REV = Math.max(...CHART_DATA.map(d => d.revenue));

interface CanvasProps { className?: string; }

export function Canvas({ className }: CanvasProps) {
    return (
        <div className={cn('flex flex-col h-full bg-background overflow-hidden', className)}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
                <span className="text-sm font-semibold">Canvas</span>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 px-2 py-1 rounded-md hover:bg-accent">
                    <Plus className="h-3 w-3" /> Add block
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 auto-rows-min">
                    <div className="lg:col-span-2"><BlockCard block={MOCK_BLOCKS[0]}><MockChart /></BlockCard></div>
                    <BlockCard block={MOCK_BLOCKS[1]}><Metric value="$6.75M" change="+18%" positive /></BlockCard>
                    <BlockCard block={MOCK_BLOCKS[2]}><Metric value="$524.30" change="-3%" positive={false} /></BlockCard>
                    <div className="lg:col-span-2"><BlockCard block={MOCK_BLOCKS[3]}><MockTable /></BlockCard></div>
                    <div className="lg:col-span-2">
                        <BlockCard block={MOCK_BLOCKS[4]}>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                <strong>Key findings:</strong> APAC leads with $2.4M (34% YoY). North America
                                follows at $1.8M. EMEA shows -12% decline, primarily from reduced enterprise
                                spending in Q4.
                            </p>
                        </BlockCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BlockCard({ block, children }: { block: CanvasBlock; children: React.ReactNode }) {
    const [showCode, setShowCode] = useState(false);
    const Icon = BLOCK_ICONS[block.type] || Code2;
    return (
        <div className="rounded-[10px] border border-border/50 bg-card hover:border-border transition-colors duration-150 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium truncate">{block.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {block.code && (
                        <button className={cn('flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-colors duration-150', showCode ? 'text-primary' : 'text-muted-foreground hover:text-foreground')} onClick={() => setShowCode(!showCode)}>
                            <Code2 className="h-3 w-3" /> Code
                        </button>
                    )}
                    <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">{block.engine}</span>
                </div>
            </div>
            {showCode && block.code && (
                <div className="mx-4 mb-2 rounded-[10px] bg-[--ledger-bg] border border-[--ledger-border] p-3 overflow-x-auto">
                    <pre className="text-[11px] font-mono text-[--code] leading-relaxed whitespace-pre">{block.code}</pre>
                </div>
            )}
            <div className="px-4 pb-4">{children}</div>
        </div>
    );
}

function MockChart() {
    return (
        <div className="space-y-1.5">
            {CHART_DATA.map(d => (
                <div key={d.region} className="flex items-center gap-2 group">
                    <span className="text-[11px] text-muted-foreground w-28 text-right shrink-0 truncate">{d.region}</span>
                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                        <div className="h-full rounded-md transition-all duration-300 group-hover:opacity-80" style={{ width: `${(d.revenue / MAX_REV) * 100}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-[11px] text-muted-foreground w-16 shrink-0 font-mono">${(d.revenue / 1000000).toFixed(1)}M</span>
                </div>
            ))}
        </div>
    );
}

function Metric({ value, change, positive }: { value: string; change: string; positive: boolean }) {
    return (
        <div className="flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-mono', positive ? 'text-[--success]' : 'text-destructive')} style={positive ? { background: 'rgba(31,138,91,0.12)' } : { background: 'rgba(192,71,71,0.12)' }}>
                {change}
            </span>
        </div>
    );
}

function MockTable() {
    const headers = ['Region', 'Revenue', 'Orders', 'Avg Value'];
    const rows = [
        ['APAC', '$2,400,000', '4,571', '$525'],
        ['North America', '$1,800,000', '3,426', '$525'],
        ['Europe', '$1,200,000', '2,412', '$497'],
        ['LATAM', '$600,000', '1,138', '$527'],
        ['MEA', '$400,000', '782', '$512'],
        ['EMEA', '$350,000', '518', '$676'],
    ];
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border">
                        {headers.map(h => <th key={h} className="text-left py-1.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-border/30 hover:bg-accent/50 transition-colors duration-150">
                            {row.map((cell, j) => <td key={j} className={cn('py-1.5 px-2 text-[12px]', j === 0 ? 'font-medium' : 'font-mono text-muted-foreground')}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
