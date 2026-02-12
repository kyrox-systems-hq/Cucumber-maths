/* ─────────────────────────────────────────────
 * Cucumber Maths — Engine Registry
 * Central registry for all compute engines.
 * Agents use this to discover and dispatch to engines.
 * ───────────────────────────────────────────── */

import type { EngineId, EngineRequest, EngineResult } from '@shared/types';
import type { Engine, EngineManifest } from './Engine';

export class EngineRegistry {
    private engines = new Map<EngineId, Engine>();

    /** Register an engine in the registry */
    register(engine: Engine): void {
        if (this.engines.has(engine.id)) {
            throw new Error(`Engine "${engine.id}" is already registered`);
        }
        this.engines.set(engine.id, engine);
    }

    /** Get an engine by ID */
    get(id: EngineId): Engine {
        const engine = this.engines.get(id);
        if (!engine) {
            throw new Error(`Engine "${id}" not found. Available: ${this.list().join(', ')}`);
        }
        return engine;
    }

    /** Check if an engine is registered */
    has(id: EngineId): boolean {
        return this.engines.has(id);
    }

    /** List all registered engine IDs */
    list(): EngineId[] {
        return Array.from(this.engines.keys());
    }

    /** Get manifests for all engines (used by agents to understand capabilities) */
    manifests(): EngineManifest[] {
        return Array.from(this.engines.values()).map(e => e.describe());
    }

    /** Execute a request by routing to the correct engine */
    async execute(request: EngineRequest): Promise<EngineResult> {
        const engine = this.get(request.engineId);

        const validation = engine.validate(request);
        if (!validation.valid) {
            return {
                engineId: request.engineId,
                operation: request.operation,
                status: 'error',
                output: { metadata: {} },
                code: '',
                durationMs: 0,
                error: `Validation failed: ${validation.errors.join(', ')}`,
            };
        }

        return engine.execute(request);
    }

    /** Initialize all registered engines */
    async initAll(): Promise<void> {
        const inits = Array.from(this.engines.values()).map(e => e.init());
        await Promise.all(inits);
    }

    /** Dispose all registered engines */
    async disposeAll(): Promise<void> {
        const disposals = Array.from(this.engines.values()).map(e => e.dispose());
        await Promise.all(disposals);
    }
}
