<trigger>
在以下场景使用本 workflow：
- 在已有项目上开始一个新会话
- 用户说“继续”“下一步是什么”“之前做到哪了”“resume”
- 任何规划类操作且 `.planning/` 已存在
- 用户离开项目一段时间后回来
</trigger>

<purpose>
立即恢复完整项目上下文，让“我们做到哪了？”能被快速、完整地回答。
</purpose>

<required_reading>
@~/.claude/get-shit-done/references/continuation-format.md
</required_reading>

<process>

<step name="initialize">
一次性加载全部上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init resume)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析：`state_exists`、`roadmap_exists`、`project_exists`、`planning_exists`、`has_interrupted_agent`、`interrupted_agent_id`、`commit_docs`。

如果 `state_exists` 为 true：进入 `load_state`
如果 `state_exists` 为 false 但 `roadmap_exists` 或 `project_exists` 为 true：提示可重建 `STATE.md`
如果 `planning_exists` 为 false：这是新项目，路由到 `/gsd:new-project`
</step>

<step name="load_state">
读取并解析 `STATE.md`，然后读取 `PROJECT.md`：

```bash
cat .planning/STATE.md
cat .planning/PROJECT.md
```

从 `STATE.md` 中提取：
- Project Reference
- Current Position
- Progress
- 最近决策
- Pending Todos
- Blockers / Concerns
- Session Continuity

从 `PROJECT.md` 中提取：
- What This Is
- Requirements
- Key Decisions
- Constraints
</step>

<step name="check_incomplete_work">
检查是否存在未完成工作：

```bash
ls .planning/phases/*/.continue-here*.md 2>/dev/null

for plan in .planning/phases/*/*-PLAN.md; do
  summary="${plan/PLAN/SUMMARY}"
  [ ! -f "$summary" ] && echo "Incomplete: $plan"
done 2>/dev/null

if [ "$has_interrupted_agent" = "true" ]; then
  echo "Interrupted agent: $interrupted_agent_id"
fi
```

重点关注：
- 是否存在 `.continue-here` 文件
- 是否存在没有对应 `SUMMARY` 的 `PLAN`
- 是否存在中途中断的 agent

如果命中任一项，明确标记并在后续状态展示中提示。
</step>

<step name="present_status">
向用户展示完整项目状态，包括：
- 项目当前在做什么
- 当前阶段、当前计划、总体进度
- 最近一次活动
- 未完成工作
- 中断的 agent
- pending todos
- 延续下来的 blockers / concerns

展示目标不是追求炫目的样式，而是让用户在几秒内理解项目当前处于什么位置。
</step>

<step name="determine_next_action">
根据当前项目状态，决定最合理的下一步：

- 如果存在 interrupted agent：优先恢复 agent
- 如果存在 `.continue-here`：优先从 checkpoint 恢复
- 如果存在没有 SUMMARY 的 PLAN：优先补完该计划
- 如果当前阶段计划都完成了：优先 transition 到下一阶段
- 如果阶段待规划：优先检查该阶段是否已有 `CONTEXT.md`
- 如果阶段待执行：优先执行下一个 plan
</step>

<step name="offer_options">
根据当前状态给用户一组上下文化选项：
- 恢复中断 agent
- 继续当前阶段执行
- 讨论某阶段上下文
- 规划某阶段
- 查看 todos
- 查看 alignment
- 其他

如果涉及阶段规划，先检查该阶段是否已有 `CONTEXT.md`：

```bash
ls .planning/phases/XX-name/*-CONTEXT.md 2>/dev/null
```

没有 `CONTEXT.md` 时优先建议 `/gsd:discuss-phase`。
</step>

<step name="route_to_workflow">
根据用户选择，路由到对应 workflow：
- 执行阶段
- 规划阶段
- 讨论阶段上下文
- transition
- 查看 todos
- 检查 alignment
- 其他定制需求

对于“执行 / 规划”这类动作，展示清晰的下一步命令，并提醒用户可先 `/clear`。
</step>

<step name="update_session">
在真正跳转前，更新 session continuity：

```markdown
## Session Continuity

Last session: [now]
Stopped at: Session resumed, proceeding to [action]
Resume file: [updated if applicable]
```

这样如果当前会话再意外中断，下次还能继续接上。
</step>

</process>

<reconstruction>
如果 `STATE.md` 丢失，但其他产物还在：

1. 读 `PROJECT.md` -> 提取 What This Is / Core Value
2. 读 `ROADMAP.md` -> 确定阶段结构和当前位置
3. 扫描所有 `*-SUMMARY.md` -> 提取决策和问题
4. 统计 pending todos
5. 检查 `.continue-here` 文件

据此重建 `STATE.md`，然后继续正常 resume 流程。
</reconstruction>

<quick_resume>
如果用户只说“continue”或“go”：
- 静默加载状态
- 自动判断 primary action
- 直接继续，不额外展示选项

输出形式：
`继续从 [state] 开始... 正在执行 [action]`
</quick_resume>

<success_criteria>
- [ ] 已读取或重建 `STATE.md`
- [ ] 已识别并标记未完成工作
- [ ] 已向用户展示清晰状态
- [ ] 已给出上下文化下一步
- [ ] 用户清楚知道项目目前所处位置
- [ ] 已更新 session continuity
</success_criteria>
