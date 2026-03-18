<purpose>
检查项目进度，总结近期工作并展望下一步，然后智能路由到下一个操作 — 执行现有计划或创建新计划。在继续工作前提供态势感知。
</purpose>

<required_reading>
在开始之前，阅读执行上下文所引用文件的所有内容。
</required_reading>

<process>

<step name="init_context">
**加载进度上下文（仅路径）：**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init progress)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从初始化 JSON 中提取：`project_exists`、`roadmap_exists`、`state_exists`、`phases`、`current_phase`、`next_phase`、`milestone_version`、`completed_count`、`phase_count`、`paused_at`、`state_path`、`roadmap_path`、`project_path`、`config_path`。

如果 `project_exists` 为 false（没有 `.planning/` 目录）：

```
未找到规划结构。

运行 /gsd:new-project 开始新项目。
```

退出。

如果缺少 STATE.md：建议 `/gsd:new-project`。

**如果 ROADMAP.md 缺失但 PROJECT.md 存在：**

这意味着里程碑已完成并归档。转到**路由 F**（里程碑之间）。

如果 ROADMAP.md 和 PROJECT.md 都缺失：建议 `/gsd:new-project`。
</step>

<step name="load">
**使用 gsd-tools 的结构化提取：**

不要读取完整文件，只使用目标工具获取报告所需的数据：
- `ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)`
- `STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state-snapshot)`

这可以最小化编排器的上下文使用。
</step>

<step name="analyze_roadmap">
**获取综合路线图分析（替换手动解析）：**

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

返回结构化 JSON，包含：
- 所有阶段的磁盘状态（complete/partial/planned/empty/no_directory）
- 每个阶段的目标和依赖
- 每个阶段的计划数和总结数
- 聚合统计：总计划数、总结数、进度百分比
- 当前阶段和下一阶段识别

使用此方法代替手动读取/解析 ROADMAP.md。
</step>

<step name="recent">
**收集近期工作上下文：**

- 找到 2-3 个最新的 SUMMARY.md 文件
- 使用 `summary-extract` 高效解析：
  ```bash
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract <path> --fields one_liner
  ```
- 这显示"我们一直在做什么"
  </step>

<step name="position">
**从初始化上下文和路线图分析中解析当前位置：**

- 使用 `$ROADMAP` 中的 `current_phase` 和 `next_phase`
- 注意 `$STATE` 中的 `paused_at`（如果工作已暂停）
- 统计待处理 todos：使用 `init todos` 或 `list-todos`
- 检查活动调试会话：`ls .planning/debug/*.md 2>/dev/null | grep -v resolved | wc -l`
  </step>

<step name="report">
**从 gsd-tools 生成进度条，然后展示丰富的状态报告：**

```bash
# 获取格式化的进度条
PROGRESS_BAR=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" progress bar --raw)
```

展示：

```
# [项目名称]

**进度：** {PROGRESS_BAR}
**配置：** [quality/balanced/budget/inherit]

## 近期工作
- [阶段 X, 计划 Y]：[从 summary-extract 提取的成就 - 1 行]
- [阶段 X, 计划 Z]：[从 summary-extract 提取的成就 - 1 行]

## 当前位置
阶段 [N] / [总数]：[阶段名称]
计划 [M] / [阶段总数]：[状态]
上下文：[✓ 有上下文 | - 无]

## 关键决策
- [从 $STATE.decisions[] 提取]
- [例如：jq -r '.decisions[].decision' from state-snapshot]

## 障碍/关注
- [从 $STATE.blockers[] 提取]
- [例如：jq -r '.blockers[].text' from state-snapshot]

## 待处理 Todos
- [数量] 个待处理 — /gsd:check-todos 查看

## 活动调试会话
- [数量] 个活动 — /gsd:debug 继续
（仅在数量 > 0 时显示此部分）

## 下一步
[来自路线图分析的下一阶段/计划目标]
```

</step>

<step name="route">
**根据验证后的统计确定下一步操作。**

**步骤 1：统计当前阶段的计划、总结和问题**

