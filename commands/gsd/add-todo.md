---
name: gsd:add-todo
description: 从当前对话上下文里把想法或任务记录成待办
argument-hint: [可选描述]
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>
把在 GSD 会话中冒出来的想法、任务或问题记录为结构化待办，留待后续处理。

它会路由到 `add-todo` workflow，负责：
- 创建目录结构
- 从参数或当前对话中提取内容
- 基于文件路径推断 area
- 检测并处理重复项
- 生成带 frontmatter 的 todo 文件
- 更新 `STATE.md`
- 提交到 git
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/add-todo.md
</execution_context>

<context>
参数：`$ARGUMENTS`（可选，作为 todo 描述）

状态会在 workflow 内通过 `init todos` 和定向读取解析。
</context>

<process>
**按 `@~/.claude/get-shit-done/workflows/add-todo.md` 执行 `add-todo` workflow。**

workflow 会负责：
1. 确保目录存在
2. 检查现有 area
3. 提取内容（参数或当前对话）
4. 推断 area
5. 检查重复项
6. 生成 slug 并创建文件
7. 更新 `STATE.md`
8. 提交到 git
</process>
