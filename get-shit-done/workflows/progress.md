<purpose>
检查项目进度，汇总最近完成的工作，判断当前处于哪一步，并把下一条最合适的 `/gsd:*` 命令明确展示给用户。
</purpose>

<required_reading>
开始前，先读取 invoking prompt 的 execution_context 中引用的全部文件。
</required_reading>

<process>

<step name="init_context">
先加载进度上下文（只拿结构化信息，避免把整份项目文档都塞进上下文）：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init progress)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 提取：`project_exists`、`roadmap_exists`、`state_exists`、`phases`、`current_phase`、`next_phase`、`milestone_version`、`completed_count`、`phase_count`、`paused_at`、`state_path`、`roadmap_path`、`project_path`、`config_path`。

如果 `project_exists` 为 `false`（没有 `.planning/`）：

```
未找到规划目录。
运行 /gsd:new-project 开始新项目。
```

直接退出。

如果 `state_exists` 为 `false`：提示用户先运行 `/gsd:new-project`。

如果 `roadmap_exists` 为 `false` 但 `PROJECT.md` 存在：
- 说明当前里程碑大概率已经归档完成。
- 进入“路由 F：里程碑之间”。

如果 `ROADMAP.md` 和 `PROJECT.md` 都缺失：提示用户先运行 `/gsd:new-project`。
</step>

<step name="load">
只用 `gsd-tools` 提取报告需要的数据，不要整份手读：

- `ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)`
- `STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state-snapshot)`

这样可以把编排器的上下文占用压到最低。
</step>

<step name="analyze_roadmap">
使用结构化路线图分析结果：

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

返回的 JSON 至少包含：
- 所有阶段的磁盘状态：`complete` / `partial` / `planned` / `empty` / `no_directory`
- 每个阶段的目标与依赖
- 每个阶段的计划数与总结数
- 聚合统计：总计划数、总总结数、整体进度百分比
- 当前阶段与下一阶段识别结果

优先使用这个结果，不要再手工解析 `ROADMAP.md` 正文。
</step>

<step name="recent">
收集最近完成的工作：

- 找到最近 2-3 个 `SUMMARY.md`
- 用 `summary-extract` 抽取简要成果

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract <path> --fields one_liner
```

这部分用于回答“最近实际做了什么”。
</step>

<step name="position">
确定当前项目位置：

- 用 `$ROADMAP` 中的 `current_phase` 和 `next_phase`
- 结合 `$STATE` 中的 `paused_at`
- 统计未处理的 todos：使用 `init todos` 或 `list-todos`
- 统计活动调试会话：

```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved | wc -l
```
</step>

<step name="report">
先生成格式化进度条，再输出状态报告：

```bash
PROGRESS_BAR=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

展示格式：

```
# [项目名称]

**进度：** {PROGRESS_BAR}
**配置：** [quality / balanced / budget / inherit]

## 最近工作
- [阶段 X，计划 Y]：[从 summary-extract 提取的一句话成果]
- [阶段 X，计划 Z]：[从 summary-extract 提取的一句话成果]

## 当前位置
阶段 [N] / [总数]：[阶段名称]
计划 [M] / [阶段计划总数]：[状态]
上下文：[有 CONTEXT.md / 无]

## 关键决策
- [来自 $STATE.decisions[]]

## 阻塞 / 关注项
- [来自 $STATE.blockers[]]

## 待处理 Todos
- [数量] 个待处理，可运行 /gsd:check-todos

## 活动调试会话
- [数量] 个活动会话，可运行 /gsd:debug
（仅在数量 > 0 时显示）

## 下一步
[基于路线图分析推导出的下一条命令]
```
</step>

<step name="route">
根据结构化统计决定下一步。

**第 1 步：统计当前阶段的计划、总结和 UAT**

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null | wc -l
```

说明当前阶段“有多少计划、完成了多少总结”。

**第 1.5 步：检查尚未处理完的 UAT 缺口**

```bash
grep -l "status: diagnosed" .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null
```

如果存在状态为 `diagnosed` 的 `UAT.md`，说明已有缺口被诊断出来，但还没有进入修复规划。

**第 2 步：按条件路由**

| 条件 | 含义 | 路由 |
|------|------|------|
| `uat_with_gaps > 0` | UAT 缺口待修复 | 路由 E |
| `summaries < plans` | 当前阶段还有未执行计划 | 路由 A |
| `summaries = plans` 且 `plans > 0` | 当前阶段计划已执行完 | 进入第 3 步 |
| `plans = 0` | 当前阶段尚未规划 | 路由 B |

---

**路由 A：存在未执行计划**

找出第一个没有对应 `SUMMARY.md` 的 `PLAN.md`，读取它的 `<objective>`，然后展示：

```
## 下一步
**{phase}-{plan}：[计划名]** - [来自 PLAN.md 的目标摘要]

