<purpose>
按“波次 + 并行代理”方式执行一个阶段中的全部计划。编排器保持轻量，只负责发现计划、划分波次、调度执行、处理检查点，并在最后做阶段级验证。
</purpose>

<core_principle>
编排器负责协调，不直接实现业务代码。每个子 agent 自行读取完整的 `execute-plan` 上下文并独立执行。编排器只做这些事：发现计划 -> 分析依赖 -> 按波次分组 -> 启动 agent -> 处理 checkpoint -> 汇总结果。
</core_principle>

<required_reading>
开始任何操作前先读取 `STATE.md`，加载项目上下文。
</required_reading>

<process>

<step name="initialize" priority="first">
一次性加载执行阶段所需的全部上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 JSON 中提取：`executor_model`、`verifier_model`、`commit_docs`、`parallelization`、`branching_strategy`、`branch_name`、`phase_found`、`phase_dir`、`phase_number`、`phase_name`、`phase_slug`、`plans`、`incomplete_plans`、`plan_count`、`incomplete_count`、`state_exists`、`roadmap_exists`、`phase_req_ids`。

错误处理：
- `phase_found` 为 `false`：报错“未找到该阶段目录”
- `plan_count` 为 `0`：报错“当前阶段没有可执行计划”
- `state_exists` 为 `false` 但 `.planning/` 存在：提示用户选择重建或继续

当 `parallelization=false` 时，同一波次内也按顺序执行。

**必须同步自动链路标记：**
如果这次是用户手动调用（没有 `--auto`），先清掉上次中断自动链留下的 `_auto_chain_active`，避免误触发自动推进。注意：这不会修改用户的持久偏好 `workflow.auto_advance`。

```bash
if [[ ! "$ARGUMENTS" =~ --auto ]]; then
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set workflow._auto_chain_active false 2>/dev/null
fi
```
</step>

<step name="handle_branching">
根据 `branching_strategy` 处理分支：

- `none`：继续在当前分支执行
- `phase` 或 `milestone`：使用 init 已算好的 `branch_name`

```bash
git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
```

之后的所有提交都落在这个分支上，合并由用户自己处理。
</step>

<step name="validate_phase">
从 init JSON 读取 `phase_dir`、`plan_count`、`incomplete_count`。

向用户报告：
`在 {phase_dir} 中发现 {plan_count} 个计划，其中 {incomplete_count} 个尚未完成。`

阶段开始时立刻更新 `STATE.md`：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state begin-phase --phase "${PHASE_NUMBER}" --name "${PHASE_NAME}" --plans "${PLAN_COUNT}"
```

这一步会同步更新 `Status`、`Last Activity`、`Current focus`、`Current Position` 与计划计数，让 `STATE.md` 立即反映“当前阶段已经在执行中”。
</step>

<step name="discover_and_group_plans">
一次性读取计划索引和波次分组：

```bash
PLAN_INDEX=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase-plan-index "${PHASE_NUMBER}")
```

解析 JSON：
- `plans[]`：`id`、`wave`、`autonomous`、`objective`、`files_modified`、`task_count`、`has_summary`
- `waves`
- `incomplete`
- `has_checkpoints`

过滤逻辑：
- 跳过 `has_summary: true` 的计划
- 如果传了 `--gaps-only`，再跳过非 `gap_closure` 计划
- 如果过滤后为空：输出“没有匹配的未完成计划”，然后退出

向用户展示执行图：

```markdown
## 执行计划

**阶段 {X}: {Name}** - 共 {total_plans} 个计划，分布在 {wave_count} 个 wave 中

| 波次 | 计划 | 构建内容 |
|------|------|----------|
| 1 | 01-01, 01-02 | {根据 objective 提炼的 3-8 个字摘要} |
| 2 | 01-03 | ... |
```
</step>

<step name="execute_waves">
按波次顺序执行。波次内是否并行由 `PARALLELIZATION` 决定。

**每个波次都执行以下流程：**

1. **在启动 agent 之前，先说明这一波次在做什么**

读取每个 plan 的 `<objective>`，提炼“要构建什么、技术路线是什么、为什么现在做”。

示例格式：

```
---
## 第 {N} 波
**{Plan ID}: {Plan Name}**
{2-3 句说明：本波要产出什么、采用什么方式、它为何重要}

