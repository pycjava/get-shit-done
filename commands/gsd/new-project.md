---
name: gsd:new-project
description: Initialize an operations-focused planning workspace
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
Initialize a project for operations work while keeping the standard GSD artifact chain.

Create:
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/config.json`
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/new-project.md
</execution_context>

<process>
Run the workflow end-to-end.
Favor operational context: environments, dependencies, deployment model, monitoring, capacity limits, backup, security, and incident ownership.
</process>
