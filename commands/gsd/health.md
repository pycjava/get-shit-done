---
name: gsd:health
description: Diagnose planning directory health
argument-hint: "[--repair]"
allowed-tools:
  - Read
  - Bash
  - Write
---

<objective>
Validate `.planning/` structure and offer repair guidance when needed.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/health.md
</execution_context>

<process>
Execute the health workflow end-to-end.
</process>
