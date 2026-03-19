---
name: gsd:bootstrap
description: 初始化项目 → 代码库映射 → 审计 → 规划 → 执行 → 验证，全链路一键启动
argument-hint: "[--phase N] [--skip-audit] [--skip-map]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Skill
  - AskUserQuestion
---

<objective>
检测当前项目状态，缺什么初始化什么，然后按顺序执行完整链路：new-project → map-codebase → ops-audit → plan-phase → execute-phase → verify-work。

"有就跳过，没有就初始化"——重复运行是安全的。
</objective>

<execution_context>
@D:/Study/SKILL/get-shit-done/get-shit-done/workflows/bootstrap.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
端到端执行该 workflow。
</process>
