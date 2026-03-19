# Command Reference

## Recommended Flow

| Command | Purpose | Produces |
|---|---|---|
| `/gsd:map-codebase` | Map an existing service, dependency graph, and operational surface before planning | `.planning/codebase/*.md` |
| `/gsd:new-project` | Initialize the planning workspace with service boundaries, environments, and release assumptions | `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md` |
| `/gsd:plan-phase [N]` | Create wave-based execution plans with optional `golden_signal` focus | `{phase}-RESEARCH.md`, `PLAN.md`, `VALIDATION.md` |
| `/gsd:execute-phase <N>` | Execute phase plans and generate signal-aware summaries | `SUMMARY.md`, `VERIFICATION.md` |
| `/gsd:verify-work [N]` | Validate readiness, drills, and remaining gaps | `{phase}-UAT.md` |
| `/gsd:ops-runbook` | Generate or refresh operational documentation | `.planning/operations/*.md` |
| `/gsd:ops-audit` | Audit operational documentation and stale coverage | Ops audit report |

## Default Analysis Model

- The framework keeps `phase + wave`.
- The default execution kernel is `Latency / Traffic / Errors / Saturation`.
- Plans can declare `golden_signal: latency|traffic|errors|saturation`.
- Summaries and roadmap execution views surface signal focus instead of TDD state.

## Support

| Command | Purpose |
|---|---|
| `/gsd:help` | Show the concise command reference |
