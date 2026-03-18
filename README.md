# Get Shit Done

Operations-first context engineering and phased workflow automation for AI agents.

This repository keeps the original GSD backbone:

- Layered structure: `commands -> workflows -> agents -> templates -> .planning`
- Working style: file-based state, thin orchestrators, specialized agents, explicit validation
- Working flow: discover -> discuss -> plan -> execute -> verify -> audit -> archive

What changed is the product focus. This edition is for operations work: service readiness, deployment, monitoring, capacity planning, incident response, backup, security operations, and operational acceptance.

## Install

```bash
npx get-shit-done-cc@latest
```

### Build & Install from Source

```bash
# Build hooks
npm run build:hooks

# Pack into .tgz
npm pack

# Install globally from local tarball
npm install -g ./get-shit-done-cc-<version>.tgz
```

After install:

- Claude Code / Gemini / Copilot / Antigravity: `/gsd:help`
- OpenCode: `/gsd-help`
- Codex: `$gsd-help`

## Core Workflow

For a new or existing system:

1. `/gsd:map-codebase`
   Use this when you need a brownfield view of the current service, stack, and integration surface.
2. `/gsd:new-project`
   Capture the service boundary, environments, dependencies, capacity constraints, operational limits, and success criteria.
3. `/gsd:autonomous`
   Build one unified master plan across all remaining phases, display it up front, then execute phase-by-phase automatically. TDD plans are surfaced explicitly as `RED -> GREEN -> REFACTOR`.
4. Manual phase control when you want to steer a specific phase yourself:
   `/gsd:discuss-phase 1`
   Lock decisions for the current operations phase: rollout, alerting, capacity triggers, recovery, ownership, and change windows.
5. `/gsd:plan-phase 1`
   Produce executable phase plans and validation criteria.
6. `/gsd:execute-phase 1`
   Execute the phase through the normal GSD wave-based model.
7. `/gsd:verify-work 1`
   Validate the operational outcome through drills, checks, and acceptance prompts.
8. `/gsd:ops-runbook`
   Generate or refresh operations documentation.
9. `/gsd:ops-audit`
   Audit runbooks and operational coverage.

At milestone boundaries:

1. `/gsd:audit-milestone`
2. `/gsd:complete-milestone`
3. `/gsd:new-milestone`

## Primary Commands

| Command | Purpose |
|---|---|
| `/gsd:new-project` | Initialize an operations-focused planning workspace |
| `/gsd:map-codebase` | Map an existing codebase or service surface before planning |
| `/gsd:autonomous` | Show one cross-phase master plan, then execute it automatically |
| `/gsd:discuss-phase` | Capture phase-specific operational decisions |
| `/gsd:plan-phase` | Create verified phase plans |
| `/gsd:execute-phase` | Execute a phase in dependency waves |
| `/gsd:verify-work` | Run operational UAT, drills, and fix-loop planning |
| `/gsd:ops-runbook` | Create operations documents under `.planning/operations/` |
| `/gsd:ops-audit` | Review operational coverage and stale docs |
| `/gsd:audit-milestone` | Verify milestone-level operational readiness |
| `/gsd:complete-milestone` | Archive a completed milestone |
| `/gsd:new-milestone` | Start the next operational milestone |

## Operational Outputs

The framework still writes into `.planning/`, but the content is now centered on operations:

- `PROJECT.md`: service purpose, environments, constraints, owners
- `REQUIREMENTS.md`: operational requirements, coverage, readiness expectations
- `ROADMAP.md`: phased ops rollout plan
- `STATE.md`: current position, decisions, blockers
- `phases/*`: context, research, plans, summaries, validation, verification, UAT
- `operations/*`: deployment, monitoring, capacity, runbook, backup, security ops

## Repo Scope

Removed from this edition:

- UI design contract and UI review flows
- Developer behavior profiling
- Community marketing commands
- Test-generation-specific command surface

Retained because they support the framework:

- Phase and milestone management
- Brownfield mapping
- Debugging and validation
- Progress, pause/resume, update, and settings utilities

## Docs

- [docs/README.md](docs/README.md)
- [docs/COMMANDS.md](docs/COMMANDS.md)
- [docs/USER-GUIDE.md](docs/USER-GUIDE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
