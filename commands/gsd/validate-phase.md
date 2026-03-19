---
name: gsd:validate-phase
description: 对已完成阶段补做 Nyquist 验证审计，并补齐缺口
argument-hint: "[阶段号]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---
<objective>
审计一个已完成阶段的 Nyquist 验证覆盖情况。支持三种状态：
- (A) 已有 `VALIDATION.md` -> 审计并补齐缺口
- (B) 没有 `VALIDATION.md`，但有 `SUMMARY.md` -> 从现有产物重建验证策略
- (C) 阶段尚未执行 -> 退出并给出指引

输出：更新后的 `VALIDATION.md` 与新增测试文件。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/validate-phase.md
</execution_context>

<context>
阶段：`$ARGUMENTS`，可选。默认回退到最近完成的阶段。
</context>

<process>
执行 `@~/.claude/get-shit-done/workflows/validate-phase.md`。
保留 workflow 中的所有闸门与状态分支。
</process>
