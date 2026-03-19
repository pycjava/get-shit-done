<purpose>
创建 `.continue-here.md` 交接文件，把当前工作状态完整保留下来，便于跨会话无缝恢复。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="detect">
从最近修改的文件中找出当前阶段目录：

```bash
# 找出最近有工作的阶段目录
ls -lt .planning/phases/*/PLAN.md 2>/dev/null | head -1 | grep -oP 'phases/\K[^/]+'
```

如果没检测到活跃阶段，则询问用户当前是在哪个阶段暂停工作。
</step>

<step name="gather">
**收集完整交接状态：**

1. **当前位置**：当前是哪个阶段、哪个计划、哪个任务
2. **本次已完成工作**：这次会话做了什么
3. **剩余工作**：当前计划 / 当前阶段还差什么
4. **已做决策**：关键决策与理由
5. **阻塞 / 问题**：当前卡点
6. **脑内上下文**：思路、下一步、处理方式
7. **已修改文件**：有哪些变更但还未提交

如果信息不够，通过自然对话补问。
</step>

<step name="write">
**写入 `.planning/phases/XX-name/.continue-here.md`：**

```markdown
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: [timestamp from current-timestamp]
---

<current_state>
[当前精确处于哪里，立即可接手的上下文]
</current_state>

<completed_work>

- Task 1: [name] - Done
- Task 2: [name] - Done
- Task 3: [name] - In progress, [what's done]
</completed_work>

<remaining_work>

- Task 3: [what's left]
- Task 4: Not started
- Task 5: Not started
</remaining_work>

<decisions_made>

- Decided to use [X] because [reason]
- Chose [approach] over [alternative] because [reason]
</decisions_made>

<blockers>
- [Blocker 1]: [status/workaround]
</blockers>

<context>
[当前脑内状态、思路、计划]
</context>

<next_action>
Start with: [resuming 时的第一步]
</next_action>
```

内容要足够具体，让一个全新的 Claude 也能立刻接上。

`last_updated` 可用 `current-timestamp`：
```bash
timestamp=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" current-timestamp full --raw)
```
</step>

<step name="commit">
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "wip: [phase-name] paused at task [X]/[Y]" --files .planning/phases/*/.continue-here.md
```
</step>

<step name="confirm">
```
已创建交接文件：.planning/phases/[XX-name]/.continue-here.md

当前状态：

- 阶段：[XX-name]
- 任务：[X] / [Y]
- 状态：[in_progress/blocked]
- 已按 WIP 提交

恢复方式：/gsd:resume-work
```
</step>

</process>

<success_criteria>
- [ ] 已在正确的阶段目录下创建 `.continue-here.md`
- [ ] 所有区块都已填入具体内容
- [ ] 已按 WIP 提交
- [ ] 用户知道文件位置以及如何恢复
</success_criteria>
