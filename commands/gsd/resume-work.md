---
name: gsd:resume-work
description: 从上一轮会话恢复工作，并完整还原上下文
allowed-tools:
  - Read
  - Bash
  - Write
  - AskUserQuestion
  - SlashCommand
---

<objective>
完整恢复项目上下文，并尽量无缝地从上一轮会话继续。

它会路由到 `resume-project` workflow，负责：
- 读取 `STATE.md`（若缺失则尝试重建）
- 识别 checkpoint（`.continue-here` 文件）
- 检测未完成工作（有 `PLAN` 但无 `SUMMARY`）
- 展示当前状态
- 按上下文给出下一步最合适的动作
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/resume-project.md
</execution_context>

<process>
**按 `@~/.claude/get-shit-done/workflows/resume-project.md` 执行 `resume-project` workflow。**

workflow 会负责：
1. 校验项目是否存在
2. 读取或重建 `STATE.md`
3. 检测 checkpoint 与未完成工作
4. 展示当前状态
5. 基于上下文给出选项（在建议 plan / discuss 前会先检查 `CONTEXT.md`）
6. 路由到正确的下一条命令
7. 更新 session continuity
</process>
