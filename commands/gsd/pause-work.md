---
name: gsd:pause-work
description: 在阶段中途暂停时创建上下文交接文件
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
创建 `.continue-here.md` 交接文件，把当前工作状态完整保留下来，方便跨会话续接。

它会路由到 `pause-work` workflow，负责：
- 从最近文件识别当前阶段
- 收集完整状态（位置、已完成、未完成、决策、blocker）
- 写入 handoff 文件
- 生成 WIP 提交
- 给出恢复说明
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/pause-work.md
</execution_context>

<context>
状态与阶段进度都在 workflow 内通过定向读取收集。
</context>

<process>
**按 `@~/.claude/get-shit-done/workflows/pause-work.md` 执行 `pause-work` workflow。**

workflow 会负责：
1. 识别阶段目录
2. 在必要时向用户补充询问，再收集状态
3. 带时间戳写入 handoff 文件
4. 执行 Git 提交
5. 向用户确认并给出恢复说明
</process>
