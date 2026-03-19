---
name: gsd:plan-milestone-gaps
description: 为里程碑审计识别出的所有缺口创建收尾阶段
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---
<objective>
为 `/gsd:audit-milestone` 识别出的全部缺口，一次性创建补洞阶段。

它会读取 `MILESTONE-AUDIT.md`，把缺口按逻辑分组为若干阶段，写入 `ROADMAP.md`，并可继续为这些阶段做规划。

这条命令的目标是：一次创建完所有修复阶段，而不是让用户手动反复 `/gsd:add-phase`。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-milestone-gaps.md
</execution_context>

<context>
**审计结果来源：**
Glob: `.planning/v*-MILESTONE-AUDIT.md`（取最近一份）

原始意图与当前规划状态，都在 workflow 内按需加载。
</context>

<process>
从 `@~/.claude/get-shit-done/workflows/plan-milestone-gaps.md` 端到端执行。
保留所有 workflow 闸门：加载审计、优先级处理、阶段分组、用户确认与 roadmap 更新。
</process>
