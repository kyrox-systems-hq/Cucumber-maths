import { Plus, Table2, BarChart3, Type, Hash, Code2, ChevronDown, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { Button } from '@client/components/ui/button';
import { ScrollArea } from '@client/components/ui/scroll-area';
import { cn } from '@client/lib/utils';
import { useState } from 'react';

/* ─────────────────────────────────────────────
 * Canvas — Block-based result display
 * Right pane of the main split layout
 * ───────────────────────────────────────────── */

interface CanvasBlock {
    id: string;
    type: 'table' | 'chart' | 'metric' | 'narrative' | 'code';
    title: string;
    engine: string;
    code?: string;
}

// Mock blocks for visual design
const MOCK_BLOCKS: CanvasBlock[] = [
    { id: '1', type: 'chart', title: 'Revenue by Region', engine: 'visualization', code: "CHART bar\n  x: region\n  y: SUM(revenue)\n  sort: desc" },
    { id: '2', type: 'metric', title: 'Total Revenue', engine: 'tabular', code: 'SELECT SUM(revenue) FROM sales_q4' },
    { id: '3', type: 'metric', title: 'Avg Order Value', engine: 'tabular', code: 'SELECT AVG(revenue / units) FROM sales_q4' },
    { id: '4', type: 'table', title: 'Revenue Breakdown', engine: 'tabular', code: 'SELECT region, SUM(revenue), COUNT(*)\nFROM sales_q4\nGROUP BY region\nORDER BY SUM(revenue) DESC' },
    { id: '5', type: 'narrative', title: 'Key Insights', engine: 'narrative' },
];

const BLOCK_ICONS: Record<string, typeof Table2> = {
    table: Table2,
    chart: BarChart3,
    metric: Hash,
    narrative: Type,
    code: Code2,
};

// Mock chart data
const MOCK_CHART_DATA = [
    { region: 'APAC', revenue: 2400000, color: '#14B8A6' },
    { region: 'North America', revenue: 1800000, color: '#6366F1' },
    { region: 'Europe', revenue: 1200000, color: '#F59E0B' },
    { region: 'LATAM', revenue: 600000, color: '#F43F5E' },
    { region: 'MEA', revenue: 400000, color: '#38BDF8' },
    { region: 'EMEA', revenue: 350000, color: '#8B5CF6' },
];

const MAX_REVENUE = Math.max(...MOCK_CHART_DATA.map(d => d.revenue));

interface CanvasProps {
    className?: string;
}

export function Canvas({ className }: CanvasProps) {
    return (
        <div className={cn('flex flex-col h-full bg-background', className)}>
            {/* Canvas header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
                <span className="text-sm font-semibold">Canvas</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                    <Plus className="h-3 w-3" />
                    Add block
                </Button>
            </div>

            {/* Blocks grid */}
            <ScrollArea className="flex-1">
                <div className="p-4 grid gap-3 grid-cols-1 lg:grid-cols-2 auto-rows-min">
                    {/* Chart block — full width */}
                    <div className="lg:col-span-2">
                        <CanvasBlockCard block={MOCK_BLOCKS[0]}>
                            <MockBarChart />
                        </CanvasBlockCard>
                    </div>

                    {/* Metric blocks — half width each */}
                    <CanvasBlockCard block={MOCK_BLOCKS[1]}>
                        <MetricDisplay value="$6.75M" change="+18%" positive />
                    </CanvasBlockCard>

                    <CanvasBlockCard block={MOCK_BLOCKS[2]}>
                        <MetricDisplay value="$524.30" change="-3%" positive={false} />
                    </CanvasBlockCard>

                    {/* Table block — full width */}
                    <div className="lg:col-span-2">
                        <CanvasBlockCard block={MOCK_BLOCKS[3]}>
                            <MockTable />
                        </CanvasBlockCard>
                    </div>

                    {/* Narrative block — full width */}
                    <div className="lg:col-span-2">
                        <CanvasBlockCard block={MOCK_BLOCKS[4]}>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                <strong>Key findings:</strong> APAC region leads with $2.4M in revenue, representing a 34% year-over-year increase.
                                North America follows at $1.8M. EMEA shows the only decline at -12%, primarily driven by reduced enterprise spending
                                in Q4. Consider investigating the EMEA drop — it may correlate with the pricing change in October.
                            </p>
                        </CanvasBlockCard>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

/* ── Block wrapper ─────────────────────────────── */

function CanvasBlockCard({ block, children }: { block: CanvasBlock; children: React.ReactNode }) {
    const [showCode, setShowCode] = useState(false);
    const Icon = BLOCK_ICONS[block.type] || Code2;

    return (
        <Card className="bg-card border-border/50 hover:border-border transition-colors overflow-hidden">
            <CardHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-medium truncate">{block.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        {block.code && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'h-6 px-2 text-[10px] gap-1',
                                    showCode ? 'text-primary' : 'text-muted-foreground'
                                )}
                                onClick={() => setShowCode(!showCode)}
                            >
                                <Code2 className="h-3 w-3" />
                                Code
                            </Button>
                        )}
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-border text-muted-foreground font-normal">
                            {block.engine}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            {/* Code transparency */}
            {showCode && block.code && (
                <div className="mx-3 mt-2 rounded-[10px] bg-[#141922] border border-[rgba(255,255,255,0.05)] p-3 overflow-x-auto">
                    <pre className="text-[11px] font-mono text-[#C9D1D9] leading-relaxed">{block.code}</pre>
                </div>
            )}

            <CardContent className="p-3 pt-2">
                {children}
            </CardContent>
        </Card>
    );
}

/* ── Mock chart ────────────────────────────────── */

function MockBarChart() {
    return (
        <div className="space-y-1.5">
            {MOCK_CHART_DATA.map(d => (
                <div key={d.region} className="flex items-center gap-2 group">
                    <span className="text-[11px] text-muted-foreground w-28 text-right shrink-0 truncate">{d.region}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-sm overflow-hidden">
                        <div
                            className="h-full rounded-sm transition-all duration-500 group-hover:opacity-90"
                            style={{
                                width: `${(d.revenue / MAX_REVENUE) * 100}%`,
                                backgroundColor: d.color,
                            }}
                        />
                    </div>
                    <span className="text-[11px] text-muted-foreground w-16 shrink-0 font-mono">
                        ${(d.revenue / 1000000).toFixed(1)}M
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ── Mock metric ───────────────────────────────── */

function MetricDisplay({ value, change, positive }: { value: string; change: string; positive: boolean }) {
    return (
        <div className="flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            <Badge
                variant="secondary"
                className={cn(
                    'text-xs font-mono border-0',
                    positive ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                )}
            >
                {change}
            </Badge>
        </div>
    );
}

/* ── Mock table ────────────────────────────────── */

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
        <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border">
                        {headers.map(h => (
                            <th key={h} className="text-left py-1.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className={cn(
                                    'py-1.5 px-2 text-[12px]',
                                    j === 0 ? 'font-medium' : 'font-mono text-muted-foreground'
                                )}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
