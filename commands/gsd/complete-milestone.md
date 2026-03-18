---
name: gsd:complete-milestone
description: Archive a completed operations milestone
argument-hint: "[version]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
Close out the milestone, archive artifacts, and prepare the workspace for the next iteration.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/complete-milestone.md
</execution_context>

<process>
Run the workflow end-to-end and archive the milestone only when operational verification is complete.
</process>
