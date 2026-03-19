---
name: gsd:add-phase
description: 在当前里程碑的路线图末尾追加一个阶段
argument-hint: <阶段描述>
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
在当前里程碑末尾新增一个整数阶段。

它会路由到 `add-phase` workflow，负责：
- 计算下一个顺序整数阶段号
- 创建阶段目录并生成 slug
- 更新 roadmap 结构
- 把这次变化记录到 `STATE.md`
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/add-phase.md
</execution_context>

<context>
参数：`$ARGUMENTS`（阶段描述）

roadmap 与 state 会在 workflow 内通过 `init phase-op` 和定向工具调用解析。
</context>

<process>
**按 `@~/.claude/get-shit-done/workflows/add-phase.md` 执行 `add-phase` workflow。**

workflow 会负责：
1. 解析并校验参数
2. 检查 roadmap 是否存在
3. 识别当前里程碑
4. 计算下一个阶段号（忽略小数阶段）
5. 由描述生成 slug
6. 创建阶段目录
7. 在 roadmap 中插入条目
8. 更新 `STATE.md`
</process>
