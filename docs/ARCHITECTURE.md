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

## Data Flow

Typical flow:

1. Initialize project context.
2. Discuss a phase.
3. Plan the phase.
4. Execute the phase.
5. Verify the phase.
6. Generate and audit operations documentation.
7. Audit and archive the milestone.

## Core Artifacts

- `PROJECT.md`
- `REQUIREMENTS.md`
- `ROADMAP.md`
- `STATE.md`
- `phases/*`
- `operations/*`

## Design Principles

- Fresh context per specialized agent
- Thin orchestrators, not monolithic prompts
- Human-readable state instead of hidden memory
- Verification before and after execution
- Reusable framework, operations-specific content