正在启动 {count} 个 agent...
---
```

2. **启动 executor agents**

只传路径，不把大文件内容直接塞进 prompt，让子 agent 自己读取：

```
Task(
  subagent_type="gsd-executor",
  model="{executor_model}",
  prompt="
    <objective>
    执行阶段 {phase_number}-{phase_name} 的计划 {plan_number}。
    每个任务完成后都要原子提交，生成 SUMMARY.md，并更新 STATE.md 与 ROADMAP.md。
    </objective>

    <execution_context>
    @~/.claude/get-shit-done/workflows/execute-plan.md
    @~/.claude/get-shit-done/templates/summary.md
    @~/.claude/get-shit-done/references/checkpoints.md
    @~/.claude/get-shit-done/references/golden-signals.md
    </execution_context>

    <files_to_read>
    Read these files at execution start using the Read tool:
    - {phase_dir}/{plan_file} (Plan)
    - .planning/STATE.md (State)
    - .planning/config.json (Config, if exists)
    - ./CLAUDE.md (Project instructions, if exists — follow project-specific guidelines and coding conventions)
    - .claude/skills/ or .agents/skills/ (Project skills, if either exists — list skills, read SKILL.md for each, follow relevant rules during implementation)
    </files_to_read>

    <success_criteria>
    - [ ] All tasks executed
    - [ ] Every task followed DEFINE → ANALYZE → VERIFY + SELF-CHECK (golden-signals.md)
    - [ ] Each task committed individually
    - [ ] SUMMARY.md created in plan directory
    - [ ] STATE.md updated with position and decisions
    - [ ] ROADMAP.md updated with plan progress (via `roadmap update-plan-progress`)
    - [ ] SUMMARY.md ends with `## Self-Check: PASSED` (not FAILED)
    </success_criteria>
  "
)
```

3. **等待当前波次的所有 agents 完成**

4. **先做抽查，再汇报成功**

对每个 `SUMMARY.md` 做抽查：
- `key-files.created` 中前 2 个文件必须真实存在
- `git log --oneline --all --grep="{phase}-{plan}"` 至少要有 1 个提交
- `SUMMARY.md` 中不能包含 `## Self-Check: FAILED`

如果任意一项抽查失败：
- 报告具体哪个 plan 出问题
- 进入失败处理：询问“重试这个计划？”或“继续剩余 wave？”

如果抽查都通过，则展示：

```
---
## 第 {N} 波完成
**{Plan ID}: {Plan Name}**
{来自 SUMMARY.md 的一句话成果}
{如果有偏差修正，也在这里概括}

{如果还有下一波，说明这波产物为下一波解锁了什么}
---
```

5. **处理 agent 失败**

**已知 Claude Code 误报：**
如果 agent 显示 `failed`，但错误包含 `classifyHandoffIfNeeded is not defined`，这通常是 Claude Code 运行时 bug，不代表计划真的失败。此时按第 4 步做相同 spot-check：
- 如果 `SUMMARY.md` 存在、git 提交存在、且没有 `## Self-Check: FAILED`，则按成功处理
- 如果 spot-check 也没过，再按真实失败处理

真实失败时：
- 明确指出哪个计划失败
- 询问用户“继续？”还是“停止？”
- 如果继续，提示依赖这个计划的后续 wave 也可能连锁失败

5b. **从第二个 wave 起，先做跨计划依赖检查**

在启动下一波前，对即将执行的每个计划运行：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" verify key-links {phase_dir}/{plan}-PLAN.md
```

如果前一波产物对应的 key-link 验证失败，展示：

```markdown
## 跨计划链接缺口

| 计划 | 链接 | 来源 | 预期模式 | 状态 |
|------|------|------|----------|------|
| {plan} | {via} | {from} | {pattern} | 未找到 |

