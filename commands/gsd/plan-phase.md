---
name: gsd:plan-phase
description: Analyze operations work in phases without creating phase tracking docs
argument-hint: "[analysis topic or doc names]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
Use phase as an analysis scaffold for operations work. Walk the analysis in ordered phases, keep the phase conclusions in the reply only, and do not create `CONTEXT.md`, `RESEARCH.md`, `PLAN.md`, `SUMMARY.md`, `ROADMAP.md`, `STATE.md`, or `.planning/phases/*` tracking artifacts.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-phase.md
</execution_context>

<process>
Execute the workflow as an analysis-only phase runner. Use the requested topic or document names to scope the analysis, then summarize the phase conclusions in the response. If the user wants formal operations deliverables, hand off to `/gsd:ops-runbook` so the only written output lands in `.planning/operations/`.
</process>
