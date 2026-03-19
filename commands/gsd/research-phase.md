---
name: gsd:research-phase
description: 研究某个阶段应如何实现（独立模式，通常优先用 /gsd:plan-phase）
argument-hint: "[阶段号]"
allowed-tools:
  - Read
  - Bash
  - Task
---

<objective>
研究某个阶段应如何实现。该命令会携带阶段上下文拉起 `gsd-phase-researcher`。

**说明：** 这是独立研究命令。大多数情况下，优先使用会自动整合研究流程的 `/gsd:plan-phase`。

**适用场景：**
- 你想先研究，不急着进入规划
- 规划已经做完，但你想重新研究当前方案
- 你想在决定是否推进某阶段之前先验证可行性

**Orchestrator 职责：** 解析阶段参数、校验阶段是否存在、检查已有研究、收集上下文、拉起 researcher，并把结果反馈给用户。

**为什么用 subagent：** 研究会大量消耗上下文（检索、交叉验证、对比资料）。把这部分放进一个全新的大上下文 agent，更稳也更干净。
</objective>

<context>
阶段号：`$ARGUMENTS`（必填）

在任何目录查找前，都要先在步骤 1 中把阶段号标准化。
</context>

<process>

## 0. 初始化上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 提取：`phase_dir`、`phase_number`、`phase_name`、`phase_found`、`commit_docs`、`has_research`、`state_path`、`requirements_path`、`context_path`、`research_path`。

解析 researcher 模型：

```bash
RESEARCHER_MODEL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-phase-researcher --raw)
```

## 1. 校验阶段

```bash
PHASE_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${phase_number}")
```

如果 `found=false`：报错并退出。
如果 `found=true`：提取 `phase_number`、`phase_name`、`goal`。

## 2. 检查已有研究

```bash
ls .planning/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

如果已存在研究文件：给用户选项
1. 更新研究
2. 查看现有研究
3. 跳过

如果不存在：继续。

## 3. 收集阶段上下文

使用 init 返回的路径，不要把正文内联进 orchestrator：
- `requirements_path`
- `context_path`
- `state_path`

向用户简述当前阶段以及 researcher 会读取哪些文件。

## 4. 拉起 `gsd-phase-researcher`

研究模式支持：`ecosystem`（默认）、`feasibility`、`implementation`、`comparison`

```markdown
<research_type>
阶段研究：聚焦“如何把某个具体阶段做好”。
</research_type>

<key_insight>
真正的问题不是“该用哪个库？”

真正的问题是：“还有哪些我没意识到自己不知道的东西？”

针对这个阶段，请重点发现：
- 当前主流架构模式是什么？
- 标准技术栈通常怎么搭？
- 常见踩坑点是什么？
- 当前业界最佳实践与 Claude 训练记忆里的旧方案有何差异？
- 哪些部分不应该手搓？
</key_insight>

<objective>
研究阶段 {phase_number}: {phase_name} 的实现路径
模式：ecosystem
</objective>

<files_to_read>
- {requirements_path}（需求）
- {context_path}（若存在，来自 discuss-phase 的阶段上下文）
- {state_path}（项目当前决策与 blocker）
</files_to_read>

<additional_context>
**阶段描述：** {phase_description}
</additional_context>

<downstream_consumer>
你的 RESEARCH.md 会被 `/gsd:plan-phase` 读取，它会依赖这些区块：
- `## Standard Stack`
- `## Architecture Patterns`
- `## Don't Hand-Roll`
- `## Common Pitfalls`
- `## Code Examples`

请给出明确建议，而不是开放式发散。尽量写“用 X”，而不是“可以考虑 X 或 Y”。
</downstream_consumer>

<quality_gate>
宣布完成前，请自检：
- [ ] 所有必要研究域都已覆盖
- [ ] 否定性结论已用官方资料验证
- [ ] 关键结论至少交叉验证了多个来源
- [ ] 置信度标注真实可信
- [ ] section 名称与 plan-phase 预期一致
</quality_gate>

<output>
写入：.planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</output>
```

```
Task(
  prompt=filled_prompt,
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}",
  description="研究阶段 {phase}"
)
```

## 5. 处理 agent 返回

**`## RESEARCH COMPLETE`：** 展示研究摘要，并给出“规划阶段 / 深挖 / 查看全文 / 结束”等下一步。

**`## CHECKPOINT REACHED`：** 展示检查点，等待用户回复，再拉起 continuation。

**`## RESEARCH INCONCLUSIVE`：** 展示已尝试内容，并给出“补充上下文 / 换模式再试 / 手动处理”的选项。

## 6. 拉起 continuation agent

```markdown
<objective>
继续研究阶段 {phase_number}: {phase_name}
</objective>

<prior_state>
<files_to_read>
- .planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md（已有研究）
</files_to_read>
</prior_state>

<checkpoint_response>
**Type:** {checkpoint_type}
**Response:** {user_response}
</checkpoint_response>
```

```
Task(
  prompt=continuation_prompt,
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}",
  description="继续研究阶段 {phase}"
)
```

</process>

<success_criteria>
- [ ] 阶段已根据 roadmap 校验通过
- [ ] 已检查是否存在旧研究
- [ ] 已用正确上下文拉起 gsd-phase-researcher
- [ ] 检查点处理正确
- [ ] 用户知道下一步可以做什么
</success_criteria>
