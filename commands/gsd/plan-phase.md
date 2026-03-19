---
name: gsd:plan-phase
description: 研究、规划并校验一个阶段
argument-hint: "<阶段号>"
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
为目标阶段产出可执行计划，并显式保留验证要求。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/plan-phase.md
</execution_context>

<process>
端到端执行该 workflow。计划应当能够支撑真实落地工作，例如部署加固、监控上线、runbook 完善、备份验证或安全控制等。
</process>
