---
name: gsd:check-todos
description: 列出待办事项，并选择一个继续推进
argument-hint: [area 过滤条件]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
列出所有待处理 todo，允许用户挑选其中一项，加载其完整上下文，并路由到后续动作。

它会路由到 `check-todos` workflow，负责：
- 统计并列出 todo，可按 area 过滤
- 交互式选择某个 todo，并加载完整上下文
- 检查与 roadmap 的关联关系
- 根据情况路由（立即处理、加入阶段、头脑风暴、创建新阶段）
- 更新 `STATE.md` 并提交
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/check-todos.md
</execution_context>

<context>
参数：`$ARGUMENTS`（可选，用于 area 过滤）

todo 状态与 roadmap 关联会在 workflow 内通过 `init todos` 和定向读取加载。
</context>

<process>
**按 `@~/.claude/get-shit-done/workflows/check-todos.md` 执行 `check-todos` workflow。**

workflow 会负责：
1. 检查是否存在 todo
2. 按 area 过滤
3. 交互式列出并选择
4. 加载完整上下文与文件摘要
5. 检查与 roadmap 的关联
6. 给出并执行动作选项
7. 更新 `STATE.md`
8. Git 提交
</process>
