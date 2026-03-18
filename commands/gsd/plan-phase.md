---
name: gsd:plan-phase
description: Research, plan, and verify an operations phase
argument-hint: "<phase>"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
Produce executable plans for the target phase and keep validation requirements explicit.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-phase.md
</execution_context>

<process>
Run the workflow end-to-end. Plans should be suitable for operational work packages such as deployment hardening, monitoring rollout, runbook completion, backup validation, or security controls.
</process>
