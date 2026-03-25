---
name: gsd:plan-phase
description: Generate an in-memory operations plan via planner agents (no local docs)
argument-hint: "[analysis topic or doc names]"
allowed-tools:
  - Read
  - Bash
  - Task
  - AskUserQuestion
---

<objective>
Run planner-mode orchestration for operations work and return the plan directly in the reply. Do not create local planning artifacts such as `CONTEXT.md`, `RESEARCH.md`, `PLAN.md`, `SUMMARY.md`, `ROADMAP.md`, `STATE.md`, or `.planning/phases/*`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-phase.md
</execution_context>

<process>
Execute the workflow by calling planner-related agents and show the final plan directly. Keep all outputs in-memory; if the user wants formal operations deliverables, hand off to `/gsd:ops-runbook` so the only written output lands in `.planning/operations/`.
</process>