第 {N} 波产物可能尚未正确接线。
可选项：
1. 先排查并修复，再继续
2. 直接继续执行（可能导致第 {N+1} 波出现连锁失败）
```

引用当前 wave 内文件的 key-link 可以跳过，重点检查“上一波应该已经产出的东西”。

6. **在波次之间执行 checkpoint plans**

详见 `<checkpoint_handling>`。

7. **进入下一波次**
</step>

<step name="checkpoint_handling">
`autonomous: false` 的计划需要用户交互。

**自动模式下的 checkpoint 处理：**

先读取自动推进配置：

```bash
AUTO_CHAIN=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow._auto_chain_active 2>/dev/null || echo "false")
AUTO_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.auto_advance 2>/dev/null || echo "false")
```

当 executor 返回 checkpoint，并且 `AUTO_CHAIN=true` 或 `AUTO_CFG=true` 时：
- `human-verify` -> 自动以 `{user_response}="approved"` 启动 continuation agent，并记录“已自动通过检查点”
- `decision` -> 自动选择 checkpoint 提供的第一个选项，并记录选择结果
- `human-action` -> 仍然必须展示给用户，认证闸门不能自动化

**标准流程（非自动模式，或 checkpoint 类型为 `human-action`）：**

1. 为 checkpoint 计划启动 agent
2. agent 执行到 checkpoint 任务或 auth gate 后返回结构化状态
3. 返回内容必须包含：
   - 已完成任务表
   - 当前被阻塞的任务
   - checkpoint 类型与详情
   - 正在等待用户完成什么
4. 向用户展示：

   ```
   ## 检查点：[类型]

   **计划：** 03-03 Dashboard Layout
   **进度：** 2/3 个任务完成
   [checkpoint 详情]
   [awaiting 内容]
   ```

5. 用户回复：`approved` / `done` / 问题描述 / 具体决策
6. **不要 resume 原 agent**，而是基于 continuation-prompt.md 启动一个新的 continuation agent：
   - `{completed_tasks_table}`
   - `{resume_task_number}` / `{resume_task_name}`
   - `{user_response}`
   - `{resume_instructions}`
7. continuation agent 先校验之前的提交，再从中断点继续
8. 重复直到该计划完成，或用户决定停止

**为什么必须使用新 agent，而不是 resume：**
并行工具调用下，resume 的内部序列化经常不稳定。把状态显式传给一个新 agent 更可靠。

如果 checkpoint 计划与其他并行计划同属一波：
- 其他 agent 可以先跑完
- 这个 plan 会暂停并等待用户
- 只有所有必须完成的项都结束后，才能进入下一波
</step>

<step name="aggregate_results">
所有波次完成后，输出阶段级汇总：

```markdown
## 阶段 {X}: {Name} 执行完成

**波次数：** {N} | **计划：** {M}/{total} 完成

| 波次 | 计划 | 状态 |
|------|------|------|
| 1 | plan-01, plan-02 | ✓ 完成 |
| CP | plan-03 | ✓ 已验证 |
| 2 | plan-04 | ✓ 完成 |

### 计划详情
1. **03-01**: [来自 SUMMARY.md 的一句话成果]
2. **03-02**: [来自 SUMMARY.md 的一句话成果]

### 遇到的问题
[聚合各 SUMMARY 中的 Issues Encountered，若没有则写“无”]
```
</step>

<step name="close_parent_artifacts">
**只针对小数阶段 / polish 阶段（如 `4.1`、`03.2.1`）执行：** 回写父阶段的 UAT 与 debug 产物。

**跳过条件：**
如果 `phase_number` 不是小数形式（例如 `3`、`04`），直接跳过。

**1. 推导父阶段编号**

```bash
if [[ "$PHASE_NUMBER" == *.* ]]; then
  PARENT_PHASE="${PHASE_NUMBER%%.*}"
fi
```

**2. 找父阶段 UAT 文件**

```bash
PARENT_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" find-phase "${PARENT_PHASE}" --raw)
```

从 `PARENT_INFO` 解析父阶段目录，再去目录里查找 `*-UAT.md`。

如果找不到父阶段 UAT：跳过这一整步。说明这次 gap closure 可能来自 `VERIFICATION.md`，而不是 UAT。

**3. 回写 UAT 缺口状态**

读取父阶段 UAT 文件中的 `## Gaps（缺口）` 区块。对每个 `status: failed` 的 gap：
- 更新为 `status: resolved`

**4. 必要时更新 UAT frontmatter**

如果所有 gap 都已经变成 `status: resolved`：
- 把 frontmatter 的 `status: diagnosed` 改为 `status: resolved`
- 更新 `updated:` 时间戳

**5. 处理关联 debug session**

对每个带 `debug_session:` 的 gap：
- 读取对应 debug 文件
- 更新 frontmatter `status:` 为 `resolved`
- 更新时间戳
- 移入 `resolved` 目录：

```bash
mkdir -p .planning/debug/resolved
mv .planning/debug/{slug}.md .planning/debug/resolved/
```

