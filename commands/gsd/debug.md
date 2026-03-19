---
name: gsd:debug
description: 用持久化状态做系统化调试，即使上下文重置也能继续
argument-hint: [问题描述]
allowed-tools:
  - Read
  - Bash
  - Task
  - AskUserQuestion
---

<objective>
用“科学调试法 + subagent 隔离”来定位并推进问题修复。

**Orchestrator 职责：** 收集症状、拉起 `gsd-debugger`、处理中断检查点、以及在需要时拉起 continuation agent。

**为什么用 subagent：** 调试会快速消耗上下文，包括读文件、建立假设、做实验与回看证据。把调试交给独立 agent，主上下文会更干净。
</objective>

<context>
用户描述的问题：`$ARGUMENTS`

先检查活动调试会话：

```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved | head -5
```
</context>

<process>

## 0. 初始化上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

提取 `commit_docs`，并解析 debugger 模型：

```bash
debugger_model=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-debugger --raw)
```

## 1. 检查活动会话

如果存在活动会话且没有 `$ARGUMENTS`：
- 列出会话、状态、当前假设、下一动作
- 让用户选择继续某个编号，或描述一个新问题

如果提供了 `$ARGUMENTS`，或用户选择新问题：
- 进入症状收集

## 2. 收集症状（仅新问题）

用 `AskUserQuestion` 依次询问：

1. **预期行为**：本来应该发生什么？
2. **实际行为**：现在实际发生了什么？
3. **错误信息**：有无报错？可粘贴或概述
4. **时间线**：问题何时出现？以前是否正常？
5. **复现方式**：如何稳定触发？

收集完后，确认是否开始调查。

## 3. 拉起 `gsd-debugger`

```markdown
<objective>
调查问题：{slug}

**摘要：** {trigger}
</objective>

<symptoms>
expected: {expected}
actual: {actual}
errors: {errors}
reproduction: {reproduction}
timeline: {timeline}
</symptoms>

<mode>
symptoms_prefilled: true
goal: find_and_fix
</mode>

<debug_file>
Create: .planning/debug/{slug}.md
</debug_file>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-debugger",
  model="{debugger_model}",
  description="调试 {slug}"
)
```

## 4. 处理 agent 返回

**如果是 `## ROOT CAUSE FOUND`：**
- 向用户展示根因与关键证据摘要
- 提供选项：
  - `立即修复`
  - `规划修复`
  - `手动修复`

**如果是 `## CHECKPOINT REACHED`：**
- 展示检查点详情
- 获取用户回复
- 若类型是 `human-verify`：
  - 用户确认已修好 -> 继续，让 agent 完成归档
  - 用户反馈仍有问题 -> 继续，让 agent 返回调查 / 修复
- 然后进入步骤 5，拉起 continuation agent

**如果是 `## INVESTIGATION INCONCLUSIVE`：**
- 展示已检查和已排除的内容
- 提供选项：
  - `继续调查`
  - `手动调查`
  - `补充更多上下文`

## 5. 拉起 continuation agent

```markdown
<objective>
继续调试 {slug}。相关证据已写入 debug 文件。
</objective>

<prior_state>
<files_to_read>
- .planning/debug/{slug}.md（调试会话状态）
</files_to_read>
</prior_state>

<checkpoint_response>
**Type:** {checkpoint_type}
**Response:** {user_response}
</checkpoint_response>

<mode>
goal: find_and_fix
</mode>
```

```
Task(
  prompt=continuation_prompt,
  subagent_type="gsd-debugger",
  model="{debugger_model}",
  description="继续调试 {slug}"
)
```

</process>

<success_criteria>
- [ ] 已检查活动调试会话
- [ ] 新问题已收集症状
- [ ] 已用正确上下文拉起 gsd-debugger
- [ ] 检查点处理正确
- [ ] 在修复前已确认根因
</success_criteria>
