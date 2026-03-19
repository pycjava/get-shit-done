---
name: gsd:new-project
description: 初始化一个新的规划工作区
argument-hint: "[--auto]"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
初始化一个新项目，并保留标准 GSD 产物链。

会创建：
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/config.json`
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/new-project.md
</execution_context>

<process>
端到端执行该 workflow。
优先收集与真实落地相关的上下文：环境、依赖、部署模型、监控、容量限制、备份、安全与事故责任归属。
</process>
