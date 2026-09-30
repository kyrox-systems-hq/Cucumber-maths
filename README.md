# 🥒 Cucumber Maths

> **Agent-native universal computation platform** — from a child's homework to a rocket scientist's orbital mechanics. Zero formulas to learn.

An alternative to Excel, Power BI, MATLAB, and R — built from scratch for AI agents. Humans describe what they want in natural language. Agents run specialized compute engines. Results appear live on a visual canvas.

## Architecture

```
┌──────────────────────────────────────────────┐
│              AGENT LAYER                      │
│  Understands intent, plans, composes engines  │
├──────────────────────────────────────────────┤
│              ENGINE LAYER                     │
│  🗄️ Tabular  📊 Statistical  🔢 Numerical    │
│  ∑ Symbolic  🎲 Simulation  📈 Visualization │
│  📝 Narrative                                │
└──────────────────────────────────────────────┘
```

## Product Direction

The original product vision remains in [docs/VISION.md](docs/VISION.md).

The current next-generation architecture direction is documented in [docs/NEXT_GENERATION_ARCHITECTURE.md](docs/NEXT_GENERATION_ARCHITECTURE.md). It reframes Cucumber around a fluid semantic document, polymorphic computational objects, an analytical state graph, first-class assumptions, active verification and a computation/provenance ledger.

## Quick Start

```bash
npm install
npm run dev
```

## Tech Stack

- **Frontend**: React 19 + Vite 6
- **Backend**: Fastify 5 + TypeScript
- **Analytics**: DuckDB (in-process OLAP)
- **Scientific**: Pyodide (Python-in-WASM)
- **Charting**: Observable Plot + D3.js
- **LLM**: Vercel AI SDK

## License

Proprietary — Kyrox Systems HQ
