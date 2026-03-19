# Get Shit Done

Operations-first context engineering and phased workflow automation for AI agents.

This edition keeps the original GSD backbone:

- `phase + wave` orchestration
- File-based state and thin orchestrators
- Specialized agents and explicit validation

What changed is the inner kernel. This repository is now centered on operations analysis and runbook generation, not generic development execution. The default analysis model is the Google SRE four golden signals:

- `Latency`
- `Traffic`
- `Errors`
- `Saturation`

Plans, summaries, monitoring templates, and roadmap execution views now surface signal focus instead of `RED -> GREEN -> REFACTOR`.

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

## Recommended Workflow

For a new or existing service:

1. `/gsd:map-codebase`
   Build a brownfield map of services, dependencies, interfaces, and operational surface area.
2. `/gsd:new-project`
   Capture service boundaries, environments, owners, deployment cadence, operational constraints, and readiness goals.
3. `/gsd:plan-phase 1`
   Break the phase into wave-based execution plans. Each plan can declare a primary `golden_signal`.
4. `/gsd:execute-phase 1`
   Execute the phase and generate summaries that highlight monitoring coverage, alert candidates, and runbook impact.
5. `/gsd:verify-work 1`
   Validate that the operational outcome is usable, observable, and ready for handoff.
6. `/gsd:ops-runbook`
   Generate or refresh operations documentation.
7. `/gsd:ops-audit`
   Audit stale or missing operational coverage.

## Operational Model

- Deployments are assumed to be manually triggered, not fully automated CI/CD promotions.
- A weekly release cadence is normal, even when the exact deployment time varies.
- Operations docs should be refreshed on deployment or release checkpoints, after major operational changes, and after incidents. They do not need to change on every code commit.
- Signal-focused plans should capture thresholds, alerting candidates, and business watchpoints that matter during release and incident response.

## Primary Commands

| Command | Purpose |
|---|---|
| `/gsd:map-codebase` | Map an existing codebase or service surface before planning |
| `/gsd:new-project` | Initialize an operations-focused planning workspace |
| `/gsd:plan-phase` | Create verified phase plans |
| `/gsd:execute-phase` | Execute a phase in dependency waves |
| `/gsd:verify-work` | Run operational UAT, drills, and fix-loop planning |
| `/gsd:ops-runbook` | Create operations documents under `.planning/operations/` |
| `/gsd:ops-audit` | Review operational coverage and stale docs |

## Operational Outputs

The framework still writes into `.planning/`, but the content is now centered on operations:

- `PROJECT.md`: service purpose, environments, constraints, owners
- `REQUIREMENTS.md`: operational requirements, coverage, readiness expectations
- `ROADMAP.md`: phased ops rollout plan
- `STATE.md`: current position, decisions, blockers
- `phases/*`: context, research, plans, summaries, validation, verification, UAT
- `operations/*`: deployment, monitoring, capacity, runbook, backup, security ops

## Repo Scope

Removed from this trimmed edition:

- UI design contract and UI review flows
- Developer behavior profiling
- Community marketing commands
- Test-generation-specific command surface
- Milestone and backlog management commands
- Legacy routing, milestone lifecycle, and non-ops support utilities

## Docs

- [docs/README.md](docs/README.md)
- [docs/COMMANDS.md](docs/COMMANDS.md)
- [docs/USER-GUIDE.md](docs/USER-GUIDE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
