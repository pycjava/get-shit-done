<required_reading>

**现在就读取这些文件：**

1. `.planning/STATE.md`
2. `.planning/PROJECT.md`
3. `.planning/ROADMAP.md`
4. 当前阶段的 `*-PLAN.md`
5. 当前阶段的 `*-SUMMARY.md`

</required_reading>

<purpose>

把当前阶段标记为完成，并推进到下一阶段。这是更新进度跟踪、沉淀阶段学习、演进 `PROJECT.md` 的自然节点。

“规划下一阶段”本质上意味着“当前阶段已经完成”。

</purpose>

<process>

<step name="load_project_state" priority="first">

在 transition 开始前，先读取项目状态：

```bash
cat .planning/STATE.md 2>/dev/null
cat .planning/PROJECT.md 2>/dev/null
```

解析当前阶段位置，确认本次 transition 针对的是正确阶段。
同时留意哪些上下文、决策或需求在阶段完成后需要更新。

</step>

<step name="verify_completion">

检查当前阶段的计划是否都已有对应总结：

```bash
ls .planning/phases/XX-current/*-PLAN.md 2>/dev/null | sort
ls .planning/phases/XX-current/*-SUMMARY.md 2>/dev/null | sort
```

**验证逻辑：**

- 统计 `PLAN` 文件数量
- 统计 `SUMMARY` 文件数量
- 数量相等：说明当前阶段的计划都执行完了
- 数量不等：说明当前阶段仍有未完成计划

<config-check>

```bash
cat .planning/config.json 2>/dev/null
```

</config-check>

**如果所有计划都已完成：**

<if mode="yolo">

```
自动批准：阶段 [X] -> 阶段 [X+1]
阶段 [X] 已完成，全部 [Y] 个计划均已执行。

继续标记完成并推进下一阶段。
```

直接进入 `cleanup_handoff`。

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

提问：
“阶段 [X] 已完成，全部 [Y] 个计划均已执行。现在把它标记完成并进入阶段 [X+1] 吗？”

等待用户确认后再继续。

</if>

**如果还有未完成计划：**

**安全护栏：这里始终算 destructive，必须确认。**

跳过未完成计划会导致阶段被强行推进，因此无论模式如何都必须询问用户。

展示：

```
阶段 [X] 仍有未完成计划：
- {phase}-01-SUMMARY.md ✓ 已完成
- {phase}-02-SUMMARY.md ✗ 缺失
- {phase}-03-SUMMARY.md ✗ 缺失

⚠️ 安全护栏：跳过计划属于破坏性动作，必须确认。

可选项：
1. 继续当前阶段（执行剩余计划）
2. 仍然标记完成（跳过剩余计划）
3. 查看剩余工作
```

等待用户选择。

</step>

<step name="cleanup_handoff">

检查是否存在遗留的 handoff 文件：

```bash
ls .planning/phases/XX-current/.continue-here*.md 2>/dev/null
```

如果存在，删除它们。阶段已经完成，这些 handoff 已经过期。

</step>

<step name="update_roadmap_and_state">

**把 `ROADMAP.md` 和 `STATE.md` 的推进更新交给 `gsd-tools`：**

```bash
TRANSITION=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase complete "${current_phase}")
```

CLI 会负责：
- 把阶段 checkbox 标记为 `[x]`，并写入今天的完成日期
- 更新计划完成数，例如 `3/3 plans complete`
- 更新 Progress 表（状态 -> `Complete`，并补日期）
- 把 `STATE.md` 推进到下一阶段（`Current Phase`、`Status -> Ready to plan`、`Current Plan -> Not started`）
- 判断这是不是当前里程碑的最后一个阶段

从结果中提取：`completed_phase`、`plans_executed`、`next_phase`、`next_phase_name`、`is_last_phase`。

</step>

<step name="archive_prompts">

如果当前阶段生成过 prompts，就保持原地不动。

`completed/` 子目录的归档逻辑由 create-meta-prompts 负责，这里不重复处理。

</step>

<step name="evolve_project">

根据刚完成的阶段，对 `PROJECT.md` 做项目级演进。

**先读阶段总结：**

```bash
cat .planning/phases/XX-current/*-SUMMARY.md
```

**重点审查这些问题：**

1. **有没有需求被真正验证？**
   - 如果某个 Active requirement 已在本阶段落地，移到 `Validated`
   - 格式：`- ✓ [Requirement] - Phase X`

2. **有没有需求被证明不再需要？**
   - 如果发现某项原始要求不成立或不值得做，移到 `Out of Scope`
   - 格式：`- [Requirement] - [不再需要的原因]`

