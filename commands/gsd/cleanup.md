---
name: gsd:cleanup
description: 归档已完成里程碑积累下来的阶段目录
---
<objective>
把已完成里程碑的阶段目录归档到 `.planning/milestones/v{X.Y}-phases/`。

当 `.planning/phases/` 中累积了过去多个里程碑的阶段目录时，就适合运行。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/cleanup.md
</execution_context>

<process>
按 `@~/.claude/get-shit-done/workflows/cleanup.md` 执行 cleanup workflow。
先识别已完成里程碑，展示 dry-run 摘要，再在用户确认后真正归档。
</process>
