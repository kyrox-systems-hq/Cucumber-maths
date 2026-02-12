/* ─────────────────────────────────────────────
 * Cucumber Maths — Engine Interface
 * Every compute engine implements this contract
 * ───────────────────────────────────────────── */

import type { EngineId, EngineRequest, EngineResult } from '@shared/types';

/**
 * Base interface for all compute engines.
 * 
 * Engines are the computational muscle of Cucumber Maths.
 * They don't understand users — they understand operations.
 * Agents decide WHAT to compute; engines know HOW.
 */
export interface Engine {
    /** Unique engine identifier */
    readonly id: EngineId;

    /** Human-readable engine name */
    readonly name: string;

    /** List of operations this engine supports */
    readonly capabilities: string[];

    /**
     * Execute a computation.
     * @param request - The operation to perform with parameters
     * @returns Structured result including output, code used, and timing
     */
    execute(request: EngineRequest): Promise<EngineResult>;

    /**
     * Validate whether a request can be executed.
     * Used by agents to check before committing to an operation.
     */
    validate(request: EngineRequest): ValidationResult;

    /**
     * Self-describe this engine's capabilities.
     * Used by agents to understand what this engine can do.
     */
    describe(): EngineManifest;

    /**
     * Initialize the engine (load resources, warm up).
     * Called once during startup.
     */
    init(): Promise<void>;

    /**
     * Clean up engine resources.
     */
    dispose(): Promise<void>;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface EngineManifest {
    id: EngineId;
    name: string;
    description: string;
    capabilities: CapabilityDef[];
    inputFormats: string[];
    outputFormats: string[];
}

export interface CapabilityDef {
    operation: string;
    description: string;
    requiredParams: string[];
    optionalParams: string[];
    exampleUsage: string;
}
