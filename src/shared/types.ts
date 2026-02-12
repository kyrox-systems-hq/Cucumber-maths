/* ─────────────────────────────────────────────
 * Cucumber Maths — Shared Types
 * Types used by both client and server
 * ───────────────────────────────────────────── */

// ── Engine Types ──────────────────────────────

export type EngineId =
    | 'tabular'
    | 'statistical'
    | 'numerical'
    | 'symbolic'
    | 'simulation'
    | 'visualization'
    | 'narrative';

export interface EngineRequest {
    engineId: EngineId;
    operation: string;
    params: Record<string, unknown>;
    data?: DataReference;
    options?: Record<string, unknown>;
}

export interface EngineResult {
    engineId: EngineId;
    operation: string;
    status: 'success' | 'error';
    output: EngineOutput;
    code: string;
    durationMs: number;
    error?: string;
}

export interface EngineOutput {
    data?: unknown;
    visualization?: VizSpec;
    equation?: string;
    narrative?: string;
    metadata: Record<string, unknown>;
}

export interface DataReference {
    datasetId: string;
    columns?: string[];
    filter?: string;
}

// ── Visualization Types ───────────────────────

export interface VizSpec {
    type: 'line' | 'bar' | 'scatter' | 'pie' | 'histogram' | 'heatmap' | 'boxplot' | 'area';
    data: Record<string, unknown>[];
    encoding: {
        x?: FieldEncoding;
        y?: FieldEncoding;
        color?: FieldEncoding;
        size?: FieldEncoding;
        label?: FieldEncoding;
    };
    title?: string;
    options?: Record<string, unknown>;
}

export interface FieldEncoding {
    field: string;
    type: 'quantitative' | 'ordinal' | 'nominal' | 'temporal';
    aggregate?: string;
    title?: string;
}

// ── Canvas Types ──────────────────────────────

export type BlockType =
    | 'table'
    | 'chart'
    | 'metric'
    | 'equation'
    | 'model'
    | 'narrative'
    | 'code'
    | 'simulation';

export interface CanvasBlock {
    id: string;
    type: BlockType;
    title: string;
    content: unknown;
    code?: string;
    engineId?: EngineId;
    position: { x: number; y: number };
    size: { width: number; height: number };
    createdAt: number;
}

// ── Chat Types ────────────────────────────────

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    blocks?: string[];
    timestamp: number;
}

// ── Dataset Types ─────────────────────────────

export interface Dataset {
    id: string;
    name: string;
    fileName?: string;
    columns: ColumnDef[];
    rowCount: number;
    sizeBytes: number;
    createdAt: number;
}

export interface ColumnDef {
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'category';
    nullable: boolean;
    stats?: ColumnStats;
}

export interface ColumnStats {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    stdDev?: number;
    distinctCount: number;
    nullCount: number;
    nullPercent: number;
}

// ── Workspace Types ───────────────────────────

export interface Workspace {
    id: string;
    name: string;
    datasets: string[];
    blocks: CanvasBlock[];
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}
