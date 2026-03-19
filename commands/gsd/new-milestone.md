---
name: gsd:new-milestone
description: 开始下一轮里程碑
argument-hint: "[里程碑名称]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
创建下一轮里程碑，并同步更新运维侧需求与路线图覆盖范围。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/new-milestone.md
</execution_context>

<process>
端到端执行该 workflow，并把讨论范围控制在结果、就绪度与运维侧交付上。
</process>
