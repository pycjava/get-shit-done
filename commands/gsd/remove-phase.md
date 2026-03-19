---
name: gsd:remove-phase
description: 从路线图中移除一个未来阶段，并重编号后续阶段
argument-hint: <阶段号>
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
---
<objective>
从路线图中移除一个尚未开始的未来阶段，并把后续阶段重新编号，保持整体编号干净线性。

目的：干净地删掉已经决定不做的工作，而不是在上下文里长期留下 cancelled / deferred 污染。
输出：目标阶段被删除、后续阶段已重编号，并生成一条 git 提交作为历史记录。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/remove-phase.md
</execution_context>

<context>
阶段：`$ARGUMENTS`

roadmap 与 state 会在 workflow 内通过 `init phase-op` 和定向读取解析。
</context>

<process>
从 `@~/.claude/get-shit-done/workflows/remove-phase.md` 端到端执行。
保留所有校验闸门（未来阶段校验、已有工作校验）、重编号逻辑与提交流程。
</process>
