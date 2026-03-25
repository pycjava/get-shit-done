<purpose>
Show the current operations-focused GSD command reference.
</purpose>

<reference>
# GSD Commands

## Recommended Flow
1. `/gsd:bootstrap [all|deployment|monitoring|capacity|runbook|backup|security|operations] [--skip-audit]`
   - Ops-only bootstrap.
   - Internally runs: `gsd-ops-researcher` (requirements analysis) -> `plan-phase` (display plan) -> `ops-runbook` (write docs) -> optional `ops-audit`.
2. `/gsd:ops-runbook [all|deployment|monitoring|capacity|runbook|backup|security|operations]`
   - Generate or update operations docs in `.planning/operations/`.
3. `/gsd:ops-audit [all|deployment|monitoring|capacity|runbook|backup|security|operations]`
   - Audit operations coverage and gaps.
4. `/gsd:plan-phase [topic or doc selection]`
   - Display a planner-mode ops plan only (no local planning docs).
5. `/gsd:help`
   - Show this reference.

## Bootstrap Arguments
`/gsd:bootstrap [all|deployment|monitoring|capacity|runbook|backup|security|operations] [--skip-audit]`
- `all|deployment|monitoring|capacity|runbook|backup|security|operations`: target ops docs scope (default `all`)
- `--skip-audit`: skip `ops-audit`

## Golden Signals
- `Latency`
- `Traffic`
- `Errors`
- `Saturation`
</reference>
