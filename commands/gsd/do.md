---
name: gsd:do
description: 自动把自然语言请求路由到最合适的 GSD 命令
argument-hint: "<描述你想做什么>"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---
<objective>
分析用户的自然语言输入，并把它分发到最合适的 GSD 命令。

它是一个智能分发器，本身不直接完成工作。它会先匹配最适合的 `/gsd:*` 命令，再向用户确认，然后把请求交出去。

适合这种情况：你知道自己想干什么，但不确定该用哪条 `/gsd:*` 命令。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/do.md
@~/.claude/get-shit-done/references/ops-output.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
从 `@~/.claude/get-shit-done/workflows/do.md` 端到端执行 `do` workflow。
把用户意图路由到最匹配的 GSD 命令并实际触发。
</process>
