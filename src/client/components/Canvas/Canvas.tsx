import { Plus, Table2, BarChart3, Type, Hash, Code2, Database, ListChecks, Layout, FileSearch, ArrowRightLeft, Play, MessageSquare, ClipboardCheck, ChevronRight, Eye, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
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

/* ─── mock ledger data (enriched with prompt + plan + data diffs) ─── */

interface LedgerStep {
    id: number;
    engine: string;
    operation: string;
    description: string;
    status: 'done' | 'running' | 'pending';
    rows: string;
    duration: string;
    code: string;
    affectedRows?: string[][];
    affectedHeaders?: string[];
    diffLabel?: string;
}

const MOCK_LEDGER = {
    prompt: 'Show me revenue by region for Q4',
    approvedPlan: 'Load sales_q4.csv → Clean nulls in revenue → Deduplicate on order_id → Group by region → Bar chart',
    userEdited: false,
    totalDuration: '212ms',
    steps: [
        {
            id: 1, engine: 'tabular', operation: 'LOAD', description: 'Load sales_q4.csv',
            status: 'done' as const, rows: '12,847', duration: '42ms',
            code: 'LOAD "sales_q4.csv"\n  format: csv\n  encoding: utf-8\n  → 12,847 rows × 14 cols',
        },
        {
            id: 2, engine: 'data-quality', operation: 'CLEAN', description: 'Drop nulls in revenue (47 rows)',
            status: 'done' as const, rows: '12,800', duration: '18ms',
            code: 'CLEAN nulls\n  column: revenue\n  action: drop_row\n  → removed 47 rows',
            diffLabel: '47 rows removed (null revenue)',
            affectedHeaders: ['order_id', 'region', 'revenue', 'units'],
            affectedRows: [
                ['ORD-003', 'APAC', '—', '1'],
                ['ORD-147', 'Europe', '—', '3'],
                ['ORD-891', 'LATAM', '—', '2'],
            ],
        },
        {
            id: 3, engine: 'data-quality', operation: 'DEDUP', description: 'Deduplicate on order_id (12 rows)',
            status: 'done' as const, rows: '12,788', duration: '24ms',
            code: 'DEDUP\n  key: order_id\n  keep: first\n  → removed 12 duplicates',
            diffLabel: '12 duplicates removed (key: order_id)',
            affectedHeaders: ['order_id', 'region', 'revenue', 'kept'],
            affectedRows: [
                ['ORD-204', 'APAC', '$890', '✗ removed'],
                ['ORD-204', 'APAC', '$890', '✓ kept'],
                ['ORD-517', 'Europe', '$1,240', '✗ removed'],
                ['ORD-517', 'Europe', '$1,240', '✓ kept'],
            ],
        },
        {
            id: 4, engine: 'tabular', operation: 'GROUP', description: 'GROUP BY region, SUM(revenue)',
            status: 'done' as const, rows: '6', duration: '8ms',
            code: 'SELECT region, SUM(revenue) as total\nFROM pipeline_output\nGROUP BY region\nORDER BY total DESC',
        },
        {
            id: 5, engine: 'visualization', operation: 'CHART', description: 'Bar chart spec → rendered',
            status: 'done' as const, rows: '6', duration: '120ms',
            code: 'CHART bar\n  x: region\n  y: total\n  sort: desc\n  palette: brand',
        },
    ] as LedgerStep[],
    output: '1 chart + 2 metrics + 1 table committed to Canvas',
};

/* ─── mock execution preview steps ─── */

interface PreviewStep {
    id: number;
    engine: string;
    description: string;
    estimatedRows: string;
    estimatedDuration: string;
    preview?: string;
}

const MOCK_PREVIEW: PreviewStep[] | null = [
    { id: 1, engine: 'tabular', description: 'Load customers.parquet', estimatedRows: '84,201', estimatedDuration: '~80ms' },
    { id: 2, engine: 'data-quality', description: 'Validate email format', estimatedRows: '84,201', estimatedDuration: '~45ms', preview: 'Pattern: RFC 5322 email validation' },
    { id: 3, engine: 'data-quality', description: 'Drop rows with null email or name', estimatedRows: '~83,900', estimatedDuration: '~20ms' },
    { id: 4, engine: 'tabular', description: 'Group by signup_month, COUNT(*)', estimatedRows: '~12', estimatedDuration: '~10ms' },
    { id: 5, engine: 'visualization', description: 'Line chart: signups over time', estimatedRows: '~12', estimatedDuration: '~100ms', preview: 'Line chart with monthly x-axis' },
];

/* ─── main component ─── */

interface CanvasProps { className?: string; }

export function Canvas({ className }: CanvasProps) {
    // In a real app, `hasPlan` would come from a global store/context
    // Toggle this to simulate an active execution preview
    const [hasPlan, setHasPlan] = useState(true);
    const [activeTab, setActiveTab] = useState('canvas');

    const simulatePrompt = () => {
        setHasPlan(true);
        setActiveTab('preview');
    };

    const dismissPreview = () => {
        setHasPlan(false);
        setActiveTab('canvas');
    };

    return (
        <div className={cn('flex flex-col h-full bg-background overflow-hidden', className)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
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
                        <TabsTrigger
                            value="preview"
                            disabled={!hasPlan}
                            className={cn(
                                'h-7 px-3 text-xs rounded-md',
                                hasPlan
                                    ? 'data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-primary/70 border border-primary/20'
                                    : 'text-muted-foreground/30 cursor-not-allowed'
                            )}
                        >
                            <Play className="h-3 w-3 mr-1.5" />
                            Preview
                            {hasPlan && activeTab !== 'preview' && (
                                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            )}
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

                {/* Preview tab — execution plan */}
                <TabsContent value="preview" className="flex-1 mt-0 overflow-y-auto">
                    <ExecutionPreviewTab onApprove={dismissPreview} onCancel={dismissPreview} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

/* ─── Execution Preview Tab ─── */

function ExecutionPreviewTab({ onApprove, onCancel }: { onApprove: () => void; onCancel: () => void }) {
    if (!MOCK_PREVIEW) return null;

    return (
        <div className="p-4 space-y-4">
            {/* Prompt context */}
            <div className="rounded-[10px] border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Prompt</span>
                </div>
                <p className="text-sm text-foreground">"Analyze customer signups over time from customers.parquet"</p>
            </div>

            {/* Plan summary */}
            <div className="flex items-center gap-2">
                <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Execution Plan
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                    {MOCK_PREVIEW.length} steps · ~255ms estimated
                </span>
            </div>

            {/* Steps */}
            <div className="space-y-1.5">
                {MOCK_PREVIEW.map((step, i) => (
                    <div key={step.id} className="flex gap-3">
                        {/* Timeline */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                                {step.id}
                            </div>
                            {i < MOCK_PREVIEW.length - 1 && <div className="w-px flex-1 bg-border/50 my-0.5" />}
                        </div>

                        {/* Step card */}
                        <div className="flex-1 rounded-[10px] border border-border/50 px-3 py-2 mb-1 hover:border-border hover:bg-card transition-all duration-150">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="inline-flex items-center rounded-md border border-border px-1 py-0.5 text-[9px] text-muted-foreground shrink-0">
                                        {step.engine}
                                    </span>
                                    <span className="text-xs font-medium truncate">{step.description}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <span className="text-[10px] text-muted-foreground font-mono">~{step.estimatedRows} rows</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">{step.estimatedDuration}</span>
                                    <div className="flex items-center gap-0.5 ml-1">
                                        <button className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground transition-colors" title="Edit step">
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button className="p-0.5 rounded text-muted-foreground/50 hover:text-destructive transition-colors" title="Remove step">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {step.preview && (
                                <div className="mt-1.5 flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">{step.preview}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
                <button
                    onClick={onApprove}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors duration-150"
                >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Execute
                </button>
                <button
                    onClick={onApprove}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                >
                    <Pencil className="h-3.5 w-3.5" /> Edit Plan
                </button>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs text-muted-foreground hover:text-destructive transition-colors duration-150"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

/* ─── Data Inspection Tab (Multi-Panel + Stats + Filters) ─── */

interface DatasetDef {
    id: string;
    name: string;
    headers: string[];
    columnTypes: ('id' | 'text' | 'numeric' | 'date')[];
    rows: string[][];
    numericStats?: Record<string, { mean: number; median: number; mode: number; std: number; min: number; max: number; nulls: number }>;
    categoricalStats?: Record<string, { unique: number; top: string; frequency: number }>;
}

const SAMPLE_DATASETS: DatasetDef[] = [
    {
        id: 'sales', name: 'sales_q4.csv',
        headers: ['order_id', 'region', 'revenue', 'units', 'order_date', 'customer_id'],
        columnTypes: ['id', 'text', 'numeric', 'numeric', 'date', 'id'],
        rows: [
            ['ORD-001', 'APAC', '$1,240', '3', '2024-10-01', 'C-4521'],
            ['ORD-002', 'Europe', '$890', '2', '2024-10-01', 'C-1823'],
            ['ORD-003', 'APAC', '', '1', '2024-10-02', 'C-7291'],
            ['ORD-004', 'North America', '$2,100', '5', '2024-10-02', 'C-3847'],
            ['ORD-005', 'LATAM', '$445', '1', '2024-10-03', 'C-9102'],
            ['ORD-006', 'MEA', '$1,890', '4', '2024-10-03', 'C-5624'],
        ],
        numericStats: {
            revenue: { mean: 1313, median: 1065, mode: 0, std: 612, min: 0, max: 2100, nulls: 1 },
            units: { mean: 2.67, median: 2.5, mode: 1, std: 1.63, min: 1, max: 5, nulls: 0 },
        },
        categoricalStats: {
            region: { unique: 5, top: 'APAC', frequency: 2 },
        },
    },
    {
        id: 'customers', name: 'customers.parquet',
        headers: ['customer_id', 'name', 'email', 'signup_date', 'plan', 'mrr'],
        columnTypes: ['id', 'text', 'text', 'date', 'text', 'numeric'],
        rows: [
            ['C-4521', 'Aria Chen', 'aria@example.com', '2024-01-15', 'Enterprise', '$2,400'],
            ['C-1823', 'Marcus Weber', 'marcus@example.com', '2024-03-22', 'Pro', '$99'],
            ['C-7291', 'Priya Sharma', 'priya@example.com', '2024-02-08', 'Enterprise', '$2,400'],
            ['C-3847', 'James Liu', 'james@example.com', '2024-06-14', 'Starter', '$29'],
            ['C-9102', 'Sofia Rodriguez', 'sofia@example.com', '2024-04-30', 'Pro', '$99'],
        ],
        numericStats: {
            mrr: { mean: 1005.4, median: 99, mode: 2400, std: 1148, min: 29, max: 2400, nulls: 0 },
        },
        categoricalStats: {
            plan: { unique: 3, top: 'Enterprise', frequency: 2 },
        },
    },
    {
        id: 'inventory', name: 'inventory.xlsx',
        headers: ['sku', 'product', 'category', 'stock', 'reorder_point', 'unit_cost'],
        columnTypes: ['id', 'text', 'text', 'numeric', 'numeric', 'numeric'],
        rows: [
            ['SKU-001', 'Widget A', 'Hardware', '342', '100', '$12.50'],
            ['SKU-002', 'Gadget B', 'Electronics', '18', '50', '$89.99'],
            ['SKU-003', 'Part C', 'Hardware', '1,204', '200', '$3.25'],
            ['SKU-004', 'Module D', 'Electronics', '67', '30', '$145.00'],
        ],
        numericStats: {
            stock: { mean: 407.75, median: 204.5, mode: 0, std: 536, min: 18, max: 1204, nulls: 0 },
            unit_cost: { mean: 62.69, median: 51.25, mode: 0, std: 63, min: 3.25, max: 145, nulls: 0 },
        },
        categoricalStats: {
            category: { unique: 2, top: 'Hardware', frequency: 2 },
        },
    },
];

const STAGES = [
    { id: 'raw' as const, label: 'Raw' },
    { id: 'cleaned' as const, label: 'Cleaned' },
    { id: 'transformed' as const, label: 'Transformed' },
];

interface FilterChip {
    id: string;
    label: string;
    column: string;
    type: 'quick' | 'expression';
}

interface DataPanel {
    id: number;
    datasetId: string;
    stage: 'raw' | 'cleaned' | 'transformed';
    selectedColumn: string | null;
    filters: FilterChip[];
}

let nextPanelId = 2;

function DataInspectionTab() {
    const [panels, setPanels] = useState<DataPanel[]>([
        { id: 1, datasetId: 'sales', stage: 'raw', selectedColumn: null, filters: [] },
    ]);

    const addPanel = () => {
        setPanels(prev => [...prev, {
            id: nextPanelId++,
            datasetId: 'sales',
            stage: 'raw',
            selectedColumn: null,
            filters: [],
        }]);
    };

    const removePanel = (id: number) => {
        setPanels(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev);
    };

    const updatePanel = (id: number, updates: Partial<DataPanel>) => {
        setPanels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    // Auto-tiling: 1 panel = 1 col, 2 = 2 cols, 3 = 3 cols, 4+ = 2-col grid
    const gridCols = panels.length === 1 ? 1 : panels.length === 3 ? 3 : 2;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/50 shrink-0">
                <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Data Inspector
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                    {panels.length} {panels.length === 1 ? 'panel' : 'panels'}
                </span>
                <button
                    onClick={addPanel}
                    className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150 px-2 py-0.5 rounded-md hover:bg-accent"
                >
                    <Plus className="h-3 w-3" /> Add Panel
                </button>
            </div>

            {/* Panel grid */}
            <div
                className="flex-1 overflow-auto p-2"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    gap: '8px',
                    alignContent: 'start',
                }}
            >
                {panels.map(panel => (
                    <SingleDataPanel
                        key={panel.id}
                        panel={panel}
                        canClose={panels.length > 1}
                        onClose={() => removePanel(panel.id)}
                        onUpdate={(updates) => updatePanel(panel.id, updates)}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Single Data Panel ─── */

const QUICK_FILTERS = [
    { id: 'above-avg', label: 'Above average', icon: '↑' },
    { id: 'below-avg', label: 'Below average', icon: '↓' },
    { id: 'top-10', label: 'Top 10%', icon: '⬆' },
    { id: 'outliers', label: 'Outliers (> 2σ)', icon: '⊕' },
    { id: 'non-null', label: 'Non-null only', icon: '∅' },
];

function SingleDataPanel({
    panel,
    canClose,
    onClose,
    onUpdate,
}: {
    panel: DataPanel;
    canClose: boolean;
    onClose: () => void;
    onUpdate: (updates: Partial<DataPanel>) => void;
}) {
    const [filterInput, setFilterInput] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const dataset = SAMPLE_DATASETS.find(d => d.id === panel.datasetId) ?? SAMPLE_DATASETS[0];

    const addQuickFilter = (qf: typeof QUICK_FILTERS[0]) => {
        if (!panel.selectedColumn) return;
        const chip: FilterChip = {
            id: `${qf.id}-${panel.selectedColumn}-${Date.now()}`,
            label: `${panel.selectedColumn} ${qf.label}`,
            column: panel.selectedColumn,
            type: 'quick',
        };
        onUpdate({ filters: [...panel.filters, chip] });
    };

    const addExpressionFilter = () => {
        if (!filterInput.trim()) return;
        const chip: FilterChip = {
            id: `expr-${Date.now()}`,
            label: filterInput.trim(),
            column: '*',
            type: 'expression',
        };
        onUpdate({ filters: [...panel.filters, chip] });
        setFilterInput('');
    };

    const removeFilter = (id: string) => {
        onUpdate({ filters: panel.filters.filter(f => f.id !== id) });
    };

    const selectedStats = panel.selectedColumn && dataset.numericStats?.[panel.selectedColumn];
    const selectedCatStats = panel.selectedColumn && dataset.categoricalStats?.[panel.selectedColumn];

    return (
        <div className="rounded-[10px] border border-border/50 bg-card flex flex-col overflow-hidden min-h-[200px]">
            {/* Panel header: dataset + stage + close */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border/30 bg-muted/20 shrink-0">
                <select
                    value={panel.datasetId}
                    onChange={e => onUpdate({ datasetId: e.target.value, selectedColumn: null, filters: [] })}
                    className="bg-transparent text-[11px] font-medium text-foreground outline-none cursor-pointer truncate max-w-[120px]"
                >
                    {SAMPLE_DATASETS.map(ds => (
                        <option key={ds.id} value={ds.id}>{ds.name}</option>
                    ))}
                </select>
                <span className="text-border">·</span>
                <div className="flex items-center gap-0.5">
                    {STAGES.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <button
                                onClick={() => onUpdate({ stage: s.id })}
                                className={cn(
                                    'px-1.5 py-0.5 rounded text-[10px] transition-colors duration-150',
                                    panel.stage === s.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {s.label}
                            </button>
                            {i < STAGES.length - 1 && <ArrowRightLeft className="h-2 w-2 text-border mx-0.5" />}
                        </div>
                    ))}
                </div>
                <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                    {dataset.rows.length} rows
                </span>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        'p-0.5 rounded transition-colors',
                        showFilters || panel.filters.length > 0 ? 'text-primary' : 'text-muted-foreground/50 hover:text-foreground'
                    )}
                    title="Filters"
                >
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 3h14M4 8h8M6 13h4" /></svg>
                    {panel.filters.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center font-mono">
                            {panel.filters.length}
                        </span>
                    )}
                </button>
                {canClose && (
                    <button onClick={onClose} className="p-0.5 rounded text-muted-foreground/40 hover:text-destructive transition-colors" title="Close panel">
                        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                    </button>
                )}
            </div>

            {/* Filter bar */}
            {showFilters && (
                <div className="px-2.5 py-1.5 border-b border-border/30 space-y-1 shrink-0">
                    {/* Quick filters */}
                    <div className="flex flex-wrap gap-1">
                        {QUICK_FILTERS.map(qf => (
                            <button
                                key={qf.id}
                                onClick={() => addQuickFilter(qf)}
                                disabled={!panel.selectedColumn}
                                className={cn(
                                    'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[9px] transition-colors duration-150',
                                    panel.selectedColumn
                                        ? 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                                        : 'border-border/30 text-muted-foreground/30 cursor-not-allowed'
                                )}
                            >
                                <span>{qf.icon}</span> {qf.label}
                            </button>
                        ))}
                    </div>
                    {/* Expression input */}
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={filterInput}
                            onChange={e => setFilterInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addExpressionFilter()}
                            placeholder="revenue > mean(revenue)"
                            className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/50 rounded-md px-2 py-0.5 focus:border-primary/50"
                        />
                        <button
                            onClick={addExpressionFilter}
                            disabled={!filterInput.trim()}
                            className="text-[10px] text-primary hover:text-primary/80 disabled:text-muted-foreground/30 transition-colors px-1"
                        >
                            Apply
                        </button>
                    </div>
                    {/* Active filters */}
                    {panel.filters.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                            {panel.filters.map(f => (
                                <span key={f.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[9px]">
                                    {f.label}
                                    <button onClick={() => removeFilter(f.id)} className="hover:text-destructive transition-colors">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                    {!panel.selectedColumn && (
                        <p className="text-[9px] text-muted-foreground/60 italic">Click a column header to enable quick filters</p>
                    )}
                </div>
            )}

            {/* Data table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-border bg-muted/30">
                            {dataset.headers.map((h, hi) => (
                                <th
                                    key={h}
                                    onClick={() => onUpdate({ selectedColumn: panel.selectedColumn === h ? null : h })}
                                    className={cn(
                                        'text-left py-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 select-none',
                                        panel.selectedColumn === h
                                            ? 'text-primary bg-primary/5'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <div className="flex items-center gap-1">
                                        {h}
                                        <span className="text-[8px] font-normal opacity-50">{dataset.columnTypes[hi]}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataset.rows.map((row, i) => (
                            <tr key={i} className="border-b border-border/20 hover:bg-accent/30 transition-colors duration-150">
                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        className={cn(
                                            'py-1 px-2.5 text-[11px]',
                                            dataset.columnTypes[j] === 'id' ? 'font-medium font-mono' : '',
                                            dataset.columnTypes[j] === 'numeric' ? 'font-mono text-muted-foreground' : '',
                                            cell === '' ? 'bg-destructive/5' : '',
                                            panel.selectedColumn === dataset.headers[j] ? 'bg-primary/5' : '',
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

            {/* Stats bar */}
            <div className="px-2.5 py-1.5 border-t border-border/30 bg-muted/10 shrink-0">
                {selectedStats ? (
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground overflow-x-auto">
                        <span className="text-foreground font-medium font-sans">{panel.selectedColumn}</span>
                        <span>μ {selectedStats.mean.toLocaleString()}</span>
                        <span>med {selectedStats.median.toLocaleString()}</span>
                        <span>mode {selectedStats.mode}</span>
                        <span>σ {selectedStats.std.toLocaleString()}</span>
                        <span>min {selectedStats.min.toLocaleString()}</span>
                        <span>max {selectedStats.max.toLocaleString()}</span>
                        {selectedStats.nulls > 0 && <span className="text-destructive">{selectedStats.nulls} nulls</span>}
                    </div>
                ) : selectedCatStats ? (
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                        <span className="text-foreground font-medium font-sans">{panel.selectedColumn}</span>
                        <span>{selectedCatStats.unique} unique</span>
                        <span>top: {selectedCatStats.top}</span>
                        <span>freq: {selectedCatStats.frequency}</span>
                    </div>
                ) : (
                    <p className="text-[10px] text-muted-foreground/50 italic">Click a column header to see statistics</p>
                )}
            </div>
        </div>
    );
}


/* ─── Ledger Tab (enriched) ─── */

function LedgerTab() {
    const [expandedStep, setExpandedStep] = useState<number | null>(null);
    const [showDiff, setShowDiff] = useState<number | null>(null);

    return (
        <div className="p-4 space-y-3">
            {/* Prompt + Approved Plan header */}
            <div className="rounded-[10px] border border-border/50 bg-card overflow-hidden">
                <div className="px-3 py-2 border-b border-border/30 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Prompt</span>
                    </div>
                    <p className="text-xs text-foreground mt-1">"{MOCK_LEDGER.prompt}"</p>
                </div>
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Approved Plan</span>
                        {!MOCK_LEDGER.userEdited && (
                            <span className="inline-flex items-center rounded-md bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                                auto-approved
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{MOCK_LEDGER.approvedPlan}</p>
                </div>
            </div>

            {/* Chain metadata */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Computation Chain
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                    {MOCK_LEDGER.steps.length} steps · {MOCK_LEDGER.totalDuration} total
                </span>
            </div>

            {/* Steps */}
            {MOCK_LEDGER.steps.map((step, i) => (
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
                        {i < MOCK_LEDGER.steps.length - 1 && <div className="w-px flex-1 bg-border/50 my-0.5" />}
                    </div>

                    {/* Step card */}
                    <div className="flex-1 mb-1">
                        <button
                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                            className={cn(
                                'w-full rounded-[10px] border px-3 py-2 text-left transition-all duration-150',
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
                                    <ChevronRight className={cn('h-3 w-3 text-muted-foreground transition-transform duration-150', expandedStep === step.id && 'rotate-90')} />
                                </div>
                            </div>
                        </button>

                        {/* Expanded: code + data diff */}
                        {expandedStep === step.id && (
                            <div className="mt-1.5 space-y-2">
                                {/* Code */}
                                <div className="rounded-[10px] bg-[--ledger-bg] border border-[--ledger-border] p-2.5 overflow-x-auto">
                                    <pre className="text-[11px] font-mono text-[--code] leading-relaxed whitespace-pre">{step.code}</pre>
                                </div>

                                {/* Data diff toggle */}
                                {step.affectedRows && (
                                    <div>
                                        <button
                                            onClick={() => setShowDiff(showDiff === step.id ? null : step.id)}
                                            className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors duration-150"
                                        >
                                            <Eye className="h-3 w-3" />
                                            {showDiff === step.id ? 'Hide' : 'View'} affected rows — {step.diffLabel}
                                        </button>

                                        {showDiff === step.id && (
                                            <div className="mt-1.5 rounded-[10px] border border-border/50 overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-border bg-muted/30">
                                                            {step.affectedHeaders!.map(h => (
                                                                <th key={h} className="text-left py-1 px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {step.affectedRows.map((row, ri) => (
                                                            <tr key={ri} className={cn(
                                                                'border-b border-border/20 transition-colors duration-150',
                                                                row.some(c => c === '—' || c === '✗ removed') ? 'bg-destructive/5' : 'hover:bg-accent/30'
                                                            )}>
                                                                {row.map((cell, ci) => (
                                                                    <td key={ci} className={cn(
                                                                        'py-1 px-2 text-[11px] font-mono',
                                                                        cell === '—' ? 'text-destructive italic' : '',
                                                                        cell === '✗ removed' ? 'text-destructive' : '',
                                                                        cell === '✓ kept' ? 'text-[--success]' : '',
                                                                    )}>
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="px-2 py-1 border-t border-border/30 bg-muted/10">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Showing {step.affectedRows.length} of {step.diffLabel?.match(/\d+/)?.[0]} affected rows
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Output summary */}
            <div className="rounded-[10px] border border-primary/20 bg-primary/5 px-3 py-2">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Output</span>
                </div>
                <p className="text-xs text-foreground mt-1">{MOCK_LEDGER.output}</p>
            </div>
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
