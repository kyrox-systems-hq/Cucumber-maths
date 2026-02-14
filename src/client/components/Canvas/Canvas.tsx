import { Plus, Table2, BarChart3, Type, Hash, Code2, Database, ListChecks, Layout, FileSearch, ArrowRightLeft, Play, MessageSquare, ClipboardCheck, ChevronRight, Eye, Pencil, Trash2, CheckCircle2, X as XIcon, GripVertical, FileEdit, Send, ChevronDown } from 'lucide-react';
import { cn } from '@client/lib/utils';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@client/components/ui/tabs';
import { Panel as ResizablePanel, Group as ResizablePanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { RichCommandInput } from '@client/components/ui/rich-command-input';

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

interface CanvasProps {
    className?: string;
    onTabChange?: (tab: string) => void;
    selectedTableId?: string | null;
}

export function Canvas({ className, onTabChange, selectedTableId }: CanvasProps) {
    // In a real app, `hasPlan` would come from a global store/context
    // Toggle this to simulate an active execution preview
    const [hasPlan, setHasPlan] = useState(true);
    const [activeTab, setActiveTab] = useState('data');

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    const simulatePrompt = () => {
        setHasPlan(true);
        handleTabChange('preview');
    };

    const dismissPreview = () => {
        setHasPlan(false);
        handleTabChange('data');
    };

    return (
        <div className={cn('flex flex-col h-full bg-background overflow-hidden', className)}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
                {/* Tab bar */}
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-card shrink-0">
                    <TabsList className="h-8 bg-transparent p-0 gap-1">
                        <TabsTrigger
                            value="scratchpad"
                            className="h-7 px-3 text-xs rounded-md data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
                        >
                            <FileEdit className="h-3 w-3 mr-1.5" />
                            Scratchpad
                        </TabsTrigger>
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

                {/* Scratchpad tab */}
                <TabsContent value="scratchpad" className="flex-1 mt-0 overflow-y-auto">
                    <ScratchpadTab />
                </TabsContent>

                {/* Data tab */}
                <TabsContent value="data" className="flex-1 mt-0 overflow-y-auto">
                    <DataInspectionTab selectedTableId={selectedTableId ?? null} />
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
    {
        id: 'inventory-reorder', name: 'reorder_history',
        headers: ['reorder_id', 'sku', 'qty_ordered', 'order_date', 'supplier', 'status'],
        columnTypes: ['id', 'id', 'numeric', 'date', 'text', 'text'],
        rows: [
            ['RO-001', 'SKU-002', '100', '2024-09-15', 'TechParts Inc.', 'Delivered'],
            ['RO-002', 'SKU-004', '50', '2024-10-01', 'ModuleCo', 'In Transit'],
            ['RO-003', 'SKU-002', '75', '2024-10-20', 'TechParts Inc.', 'Pending'],
            ['RO-004', 'SKU-001', '200', '2024-11-05', 'WidgetWorks', 'Pending'],
        ],
        numericStats: {
            qty_ordered: { mean: 106.25, median: 87.5, mode: 0, std: 65, min: 50, max: 200, nulls: 0 },
        },
        categoricalStats: {
            supplier: { unique: 3, top: 'TechParts Inc.', frequency: 2 },
            status: { unique: 3, top: 'Pending', frequency: 2 },
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

interface Calculation {
    id: string;
    fn: string;
    column: string;
    label: string;
    value: string;
}

interface DataPanelState {
    id: number;
    datasetId: string;
    stage: 'raw' | 'cleaned' | 'transformed';
    selectedColumn: string | null;
    filters: FilterChip[];
    calculations: Calculation[];
}

const CQL_FUNCTIONS = [
    'SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'MEDIAN',
    'MODE', 'STDEV', 'VARIANCE', 'PERCENTILE', 'DISTINCT', 'NULLS',
];

/* Mock CQL evaluator — returns fake computed values */
function evalCQL(fn: string, column: string, datasetId: string): string {
    const mockResults: Record<string, Record<string, Record<string, string>>> = {
        sales: {
            revenue: { SUM: '$6,965', COUNT: '6', AVG: '$1,161', MIN: '$0', MAX: '$2,100', MEDIAN: '$1,065', MODE: '$0', STDEV: '$612', VARIANCE: '$374,544', PERCENTILE: '$1,890 (p90)', DISTINCT: '5', NULLS: '1' },
            units: { SUM: '16', COUNT: '6', AVG: '2.67', MIN: '1', MAX: '5', MEDIAN: '2.5', MODE: '1', STDEV: '1.63', VARIANCE: '2.67', PERCENTILE: '4.6 (p90)', DISTINCT: '4', NULLS: '0' },
        },
        customers: {
            mrr: { SUM: '$5,027', COUNT: '5', AVG: '$1,005', MIN: '$29', MAX: '$2,400', MEDIAN: '$99', MODE: '$2,400', STDEV: '$1,148', VARIANCE: '$1,317,904', PERCENTILE: '$2,400 (p90)', DISTINCT: '3', NULLS: '0' },
        },
        inventory: {
            stock: { SUM: '1,631', COUNT: '4', AVG: '407.75', MIN: '18', MAX: '1,204', MEDIAN: '204.5', MODE: '—', STDEV: '536', VARIANCE: '287,296', PERCENTILE: '1,030 (p90)', DISTINCT: '4', NULLS: '0' },
            unit_cost: { SUM: '$250.74', COUNT: '4', AVG: '$62.69', MIN: '$3.25', MAX: '$145.00', MEDIAN: '$51.25', MODE: '—', STDEV: '$63', VARIANCE: '$3,969', PERCENTILE: '$134 (p90)', DISTINCT: '4', NULLS: '0' },
        },
    };
    return mockResults[datasetId]?.[column]?.[fn] ?? '—';
}

let nextPanelId = 2;
let nextRowId = 2;

/* Row-based layout: each row holds panel IDs, rendered as a horizontal PanelGroup */
interface PanelRow {
    id: number;
    panelIds: number[];
}


function DataInspectionTab({ selectedTableId }: { selectedTableId: string | null }) {
    const [panels, setPanels] = useState<DataPanelState[]>([
        { id: 1, datasetId: 'sales', stage: 'raw', selectedColumn: null, filters: [], calculations: [] },
    ]);
    const [rows, setRows] = useState<PanelRow[]>([{ id: 1, panelIds: [1] }]);
    const [dragPanelId, setDragPanelId] = useState<number | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);



    const [addError, setAddError] = useState<string | null>(null);

    const addPanel = () => {
        if (!selectedTableId) {
            setAddError('Select a table from Sources first');
            setTimeout(() => setAddError(null), 3000);
            return;
        }
        setAddError(null);
        const newId = nextPanelId++;
        const newPanel: DataPanelState = {
            id: newId, datasetId: selectedTableId, stage: 'raw',
            selectedColumn: null, filters: [], calculations: [],
        };
        setPanels(prev => [...prev, newPanel]);
        setRows(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                panelIds: [...updated[updated.length - 1].panelIds, newId],
            };
            return updated;
        });
    };

    const removePanel = (id: number) => {
        if (panels.length <= 1) return;
        setPanels(prev => prev.filter(p => p.id !== id));
        setRows(prev => {
            const updated = prev.map(r => ({
                ...r,
                panelIds: r.panelIds.filter(pid => pid !== id),
            })).filter(r => r.panelIds.length > 0);
            return updated.length > 0 ? updated : [{ id: nextRowId++, panelIds: [] }];
        });
    };

    const updatePanel = (id: number, updates: Partial<DataPanelState>) => {
        setPanels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    /* Drag-and-drop: move panel between rows */
    const handleDragStart = (panelId: number) => { setDragPanelId(panelId); };
    const handleDragEnd = () => { setDragPanelId(null); setDropTarget(null); };

    const handleDropOnRow = (targetRowId: number) => {
        if (dragPanelId === null) return;
        setRows(prev => {
            let updated = prev.map(r => ({ ...r, panelIds: r.panelIds.filter(pid => pid !== dragPanelId) }));
            updated = updated.map(r => r.id === targetRowId ? { ...r, panelIds: [...r.panelIds, dragPanelId] } : r);
            return updated.filter(r => r.panelIds.length > 0);
        });
        setDragPanelId(null); setDropTarget(null);
    };

    const handleDropNewRow = (afterRowId: number | null) => {
        if (dragPanelId === null) return;
        setRows(prev => {
            let updated = prev.map(r => ({ ...r, panelIds: r.panelIds.filter(pid => pid !== dragPanelId) }));
            updated = updated.filter(r => r.panelIds.length > 0);
            const newRow: PanelRow = { id: nextRowId++, panelIds: [dragPanelId] };
            if (afterRowId === null) { updated.push(newRow); }
            else { const idx = updated.findIndex(r => r.id === afterRowId); updated.splice(idx + 1, 0, newRow); }
            return updated;
        });
        setDragPanelId(null); setDropTarget(null);
    };



    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/50 shrink-0">
                <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Data Inspector</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                    {panels.length} {panels.length === 1 ? 'panel' : 'panels'} · {rows.length} {rows.length === 1 ? 'row' : 'rows'}
                </span>
                <button onClick={addPanel} className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150 px-2 py-0.5 rounded-md hover:bg-accent">
                    <Plus className="h-3 w-3" /> Add Panel
                </button>
                {addError && (
                    <span className="text-[10px] text-destructive animate-pulse">{addError}</span>
                )}
            </div>

            {/* Row-based panel grid */}
            <div className="flex-1 overflow-auto p-2 space-y-2">
                {rows.map((row, ri) => {
                    const rowPanels = row.panelIds.map(pid => panels.find(p => p.id === pid)).filter(Boolean) as DataPanelState[];
                    if (rowPanels.length === 0) return null;
                    return (
                        <div key={row.id}>
                            {ri === 0 && dragPanelId !== null && (
                                <div
                                    className={cn('h-3 rounded border-2 border-dashed mb-1 transition-colors', dropTarget === `new-above-${row.id}` ? 'border-primary bg-primary/10' : 'border-transparent')}
                                    onDragOver={e => { e.preventDefault(); setDropTarget(`new-above-${row.id}`); }}
                                    onDragLeave={() => setDropTarget(null)}
                                    onDrop={e => { e.preventDefault(); handleDropNewRow(null); }}
                                />
                            )}
                            <div
                                className={cn('rounded-lg border overflow-hidden transition-colors', dropTarget === `row-${row.id}` ? 'border-primary bg-primary/5' : 'border-border/30')}
                                onDragOver={e => { e.preventDefault(); if (dragPanelId !== null && !row.panelIds.includes(dragPanelId)) setDropTarget(`row-${row.id}`); }}
                                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); }}
                                onDrop={e => { e.preventDefault(); handleDropOnRow(row.id); }}
                                style={{ minHeight: 220 }}
                            >
                                <ResizablePanelGroup orientation="horizontal" className="h-full" style={{ minHeight: 220 }}>
                                    {rowPanels.flatMap((panel, i) => {
                                        const els: React.ReactNode[] = [];
                                        if (i > 0) els.push(
                                            <PanelResizeHandle key={`h-${row.id}-${panel.id}`} className="w-1.5 bg-transparent hover:bg-primary/20 active:bg-primary/30 transition-colors flex items-center justify-center group">
                                                <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                            </PanelResizeHandle>
                                        );
                                        els.push(
                                            <ResizablePanel key={panel.id} id={`p-${row.id}-${panel.id}`} minSize={20}>
                                                <SingleDataPanel
                                                    panel={panel} canClose={panels.length > 1}
                                                    onClose={() => removePanel(panel.id)}
                                                    onUpdate={updates => updatePanel(panel.id, updates)}
                                                    onDragStart={() => handleDragStart(panel.id)}
                                                    onDragEnd={handleDragEnd}
                                                    isDragging={dragPanelId === panel.id}
                                                />
                                            </ResizablePanel>
                                        );
                                        return els;
                                    })}
                                </ResizablePanelGroup>
                            </div>
                            {dragPanelId !== null && (
                                <div
                                    className={cn('h-3 rounded border-2 border-dashed mt-1 transition-colors', dropTarget === `new-below-${row.id}` ? 'border-primary bg-primary/10' : 'border-transparent')}
                                    onDragOver={e => { e.preventDefault(); setDropTarget(`new-below-${row.id}`); }}
                                    onDragLeave={() => setDropTarget(null)}
                                    onDrop={e => { e.preventDefault(); handleDropNewRow(row.id); }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>


        </div>
    );
}

/* ─── Single Data Panel (draggable card with dense header) ─── */

const QUICK_FILTERS = [
    { id: 'above-avg', label: '> avg', icon: '↑' },
    { id: 'below-avg', label: '< avg', icon: '↓' },
    { id: 'top-10', label: 'Top 10%', icon: '⬆' },
    { id: 'outliers', label: '> 2σ', icon: '⊕' },
    { id: 'non-null', label: 'Non-null', icon: '∅' },
];

function SingleDataPanel({
    panel,
    canClose,
    onClose,
    onUpdate,
    onDragStart,
    onDragEnd,
    isDragging,
}: {
    panel: DataPanelState;
    canClose: boolean;
    onClose: () => void;
    onUpdate: (updates: Partial<DataPanelState>) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    isDragging: boolean;
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
        <div className={cn(
            'h-full flex flex-col overflow-hidden bg-card transition-opacity duration-200',
            isDragging ? 'opacity-40' : 'opacity-100',
        )}>
            {/* ── Draggable header ── */}
            <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border/30 bg-muted/20 shrink-0 min-w-0 cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
                onDragEnd={onDragEnd}
            >
                <GripVertical className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                <span className="text-[11px] font-medium text-foreground truncate" title={dataset.name}>
                    {dataset.name}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                    {STAGES.map(s => (
                        <button key={s.id} onClick={() => onUpdate({ stage: s.id })}
                            className={cn('px-1.5 py-0.5 rounded text-[10px] transition-colors shrink-0',
                                panel.stage === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground/60 hover:text-foreground'
                            )} title={s.label}>{s.label}</button>
                    ))}
                </div>
                <div className="flex-1 min-w-0" />
                <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">{dataset.rows.length} rows</span>
                <button onClick={() => setShowFilters(!showFilters)}
                    className={cn('p-0.5 rounded shrink-0 transition-colors', showFilters || panel.filters.length > 0 ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground')}
                    title="Filters">
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 3h14M4 8h8M6 13h4" /></svg>
                </button>
                {canClose && (
                    <button onClick={onClose} className="p-0.5 rounded shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors" title="Close panel">
                        <XIcon className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* ── Filter bar ── */}
            {showFilters && (
                <div className="px-2.5 py-1.5 border-b border-border/30 space-y-1 shrink-0">
                    <div className="flex flex-wrap gap-1">
                        {QUICK_FILTERS.map(qf => (
                            <button key={qf.id} onClick={() => addQuickFilter(qf)} disabled={!panel.selectedColumn}
                                className={cn('inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] transition-colors',
                                    panel.selectedColumn ? 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30' : 'border-border/30 text-muted-foreground/30 cursor-not-allowed'
                                )}>
                                <span>{qf.icon}</span> {qf.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <input type="text" value={filterInput} onChange={e => setFilterInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addExpressionFilter()}
                            placeholder="revenue > mean(revenue)"
                            className="flex-1 min-w-0 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/50 outline-none border border-border/50 rounded px-2 py-0.5 focus:border-primary/50" />
                        <button onClick={addExpressionFilter} disabled={!filterInput.trim()}
                            className="text-[10px] text-primary hover:text-primary/80 disabled:text-muted-foreground/30 transition-colors px-1.5 shrink-0">Apply</button>
                    </div>
                    {panel.filters.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                            {panel.filters.map(f => (
                                <span key={f.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px]">
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

            {/* ── Data table ── */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-border bg-muted/30">
                            {dataset.headers.map((h, hi) => (
                                <th
                                    key={h}
                                    onClick={() => onUpdate({ selectedColumn: panel.selectedColumn === h ? null : h })}
                                    className={cn(
                                        'text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150 select-none whitespace-nowrap',
                                        panel.selectedColumn === h
                                            ? 'text-primary bg-primary/5'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <div className="flex items-center gap-1">
                                        {h}
                                        <span className="text-[9px] font-normal opacity-50">{dataset.columnTypes[hi]}</span>
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
                                            'py-1.5 px-3 text-xs whitespace-nowrap',
                                            dataset.columnTypes[j] === 'id' ? 'font-medium font-mono' : '',
                                            dataset.columnTypes[j] === 'numeric' ? 'font-mono text-muted-foreground' : '',
                                            cell === '' ? 'bg-destructive/5' : '',
                                            panel.selectedColumn === dataset.headers[j] ? 'bg-primary/5' : '',
                                        )}
                                    >
                                        {cell === '' ? <span className="text-destructive text-[11px] italic">null</span> : cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Stats bar ── */}
            <div className="px-2 py-1 border-t border-border/30 bg-muted/10 shrink-0">
                {selectedStats ? (
                    <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground overflow-x-auto">
                        <span className="text-foreground font-medium font-sans shrink-0">{panel.selectedColumn}</span>
                        <span>μ{selectedStats.mean.toLocaleString()}</span>
                        <span>med{selectedStats.median.toLocaleString()}</span>
                        <span>σ{selectedStats.std.toLocaleString()}</span>
                        <span>{selectedStats.min.toLocaleString()}–{selectedStats.max.toLocaleString()}</span>
                        {selectedStats.nulls > 0 && <span className="text-destructive">{selectedStats.nulls}∅</span>}
                    </div>
                ) : selectedCatStats ? (
                    <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                        <span className="text-foreground font-medium font-sans shrink-0">{panel.selectedColumn}</span>
                        <span>{selectedCatStats.unique}u</span>
                        <span>top:{selectedCatStats.top}</span>
                    </div>
                ) : (
                    <p className="text-[9px] text-muted-foreground/40 italic">Select column for stats</p>
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

/* ─── Scratchpad Tab ─── */

interface Scratchpad {
    id: string;
    name: string;
    content: string;
}

const INITIAL_PADS: Scratchpad[] = [
    {
        id: 'pad-1', name: 'Revenue Analysis',
        content: `EMEA is showing a potential 12% YoY revenue decline. Let me investigate what's driving this.

First, get total revenue by product category:

/SUM(sales.revenue)
  @region = 'EMEA'
  @quarter IN (Q3, Q4)
  GROUP BY product_category

Then check customer churn — how many EMEA customers haven't ordered since October?

/COUNT(DISTINCT customers.id)
  @region = 'EMEA'
  @last_order_date < '2025-10-01'

If churn is above 1,500 we should flag this for the Q1 strategy review.
Create a summary table with both results grouped by category.`,
    },
];

function ScratchpadTab() {
    const [pads, setPads] = useState<Scratchpad[]>(INITIAL_PADS);
    const [activePadId, setActivePadId] = useState(INITIAL_PADS[0].id);
    const [padMenuOpen, setPadMenuOpen] = useState(false);

    const activePad = pads.find(p => p.id === activePadId) || pads[0];

    const updateContent = (content: string) => {
        setPads(prev => prev.map(p => p.id === activePadId ? { ...p, content } : p));
    };

    const addPad = () => {
        const pad: Scratchpad = { id: `pad-${Date.now()}`, name: `Scratchpad ${pads.length + 1}`, content: '' };
        setPads(prev => [...prev, pad]);
        setActivePadId(pad.id);
        setPadMenuOpen(false);
    };

    const wordCount = activePad.content.trim() ? activePad.content.trim().split(/\s+/).length : 0;

    return (
        <div className="flex flex-col h-full">
            {/* Pad selector header */}
            <div className="px-4 pt-3 pb-2 border-b border-border/30 shrink-0">
                <div className="relative">
                    <button
                        onClick={() => setPadMenuOpen(!padMenuOpen)}
                        className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors"
                    >
                        <FileEdit className="h-3.5 w-3.5 text-muted-foreground" />
                        {activePad.name}
                        <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform duration-150', padMenuOpen && 'rotate-180')} />
                    </button>
                    {padMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-md border border-border bg-popover shadow-lg py-1">
                            {pads.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { setActivePadId(p.id); setPadMenuOpen(false); }}
                                    className={cn(
                                        'w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors',
                                        p.id === activePadId ? 'text-primary font-medium' : 'text-foreground',
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                            <div className="border-t border-border/50 mt-1 pt-1">
                                <button
                                    onClick={addPad}
                                    className="w-full text-left px-3 py-1.5 text-xs text-primary hover:bg-accent transition-colors flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> New Scratchpad
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unified editor */}
            <div className="flex-1 overflow-y-auto p-4">
                <RichCommandInput
                    onChange={updateContent}
                    placeholder="Write freely — type / for CQL commands, @ for data references…"
                    editorClassName="text-sm"
                    minHeight="300px"
                    onKeyDown={e => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                            e.preventDefault();
                            // TODO: send to Preview
                        }
                    }}
                />
            </div>

            {/* Footer bar */}
            <div className="px-4 py-2.5 border-t border-border/30 shrink-0 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/40">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    <span className="mx-1.5">·</span>
                    Ctrl+Enter to preview
                </span>
                <button
                    disabled={!activePad.content.trim()}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground/30 border border-primary/20 hover:border-primary/40 disabled:border-border/30 rounded-md px-3 py-1.5 transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Send to Preview
                </button>
            </div>
        </div>
    );
}