列出当前阶段目录中的文件：

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null | wc -l
```

状态："此阶段有 {X} 个计划，{Y} 个总结。"

**步骤 1.5：检查未处理的 UAT 缺口**

检查状态为 "diagnosed" 的 UAT.md 文件（存在需要修复的缺口）。

```bash
# 检查有缺口的已诊断 UAT
grep -l "status: diagnosed" .planning/phases/[current-phase-dir]/*-UAT.md 2>/dev/null
```

跟踪：
- `uat_with_gaps`：状态为 "diagnosed" 的 UAT.md 文件（需要修复缺口）

**步骤 2：根据统计路由**

| 条件 | 含义 | 操作 |
|-----------|---------|--------|
| uat_with_gaps > 0 | UAT 缺口需要修复计划 | 转到**路由 E** |
| summaries < plans | 存在未执行计划 | 转到**路由 A** |
| summaries = plans AND plans > 0 | 阶段完成 | 转到步骤 3 |
| plans = 0 | 阶段尚未规划 | 转到**路由 B** |

---

**路由 A：存在未执行计划**

找到第一个没有对应 SUMMARY.md 的 PLAN.md。
读取其 `<objective>` 部分。

```
---

## ▶ 下一步

**{phase}-{plan}：[计划名称]** — [来自 PLAN.md 的目标摘要]

`/gsd:execute-phase {phase}`

<sub>先 `/clear` → 清空上下文窗口</sub>

---
```

---

**路由 B：阶段需要规划**

检查阶段目录中是否存在 `{phase_num}-CONTEXT.md`。

**如果 CONTEXT.md 存在：**

```
---

## ▶ 下一步

**阶段 {N}：{名称}** — [来自 ROADMAP.md 的目标]
<sub>✓ 上下文已收集，准备规划</sub>

`/gsd:plan-phase {phase-number}`

<sub>先 `/clear` → 清空上下文窗口</sub>

---
```

**如果 CONTEXT.md 不存在：**

```
---

## ▶ 下一步

**阶段 {N}：{名称}** — [来自 ROADMAP.md 的目标]

`/gsd:discuss-phase {phase}` — 收集上下文并明确方法

<sub>先 `/clear` → 清空上下文窗口</sub>

---

**同样可用：**
- `/gsd:plan-phase {phase}` — 跳过讨论，直接规划
- `/gsd:list-phase-assumptions {phase}` — 查看 Claude 的假设

---
```

---

**路由 E：UAT 缺口需要修复计划**

UAT.md 存在缺口（已诊断问题）。用户需要规划修复。

```
---

## ⚠ 发现 UAT 缺口

**{phase_num}-UAT.md** 有 {N} 个缺口需要修复。

`/gsd:plan-phase {phase} --gaps`

<sub>先 `/clear` → 清空上下文窗口</sub>

---

**同样可用：**
- `/gsd:execute-phase {phase}` — 执行阶段计划
- `/gsd:verify-work {phase}` — 运行更多 UAT 测试

---
```

---

**步骤 3：检查里程碑状态（仅在阶段完成时）**

读取 ROADMAP.md 并识别：
1. 当前阶段编号
2. 当前里程碑部分中的所有阶段编号

统计总阶段数并识别最高阶段编号。

状态："当前阶段是 {X}。里程碑有 {N} 个阶段（最高：{Y}）。"

**根据里程碑状态路由：**

| 条件 | 含义 | 操作 |
|-----------|---------|--------|
| current phase < highest phase | 还有更多阶段 | 转到**路由 C** |
| current phase = highest phase | 里程碑完成 | 转到**路由 D** |

---

**路由 C：阶段完成，还有更多阶段**

读取 ROADMAP.md 获取下一阶段的名称和目标。

```
---

## ✓ 阶段 {Z} 完成

## ▶ 下一步

**阶段 {Z+1}：{名称}** — [来自 ROADMAP.md 的目标]

`/gsd:discuss-phase {Z+1}` — 收集上下文并明确方法

<sub>先 `/clear` → 清空上下文窗口</sub>

---

**同样可用：**
- `/gsd:plan-phase {Z+1}` — 跳过讨论，直接规划
- `/gsd:verify-work {Z}` — 继续前进行用户验收测试

---
```

---

**路由 D：里程碑完成**

```
---

## 🎉 里程碑完成

所有 {N} 个阶段已完成！

## ▶ 下一步

**完成里程碑** — 归档并准备下一个

`/gsd:complete-milestone`

<sub>先 `/clear` → 清空上下文窗口</sub>

---

**同样可用：**
- `/gsd:verify-work` — 完成里程碑前行用户验收测试

---
```

---

**路由 F：里程碑之间（ROADMAP.md 缺失，PROJECT.md 存在）**

里程碑已完成并归档。准备开始下一个里程碑周期。

读取 MILESTONES.md 找到最后完成的里程碑版本。

```
---

## ✓ 里程碑 v{X.Y} 完成

准备规划下一个里程碑。

## ▶ 下一步

**开始下一个里程碑** — 提问 → 研究 → 需求 → 路线图

`/gsd:new-milestone`

<sub>先 `/clear` → 清空上下文窗口</sub>

---
```

</step>

<step name="edge_cases">
**处理边缘情况：**

- 阶段完成但下一阶段未规划 → 提供 `/gsd:plan-phase [next]`
- 所有工作完成 → 提供里程碑完成
- 存在障碍 → 在继续前突出显示
- 存在交接文件 → 提及并提供 `/gsd:resume-work`
  </step>

</process>

<success_criteria>

- [ ] 提供丰富上下文（近期工作、决策、问题）
- [ ] 当前位置清晰，进度可视化
- [ ] 下一步解释清楚
- [ ] 智能路由：有计划时 /gsd:execute-phase，无计划时 /gsd:plan-phase
- [ ] 任何操作前用户确认
- [ ] 无缝交接至适当的 gsd 命令
      </success_criteria>
