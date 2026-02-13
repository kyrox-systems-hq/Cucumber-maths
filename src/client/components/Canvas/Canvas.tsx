import { Plus, Table2, BarChart3, Type, Hash, Code2, Database, ListChecks, Layout, FileSearch, ArrowRightLeft } from 'lucide-react';
import { cn } from '@client/lib/utils';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/components/ui/tabs';

/* ─── types & mock data ─── */

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

/* ─── mock ledger steps ─── */

const MOCK_STEPS = [
    { id: 1, engine: 'tabular', operation: 'LOAD', description: 'Load sales_q4.csv', status: 'done' as const, rows: '12,847', duration: '42ms' },
    { id: 2, engine: 'data-quality', operation: 'CLEAN', description: 'Drop nulls in revenue (47 rows)', status: 'done' as const, rows: '12,800', duration: '18ms' },
    { id: 3, engine: 'data-quality', operation: 'DEDUP', description: 'Deduplicate on order_id (12 rows)', status: 'done' as const, rows: '12,788', duration: '24ms' },
    { id: 4, engine: 'tabular', operation: 'GROUP', description: 'GROUP BY region, SUM(revenue)', status: 'done' as const, rows: '6', duration: '8ms' },
    { id: 5, engine: 'visualization', operation: 'CHART', description: 'Bar chart spec → rendered', status: 'done' as const, rows: '6', duration: '120ms' },
];

/* ─── main component ─── */

interface CanvasProps { className?: string; }

export function Canvas({ className }: CanvasProps) {
    return (
        <div className={cn('flex flex-col h-full bg-background overflow-hidden', className)}>
            <Tabs defaultValue="canvas" className="flex flex-col h-full">
                {/* Tab bar */}
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card shrink-0">
                    <TabsList className="h-8 bg-transparent p-0 gap-1">
                        <TabsTrigger
                            value="data"
                            className="h-7 px-3 text-xs rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Database className="h-3 w-3 mr-1.5" />
                            Data
                        </TabsTrigger>
                        <TabsTrigger
                            value="ledger"
                            className="h-7 px-3 text-xs rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <ListChecks className="h-3 w-3 mr-1.5" />
                            Ledger
                        </TabsTrigger>
                        <TabsTrigger
                            value="canvas"
                            className="h-7 px-3 text-xs rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <Layout className="h-3 w-3 mr-1.5" />
                            Canvas
                        </TabsTrigger>
                    </TabsList>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 px-2 py-1 rounded-md hover:bg-accent">
                        <Plus className="h-3 w-3" /> Add block
                    </button>
                </div>

                {/* Data tab */}
                <TabsContent value="data" className="flex-1 mt-0 overflow-y-auto">
                    <DataInspectionTab />
                </TabsContent>

                {/* Ledger tab */}
                <TabsContent value="ledger" className="flex-1 mt-0 overflow-y-auto">
                    <LedgerTab />
                </TabsContent>

                {/* Canvas tab — existing block grid */}
                <TabsContent value="canvas" className="flex-1 mt-0 overflow-y-auto p-4">
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
                </TabsContent>
            </Tabs>
        </div>
    );
}

/* ─── Data Inspection Tab ─── */

