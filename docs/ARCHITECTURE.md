# Architecture

## Layered Model

The repository keeps the original GSD layering:

1. `commands/gsd/`
   User-facing entry points.
2. `get-shit-done/workflows/`
   Thin orchestrators that load context and route work.
3. `agents/`
   Specialized workers for research, planning, execution, verification, and operations documentation.
4. `get-shit-done/templates/`
   Planning and operations artifact templates.
5. `.planning/`
   Runtime state written into the user project.

## Preserved Framework

- `phase + wave` orchestration
- Thin orchestrators over specialized agents
- File-based planning state
- Explicit verification and audit steps

## Analysis Kernel

The default kernel is now operations analysis instead of development/TDD execution.

- `Latency`
- `Traffic`
- `Errors`
- `Saturation`

Plans can declare a primary `golden_signal` and downstream summaries surface signal focus, alert thresholds, and runbook impact.

## Data Flow

Typical flow:

1. Initialize project context.
2. Plan the phase with signal-focused work packages.
3. Execute the phase in waves.
4. Verify the phase outcome.
5. Generate and audit operations documentation.

## Core Artifacts

- `PROJECT.md`
- `REQUIREMENTS.md`
- `ROADMAP.md`
- `STATE.md`
- `phases/*`
- `operations/*` including deployment, monitoring, capacity, runbook, backup, and security docs

## Design Principles

- Fresh context per specialized agent
- Thin orchestrators, not monolithic prompts
- Human-readable state instead of hidden memory
- Verification before and after execution
- Reusable framework, operations-specific analysis content