**6. 提交回写后的产物**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(phase-${PARENT_PHASE}): resolve UAT gaps and debug sessions after ${PHASE_NUMBER} gap closure" --files .planning/phases/*${PARENT_PHASE}*/*-UAT.md .planning/debug/resolved/*.md
```
</step>

<step name="verify_phase_goal">
执行阶段级目标验证，判断“阶段目标是否真的达成”，而不只是计划是否跑完。

```
Task(
  prompt="验证阶段 {phase_number} 是否达到目标。
阶段目录：{phase_dir}
阶段目标：{goal from ROADMAP.md}
阶段需求 ID：{phase_req_ids}
请检查 must_haves 是否已在真实代码库中兑现。
同时交叉比对 PLAN frontmatter 中的 requirement IDs 与 REQUIREMENTS.md，每个 ID 都必须有去向。
在阶段目录里生成 VERIFICATION.md。",
  subagent_type="gsd-verifier",
  model="{verifier_model}"
)
```

读取验证状态：

```bash
grep "^status:" "$PHASE_DIR"/*-VERIFICATION.md | cut -d: -f2 | tr -d ' '
```

状态分支：

| 状态 | 处理方式 |
|--------|----------|
| `passed` | 进入 `update_roadmap` |
| `human_needed` | 展示待人工验证项，等待用户确认或反馈 |
| `gaps_found` | 展示缺口总结，并推荐 `/gsd:plan-phase {phase} --gaps` |

**如果是 `human_needed`：**

```
## 阶段 {X}: {Name} - 需要人工验证

自动化检查已通过，但还有 {N} 项需要人工测试：

{来自 VERIFICATION.md 的 human_verification 区块}

输入 "approved" 继续，或直接描述问题进入缺口修复。
```

**如果是 `gaps_found`：**

```
## 阶段 {X}: {Name} - 发现缺口

**得分：** {N}/{M} 个 must-haves 已验证
**报告：** {phase_dir}/{phase_num}-VERIFICATION.md

### 缺失内容
{来自 VERIFICATION.md 的 gaps 摘要}

## 下一步
`/gsd:plan-phase {X} --gaps`

建议先执行 `/clear`，再继续。
也可以查看完整报告：`cat {phase_dir}/{phase_num}-VERIFICATION.md`
也可以先继续人工验证：`/gsd:verify-work {X}`
```

gap closure 约定：
- `/gsd:plan-phase {X} --gaps` 读取 `VERIFICATION.md`
- 生成 `gap_closure: true` 的补洞计划
- 用户再运行 `/gsd:execute-phase {X} --gaps-only`
- 最后重新跑 verifier
</step>

<step name="update_roadmap">
阶段验证通过后，统一更新所有跟踪文件：

```bash
COMPLETION=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase complete "${PHASE_NUMBER}")
```

CLI 会负责：
- 勾选阶段 checkbox 并写入完成日期
- 更新 Progress 表
- 写入最终计划完成数
- 把 `STATE.md` 推进到下一阶段
- 更新 `REQUIREMENTS.md` 中的追踪关系

从返回结果提取：`next_phase`、`next_phase_name`、`is_last_phase`。

随后提交这些元数据文件：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(phase-{X}): complete phase execution" --files .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md {phase_dir}/*-VERIFICATION.md
```
</step>

<step name="offer_next">

**例外：** 如果验证结果是 `gaps_found`，本 workflow 已在 `verify_phase_goal` 中给出补洞路径，此时不要继续自动推进。

在验证通过并完成 roadmap/state 更新后，直接停止并返回阶段完成摘要：

```
## 阶段完成

阶段：{PHASE_NUMBER} - {PHASE_NAME}
计划：{completed_count}/{total_count}
验证：{已通过 | 发现缺口}

[附上 aggregate_results 输出]
```

向用户展示可选下一步：

```
## 下一步

/gsd:plan-phase {next} - 规划下一阶段
/gsd:execute-phase {next} - 执行下一阶段
/gsd:ops-runbook - 刷新运维文档
/gsd:ops-audit - 审计运维覆盖
```
</step>

</process>

<context_efficiency>
编排器上下文应保持在约 10%-15%。每个子 agent 都拥有一份全新上下文窗口，不共享历史，不轮询，不把大段文件正文复制到主上下文。
</context_efficiency>

<failure_handling>
- agent 报 `classifyHandoffIfNeeded is not defined`：先做抽查，只有抽查也失败才算真失败
- agent 中途失败且缺少 `SUMMARY.md`：报告给用户并等待决策
- 依赖链断裂：上一波失败时，后续依赖波也可能连锁失败，应明确提醒
- 同一波所有 agents 全挂：高度可疑是系统性问题，应停止并报告
- checkpoint 无法解决：询问用户“跳过此计划”还是“中止整个阶段执行”，并把部分进度写入 `STATE.md`
</failure_handling>

<resumption>
重新运行 `/gsd:execute-phase {phase}` 时，应自动：
- 重新发现该阶段全部计划
- 跳过已有 `SUMMARY.md` 的计划
- 从第一个未完成计划继续
- 按波次规则接着执行

`STATE.md` 负责记录：最后完成的计划、当前波次，以及待处理的 checkpoint。
</resumption>
