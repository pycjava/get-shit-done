---
name: gsd:map-codebase
description: 在进入运维规划前，为现有服务或代码库生成结构化映射
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
---

<objective>
为一个已有系统生成 brownfield 代码库地图，帮助后续规划与文档沉淀。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/map-codebase.md
</execution_context>

<process>
端到端执行该 workflow。重点关注服务边界、依赖关系、运行时行为与运维风险点。
</process>
