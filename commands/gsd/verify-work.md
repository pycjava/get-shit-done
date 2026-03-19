---
name: gsd:verify-work
description: 校验阶段结果、演练项与验收标准
argument-hint: "[阶段号]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
对一个已完成阶段做验收式验证，并在必要时为缺口收尾规划。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/verify-work.md
</execution_context>

<process>
重点检查部署结果、回滚准备度、告警覆盖、恢复演练、runbook 正确性与交接质量。
</process>