3. **有没有新需求在实施中浮现？**
   - 新发现且后续必须处理的内容，加入 `Active`
   - 格式：`- [ ] [New requirement]`

4. **有没有关键决策需要补录？**
   - 从 `SUMMARY.md` 提取关键决策
   - 写入 `PROJECT.md` 的 Key Decisions 表

5. **“What This Is” 是否仍准确？**
   - 如果产品定义或定位在本阶段出现变化，需要同步修正

**更新 `PROJECT.md`：**

直接在文件内原地修改，并更新页脚：

```markdown
---
*Last updated: [date] after Phase [X]*
```

**示例：**

修改前：

```markdown
### Active

- [ ] JWT authentication
- [ ] Real-time sync < 500ms
- [ ] Offline mode

### Out of Scope

- OAuth2 - complexity not needed for v1
```

修改后（假设 Phase 2 完成了 JWT，且发现需要 rate limiting）：

```markdown
### Validated

- ✓ JWT authentication - Phase 2

### Active

- [ ] Real-time sync < 500ms
- [ ] Offline mode
- [ ] Rate limiting on sync endpoint

### Out of Scope

- OAuth2 - complexity not needed for v1
```

**本步骤完成标准：**

- [ ] 已阅读阶段总结并提取项目层 learnings
- [ ] 已把真正落地的需求从 `Active` 移到 `Validated`
- [ ] 已把无效需求移到 `Out of Scope` 并附原因
- [ ] 已把新浮现需求加入 `Active`
- [ ] 已补录新增关键决策
- [ ] 若产品定义变化，已同步更新 “What This Is”
- [ ] 页脚 `Last updated` 已反映本次 transition

</step>

<step name="update_current_position_after_transition">

**说明：** 基础位置推进（`Current Phase`、`Status`、`Current Plan`、`Last Activity`）已经由上一步的 `gsd-tools phase complete` 完成。

这里要做的是校验写回结果是否正确：

```bash
PROGRESS=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

如果 `STATE.md` 里的进度条仍是旧值，就用这个结果覆盖。

**本步骤完成标准：**

- [ ] 阶段号已推进到下一阶段（由 `phase complete` 完成）
- [ ] 当前计划状态已重置为 `Not started`
- [ ] `Status` 已变成 `Ready to plan`
- [ ] 进度条与总完成计划数一致

</step>

<step name="update_project_reference">

更新 `STATE.md` 中的 Project Reference 区块：

```markdown
## Project Reference

See: .planning/PROJECT.md (updated [today])

**Core value:** [Current core value from PROJECT.md]
**Current focus:** [Next phase name]
```

刷新日期和 `Current focus`，让它指向新阶段。

</step>

<step name="review_accumulated_context">

回顾并更新 `STATE.md` 中的 Accumulated Context：

**Decisions：**

- 记录本阶段新增的 3-5 条关键决策
- 完整决策日志仍以 `PROJECT.md` 为主

**Blockers/Concerns：**

- 回顾已完成阶段中的 blocker
- 已解决的，从列表中移除
- 仍有效的，保留并带上 `[Phase X]` 前缀
- 如果总结里出现新的风险，也一并加入

示例：

修改前：

```markdown
### Blockers/Concerns

- ⚠️ [Phase 1] Database schema not indexed for common queries
- ⚠️ [Phase 2] WebSocket reconnection behavior on flaky networks unknown
```

修改后（假设数据库索引问题已在 Phase 2 解决）：

```markdown
### Blockers/Concerns

- ⚠️ [Phase 2] WebSocket reconnection behavior on flaky networks unknown
```

**本步骤完成标准：**

- [ ] 近期决策已简要记录
- [ ] 已解决 blocker 已被移除
- [ ] 未解决 blocker 仍被保留并带阶段前缀
- [ ] 新风险已从当前阶段总结中补入

</step>

<step name="update_session_continuity_after_transition">

更新 `STATE.md` 的 Session Continuity：

```markdown
Last session: [today]
Stopped at: Phase [X] complete, ready to plan Phase [X+1]
Resume file: None
```

**本步骤完成标准：**

- [ ] `Last session` 更新时间已刷新
- [ ] `Stopped at` 清楚说明阶段已完成、下一阶段待规划
- [ ] `Resume file` 为 `None`

</step>

<step name="offer_next_phase">

**必须先确认里程碑状态，再决定展示什么下一步。**

**优先使用 `gsd-tools phase complete` 的返回结果：**

- `is_last_phase: false` -> 还有后续阶段 -> 走 **路线 A**
- `is_last_phase: true` -> 当前里程碑已完成 -> 走 **路线 B**

`next_phase` 和 `next_phase_name` 直接提供下一阶段信息。

如果还需要补充上下文，再调用：

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

---

**路线 A：里程碑内还有后续阶段**

读取 `ROADMAP.md` 取得下一阶段名称和目标。

再检查下一阶段是否已有 `CONTEXT.md`：

```bash
ls .planning/phases/*[X+1]*/*-CONTEXT.md 2>/dev/null
```

**如果下一阶段存在：**

<if mode="yolo">

**若 `CONTEXT.md` 已存在：**

```
阶段 [X] 已标记完成。

