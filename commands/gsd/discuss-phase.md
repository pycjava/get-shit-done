---
name: gsd:discuss-phase
description: 在规划前为某个阶段收集关键决策与上下文
argument-hint: "<阶段号> [--auto]"
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
为某个阶段创建 `CONTEXT.md`，减少后续规划中的猜测空间。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/discuss-phase.md
</execution_context>

<process>
讨论重点应放在：发布方式、告警、容量触发条件、备份、恢复、责任归属、依赖关系与变更安全性。
</process>