function DataInspectionTab() {
    const [stage, setStage] = useState<'raw' | 'cleaned' | 'transformed'>('raw');

    const stages = [
        { id: 'raw' as const, label: 'Raw', rows: '12,847', cols: '14' },
        { id: 'cleaned' as const, label: 'Cleaned', rows: '12,800', cols: '14' },
        { id: 'transformed' as const, label: 'Transformed', rows: '6', cols: '3' },
    ];

    const currentStage = stages.find(s => s.id === stage)!;

    return (
        <div className="flex flex-col h-full">
            {/* Stage selector */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 shrink-0">
                <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stage</span>
                <div className="flex items-center gap-0.5 ml-1">
                    {stages.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <button
                                onClick={() => setStage(s.id)}
                                className={cn(
                                    'px-2 py-0.5 rounded-md text-[11px] transition-colors duration-150',
                                    stage === s.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {s.label}
                            </button>
                            {i < stages.length - 1 && <ArrowRightLeft className="h-2.5 w-2.5 text-border mx-0.5" />}
                        </div>
                    ))}
                </div>
                <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                    {currentStage.rows} rows × {currentStage.cols} cols
                </span>
            </div>

            {/* Data preview */}
            <div className="flex-1 overflow-auto p-4">
                {stage === 'transformed' ? (
                    <TransformedPreview />
                ) : (
                    <RawDataPreview stage={stage} />
                )}
            </div>
        </div>
    );
}

function RawDataPreview({ stage }: { stage: 'raw' | 'cleaned' }) {
    const headers = ['order_id', 'region', 'revenue', 'units', 'order_date', 'customer_id'];
    const rawRows = [
        ['ORD-001', 'APAC', '$1,240', '3', '2024-10-01', 'C-4521'],
        ['ORD-002', 'Europe', '$890', '2', '2024-10-01', 'C-1823'],
        ['ORD-003', 'APAC', '', '1', '2024-10-02', 'C-7291'],
        ['ORD-004', 'North America', '$2,100', '5', '2024-10-02', 'C-3847'],
        ['ORD-005', 'LATAM', '$445', '1', '2024-10-03', 'C-9102'],
        ['ORD-006', 'MEA', '$1,890', '4', '2024-10-03', 'C-5624'],
    ];
    const cleanRows = rawRows.filter(r => r[2] !== '');

    const rows = stage === 'raw' ? rawRows : cleanRows;

    return (
        <div className="rounded-[10px] border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/30">
                        {headers.map(h => (
                            <th key={h} className="text-left py-1.5 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-accent/30 transition-colors duration-150">
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className={cn(
                                        'py-1.5 px-3 text-[12px]',
                                        j === 0 ? 'font-medium font-mono' : '',
                                        j >= 2 && j <= 3 ? 'font-mono text-muted-foreground' : '',
                                        cell === '' ? 'bg-destructive/5' : '',
                                    )}
                                >
                                    {cell === '' ? <span className="text-destructive text-[10px] italic">null</span> : cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TransformedPreview() {
    const headers = ['Region', 'Revenue', 'Orders'];
    const rows = [
        ['APAC', '$2,400,000', '4,571'],
        ['North America', '$1,800,000', '3,426'],
        ['Europe', '$1,200,000', '2,412'],
        ['LATAM', '$600,000', '1,138'],
        ['MEA', '$400,000', '782'],
        ['EMEA', '$350,000', '518'],
    ];
    return (
        <div className="rounded-[10px] border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/30">
                        {headers.map(h => <th key={h} className="text-left py-1.5 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-accent/30 transition-colors duration-150">
                            {row.map((cell, j) => <td key={j} className={cn('py-1.5 px-3 text-[12px]', j === 0 ? 'font-medium' : 'font-mono text-muted-foreground')}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ─── Ledger Tab ─── */

function LedgerTab() {
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    return (
        <div className="p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Computation Chain
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                    5 steps · 212ms total
                </span>
            </div>

            {MOCK_STEPS.map((step, i) => (
                <div key={step.id} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className={cn(
                            'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono',
                            step.status === 'done'
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'bg-muted text-muted-foreground border border-border'
                        )}>
                            {step.id}
                        </div>
                        {i < MOCK_STEPS.length - 1 && <div className="w-px flex-1 bg-border/50 my-0.5" />}
                    </div>

                    {/* Step card */}
                    <button
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        className={cn(
                            'flex-1 rounded-[10px] border px-3 py-2 text-left transition-all duration-150 mb-1',
                            expandedStep === step.id
                                ? 'border-primary/30 bg-primary/5'
                                : 'border-border/50 hover:border-border hover:bg-card'
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="inline-flex items-center rounded-md border border-border px-1 py-0.5 text-[9px] text-muted-foreground shrink-0">
                                    {step.engine}
                                </span>
                                <span className="text-xs font-medium truncate">{step.description}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-[10px] text-muted-foreground font-mono">{step.rows} rows</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{step.duration}</span>
                            </div>
                        </div>

                        {expandedStep === step.id && (
                            <div className="mt-2 rounded-[10px] bg-[--ledger-bg] border border-[--ledger-border] p-2.5 overflow-x-auto">
                                <pre className="text-[11px] font-mono text-[--code] leading-relaxed whitespace-pre">
                                    {step.operation === 'LOAD' && 'LOAD "sales_q4.csv"\n  format: csv\n  encoding: utf-8\n  → 12,847 rows × 14 cols'}
                                    {step.operation === 'CLEAN' && 'CLEAN nulls\n  column: revenue\n  action: drop_row\n  → removed 47 rows'}
                                    {step.operation === 'DEDUP' && 'DEDUP\n  key: order_id\n  keep: first\n  → removed 12 duplicates'}
                                    {step.operation === 'GROUP' && 'SELECT region, SUM(revenue) as total\nFROM pipeline_output\nGROUP BY region\nORDER BY total DESC'}
                                    {step.operation === 'CHART' && 'CHART bar\n  x: region\n  y: total\n  sort: desc\n  palette: brand'}
                                </pre>
                            </div>
                        )}
                    </button>
                </div>
            ))}
        </div>
    );
}

/* ─── Canvas sub-components (unchanged) ─── */

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
