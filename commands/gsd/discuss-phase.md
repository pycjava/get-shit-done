---
name: gsd:discuss-phase
description: Capture operational decisions for a phase before planning
argument-hint: "<phase> [--auto]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
---

<objective>
Create a phase context that removes guesswork for operational planning.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/discuss-phase.md
</execution_context>

<process>
Focus discussion on rollout, alerting, backup, recovery, ownership, dependencies, and change safety.
</process>
