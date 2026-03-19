---
name: gsd:autonomous
description: 先展示统一总计划，再自主执行所有剩余阶段
argument-hint: "[--from N]"
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
先构建并展示一个覆盖所有剩余里程碑阶段的统一总计划，再按这个总计划自主执行。每个阶段内部仍然遵循 discuss -> plan -> execute，但用户先看到的是一条总主线。TDD 计划必须显式展示为 `RED -> GREEN -> REFACTOR`。

执行基于 `ROADMAP.md` 的阶段发现，并通过 `Skill()` 平铺调用各阶段命令。所有阶段结束后，继续执行：milestone audit -> complete -> cleanup。

**会创建 / 更新：**
- `.planning/STATE.md`：每个阶段后都会更新
- `.planning/ROADMAP.md`：每个阶段后都会更新进度
- 阶段产物：每阶段的 `CONTEXT.md`、`PLAN`、`SUMMARY`

**结束后：** 当前里程碑会被完整收尾并清理。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/autonomous.md
@~/.claude/get-shit-done/references/ops-output.md
</execution_context>

<context>
可选参数：`--from N`，表示从阶段 N 开始，而不是从第一个未完成阶段开始。

项目上下文、阶段列表和状态都在 workflow 内通过 init 命令与 `gsd-tools.cjs roadmap execution-plan` 解析，无需在命令层预加载。
</context>

<process>
从 `@~/.claude/get-shit-done/workflows/autonomous.md` 端到端执行 autonomous workflow。
保留所有 workflow 闸门：总计划展示、逐阶段执行、blocker 处理与进度展示。
</process>
