---
name: gsd:complete-milestone
description: 归档一个已完成的里程碑
argument-hint: "[版本号]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
收尾当前里程碑、归档相关产物，并为下一轮迭代整理工作区。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/complete-milestone.md
</execution_context>

<process>
端到端执行该 workflow。只有在当前里程碑的验证与审计都完成后，才允许归档。
</process>
