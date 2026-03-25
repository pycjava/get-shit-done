---
name: gsd:ops-runbook
description: Generate operations runbooks after phased analysis
argument-hint: "[deployment|monitoring|capacity|runbook|backup|security|operations|all]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Task
  - Grep
---

<objective>
Generate formal operations documentation in `.planning/operations/`. The analysis runs in ordered phases and explicitly invokes the `gsd-ops-researcher` agent for operations-method research. Phase tracking remains in-memory only. The only repo outputs are the final operations documents such as `OPERATIONS.md`, `DEPLOYMENT.md`, `MONITORING.md`, `CAPACITY.md`, `RUNBOOK.md`, `BACKUP.md`, and `SECURITY-OPS.md`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/ops-runbook.md
</execution_context>

<context>
`$ARGUMENTS` is optional and can narrow the requested operations docs. Existing `.planning/operations/` files should be treated as update targets, not as proof of phase state.
</context>

<process>
Run the analysis phases first, keep the phase conclusions in the response only, and then write the selected formal documents to `.planning/operations/`. Do not create phase tracking files or require `.planning/STATE.md` or `.planning/ROADMAP.md` just to generate runbooks.
</process>
