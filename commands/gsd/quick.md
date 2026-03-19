---
name: gsd:quick
description: 用 GSD 保障执行一个快速任务（原子提交、状态追踪），并跳过可选代理
argument-hint: "[--full] [--discuss] [--research]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
执行一个小型、临时性的 quick task，同时保留 GSD 的核心保障：原子提交、`STATE.md` 追踪与任务产物目录化。

`quick` 模式是同一套系统的短路径版本：
- 拉起 `gsd-planner`（quick mode）和 `gsd-executor`
- quick task 独立存放在 `.planning/quick/`，不混入阶段主线
- 更新 `STATE.md` 中的 `Quick Tasks Completed` 表（不会改 `ROADMAP.md`）

**默认行为：** 跳过 research、discussion、plan-checker 和 verifier。适合你已经很清楚要做什么的场景。

**`--discuss`：** 规划前做轻量讨论，提前暴露灰区、锁定关键决策并写入 `CONTEXT.md`。

**`--full`：** 启用计划检查（最多 2 轮）和执行后验证，在不走完整里程碑流程的前提下加强质量保障。

**`--research`：** 在规划前先拉起聚焦 researcher，研究实现路径、可选库与常见坑点。

这些 flag 可以叠加使用，例如：`--discuss --research --full`
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/quick.md
</execution_context>

<context>
$ARGUMENTS

上下文文件会在 workflow 内通过 `init quick` 解析，并通过 `<files_to_read>` 传递给下游代理。
</context>

<process>
从 `@~/.claude/get-shit-done/workflows/quick.md` 端到端执行 quick workflow。
保留所有 workflow 闸门：校验、任务描述收集、规划、执行、状态更新与提交。
</process>
