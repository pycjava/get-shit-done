---
name: gsd:note
description: 零摩擦记录想法，可追加、列出或提升为待办
argument-hint: "<文本> | list | promote <N> [--global]"
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
---
<objective>
尽量零摩擦地记录想法：一次 `Write`，一行确认即可。

支持三个子命令：
- **append**（默认）：保存一条带时间戳的 note，不提问，不格式化
- **list**：列出项目级与全局范围内的所有 notes
- **promote**：把某条 note 转成结构化 todo

这个命令内联执行：
- 不起 `Task`
- 不用 `AskUserQuestion`
- 不跑 `Bash`
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/note.md
@~/.claude/get-shit-done/references/ops-output.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
从 `@~/.claude/get-shit-done/workflows/note.md` 端到端执行 note workflow。
根据参数决定是记录 note、列出 notes，还是提升为 todo。
</process>