`/gsd:execute-phase {phase}`

先执行 `/clear`，再继续会更稳。
```

---

**路由 B：当前阶段需要先规划**

检查阶段目录下是否已有 `{phase_num}-CONTEXT.md`。

如果 `CONTEXT.md` 存在：

```
## 下一步
**阶段 {N}：[名称]** - [来自 ROADMAP.md 的阶段目标]
上下文已收集，可以直接规划。

`/gsd:plan-phase {phase}`

先执行 `/clear`，再继续会更稳。
```

如果 `CONTEXT.md` 不存在：

```
## 下一步
**阶段 {N}：[名称]** - [来自 ROADMAP.md 的阶段目标]

`/gsd:discuss-phase {phase}` - 先收集上下文并明确方法

先执行 `/clear`，再继续会更稳。

也可以用：
- `/gsd:plan-phase {phase}` - 跳过讨论直接规划
- `/gsd:list-phase-assumptions {phase}` - 查看 Claude 当前假设
```

---

**路由 E：UAT 缺口需要修复规划**

如果当前阶段存在 `status: diagnosed` 的 `UAT.md`：

```
## 发现 UAT 缺口

**{phase_num}-UAT.md** 中仍有待修复缺口。

`/gsd:plan-phase {phase} --gaps`

先执行 `/clear`，再继续会更稳。

也可以用：
- `/gsd:execute-phase {phase}` - 继续执行现有计划
- `/gsd:verify-work {phase}` - 继续补做验证
```

---

**第 3 步：仅当当前阶段完成时，检查整个里程碑状态**

通过 `ROADMAP` 结果识别：
- 当前阶段编号
- 当前里程碑内的所有阶段编号
- 最高阶段号

然后按下表路由：

| 条件 | 含义 | 路由 |
|------|------|------|
| `current phase < highest phase` | 还有后续阶段 | 路由 C |
| `current phase = highest phase` | 里程碑阶段全部完成 | 路由 D |

---

**路由 C：当前阶段完成，但还有下一阶段**

```
## 阶段 {Z} 已完成

## 下一步
**阶段 {Z+1}：[名称]** - [来自 ROADMAP.md 的目标]

`/gsd:discuss-phase {Z+1}` - 先为下一阶段收集上下文

先执行 `/clear`，再继续会更稳。

也可以用：
- `/gsd:plan-phase {Z+1}` - 跳过讨论直接规划
- `/gsd:verify-work {Z}` - 先继续做人手验证
```

---

**路由 D：里程碑完成**

```
## 里程碑已完成
所有 {N} 个阶段都已完成。

## 下一步
**完成里程碑** - 归档并准备下一个周期

`/gsd:complete-milestone`

先执行 `/clear`，再继续会更稳。

也可以用：
- `/gsd:verify-work` - 在归档前继续做用户验收
```

---

**路由 F：里程碑之间（`ROADMAP.md` 缺失，但 `PROJECT.md` 存在）**

这通常表示上一个里程碑已经归档完成，可以开始新的里程碑周期：

```
## 上一个里程碑已完成

## 下一步
**开始新的里程碑** - 提问 -> 研究 -> 需求 -> 路线图

`/gsd:new-milestone`

先执行 `/clear`，再继续会更稳。
```
</step>

<step name="edge_cases">
处理常见边缘情况：

- 当前阶段已完成，但下一阶段还没规划：明确给出 `/gsd:plan-phase [next]`
- 所有工作已完成：明确给出 `/gsd:complete-milestone`
- 仍有 blocker：在“阻塞 / 关注项”里前置展示
- 有 handoff 文件：额外提示 `/gsd:resume-work`
</step>

</process>

<success_criteria>
- [ ] 能展示最近工作、关键决策和阻塞项
- [ ] 能准确说明当前阶段和总体进度
- [ ] 能根据实际状态给出正确的下一条 `/gsd:*` 命令
- [ ] 存在计划时优先路由到 `/gsd:execute-phase`
- [ ] 缺少计划时优先路由到 `/gsd:plan-phase` 或 `/gsd:discuss-phase`
- [ ] 遇到 UAT 缺口时优先路由到 `--gaps`
- [ ] 里程碑完成后路由到 `/gsd:complete-milestone`
</success_criteria>