下一步：阶段 [X+1] - [Name]

自动继续：直接规划阶段 [X+1]
```

退出当前 skill，并调用 `SlashCommand("/gsd:plan-phase [X+1] --auto")`

**若 `CONTEXT.md` 不存在：**

```
阶段 [X] 已标记完成。

下一步：阶段 [X+1] - [Name]

自动继续：先讨论阶段 [X+1]
```

退出当前 skill，并调用 `SlashCommand("/gsd:discuss-phase [X+1] --auto")`

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

**若 `CONTEXT.md` 不存在：**

```
## Phase [X] Complete

## 下一步

**Phase [X+1]: [Name]** - [Goal from ROADMAP.md]

`/gsd:discuss-phase [X+1]` - 先收集上下文并明确方法

建议先执行 `/clear`，获得新的上下文窗口。

也可以使用：
- `/gsd:plan-phase [X+1]` - 跳过讨论直接规划
- `/gsd:research-phase [X+1]` - 先研究未知点
```

**若 `CONTEXT.md` 已存在：**

```
## Phase [X] Complete

## 下一步

**Phase [X+1]: [Name]** - [Goal from ROADMAP.md]
上下文已收集，可以直接规划。

`/gsd:plan-phase [X+1]`

建议先执行 `/clear`，获得新的上下文窗口。

也可以使用：
- `/gsd:discuss-phase [X+1]` - 重新讨论上下文
- `/gsd:research-phase [X+1]` - 先研究未知点
```

</if>

---

**路线 B：当前里程碑已完成**

跨里程碑时应当停止自动链路，因此先清掉 auto-chain 标记：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active false
```

<if mode="yolo">

```
阶段 {X} 已标记完成。

Milestone {version} 已 100% 完成，全部 {N} 个阶段均已结束。

自动继续：完成里程碑并归档。
```

退出当前 skill，并调用 `SlashCommand("/gsd:complete-milestone {version}")`

</if>

<if mode="interactive" OR="custom with gates.confirm_transition true">

```
## Phase {X}: {Phase Name} Complete

Milestone {version} 已 100% 完成，全部 {N} 个阶段均已完成。

## 下一步

**完成里程碑 {version}** - 归档并准备下一个周期

`/gsd:complete-milestone {version}`

建议先执行 `/clear`，获得新的上下文窗口。

也可以先回顾本里程碑成果，再决定是否归档。
```

</if>

</step>

</process>

<implicit_tracking>
进度跟踪是隐式的：当你开始规划阶段 N，就意味着阶段 1 到阶段 N-1 默认已经完成。无需单独维护“阶段推进”步骤，向前推进本身就是进度。
</implicit_tracking>

<partial_completion>

如果用户明确想继续往后走，但当前阶段并未完全完成：

```
阶段 [X] 仍有未执行计划：
- {phase}-02-PLAN.md
- {phase}-03-PLAN.md

可选项：
1. 仍然标记完成（这些计划不再需要）
2. 把剩余工作递延到后续阶段
3. 留在当前阶段，先做完
```

尊重用户判断。

**如果用户坚持在未完成时标记阶段完成：**

- 更新 `ROADMAP.md` 时把计划完成数写成真实值，例如 `2/3 plans complete`
- 在 transition 输出中注明哪些计划被跳过

</partial_completion>

<success_criteria>

Transition 完成时，应满足：

- [ ] 当前阶段计划总结已核对（要么齐全，要么用户明确选择跳过）
- [ ] 过期的 handoff 文件已清理
- [ ] `ROADMAP.md` 已更新阶段完成状态和计划数
- [ ] `PROJECT.md` 已随阶段结果演进
- [ ] `STATE.md` 已更新当前位置、项目引用、累计上下文和会话信息
- [ ] Progress 表已同步
- [ ] 用户能清楚看到下一步该做什么

</success_criteria>
