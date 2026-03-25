---
name: gsd:bootstrap
description: ops-only bootstrap with requirements analysis -> plan -> runbook
argument-hint: "[all|deployment|monitoring|capacity|runbook|backup|security|operations] [--skip-audit]"
allowed-tools:
  - Read
  - Bash
  - Task
  - Skill
---

<objective>
Run an ops-only bootstrap route with explicit sequence:
1) analyze operations requirements (`gsd-ops-researcher`)
2) display plan (`plan-phase`)
3) write operations docs (`ops-runbook`)
Then optionally run `ops-audit`.
</objective>

<execution_context>
@D:/Study/SKILL/get-shit-done/get-shit-done/workflows/bootstrap.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
Execute the workflow end-to-end.
</process>
