---
name: gsd:stats
description: 显示项目统计信息：阶段、计划、需求、git 指标与时间线
allowed-tools:
  - Read
  - Bash
---
<objective>
展示完整项目统计，包括阶段进度、计划执行指标、需求完成度、git 历史指标和项目时间线。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/stats.md
</execution_context>

<process>
从 `@~/.claude/get-shit-done/workflows/stats.md` 端到端执行 `stats` workflow。
</process>
