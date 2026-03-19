---
name: gsd:health
description: 诊断规划目录的健康状况
argument-hint: "[--repair]"
allowed-tools:
  - Read
  - Bash
  - Write
---

<objective>
校验 `.planning/` 的结构是否健康，并在需要时给出修复建议。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/health.md
</execution_context>

<process>
端到端执行 `health` workflow。
</process>
