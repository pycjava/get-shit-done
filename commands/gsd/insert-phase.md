---
name: gsd:insert-phase
description: 在现有阶段之间插入一个紧急小数阶段（例如 72.1）
argument-hint: <插入到哪个阶段之后> <阶段描述>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
当里程碑执行到一半发现必须立即处理的紧急工作时，在现有整数阶段之间插入一个小数阶段。

使用小数编号（如 `72.1`、`72.2`）可以在不整体重排路线图的情况下，保留原有逻辑顺序并插入紧急任务。

目的：处理中途出现的紧急工作，而不污染整个 roadmap 的编号结构。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/insert-phase.md
</execution_context>

<context>
参数：`$ARGUMENTS`，格式为 `<after-phase-number> <description>`

roadmap 与 state 会在 workflow 内通过 `init phase-op` 和定向工具调用解析。
</context>

<process>
端到端执行 `insert-phase` workflow。
保留所有校验闸门：参数解析、阶段存在性检查、小数编号计算和 roadmap 更新。
</process>
