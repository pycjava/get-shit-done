<purpose>
执行单个阶段计划（`PLAN.md`），并产出对应的结果总结（`SUMMARY.md`）。
</purpose>

<required_reading>
任何操作开始前，先读取 `STATE.md`，加载项目上下文。
再读取 `config.json`，了解当前规划 / 执行行为配置。

@~/.claude/get-shit-done/references/git-integration.md
@~/.claude/get-shit-done/references/tdd-discipline.md
@~/.claude/get-shit-done/references/systematic-debugging.md
@~/.claude/get-shit-done/references/commit-quality-gate.md
</required_reading>

<tdd_discipline_mandate>
每个原子任务 — 无论类型 — 都必须遵循：DEFINE → IMPLEMENT → VERIFY + SELF-CHECK。
这不是可选项，没有任何例外。执行任务前必须读取 tdd-discipline.md。
</tdd_discipline_mandate>

<debugging_mandate>
遇到任何错误、测试失败或验证不通过时，必须先完成根因调查（systematic-debugging.md Phase 1-3），才能提出修复方案。
禁止"胡乱猜改"。
</debugging_mandate>

<process>

<step name="init_context" priority="first">
先加载执行上下文，只拿路径与结构化索引，避免把 orchestrator 上下文塞满：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "${PHASE}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 JSON 中提取：`executor_model`、`commit_docs`、`phase_dir`、`phase_number`、`plans`、`summaries`、`incomplete_plans`、`state_path`、`config_path`。

如果 `.planning/` 缺失：直接报错。
</step>

<step name="identify_plan">

```bash
ls .planning/phases/XX-name/*-PLAN.md 2>/dev/null | sort
ls .planning/phases/XX-name/*-SUMMARY.md 2>/dev/null | sort
```

找出第一个“有 `PLAN.md`、但没有对应 `SUMMARY.md`”的计划。支持小数阶段目录（例如 `01.1-hotfix/`）：

```bash
PHASE=$(echo "$PLAN_PATH" | grep -oE '[0-9]+(\.[0-9]+)?-[0-9]+')
```

如果需要配置项，可以通过 `gsd-tools config-get` 读取。

<if mode="yolo">
自动批准：执行 `{phase}-{plan}-PLAN.md`，然后进入 `parse_segments`。
</if>

<if mode="interactive" OR="custom with gates.execute_next_plan true">
先向用户展示识别到的计划，再等待确认。
</if>
</step>

<step name="record_start_time">

```bash
PLAN_START_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PLAN_START_EPOCH=$(date +%s)
```

</step>

<step name="parse_segments">

```bash
grep -n "type=\"checkpoint" .planning/phases/XX-name/{phase}-{plan}-PLAN.md
```

**根据 checkpoint 类型路由：**

| 情况 | 模式 | 执行方式 |
|------|------|----------|
| 无 checkpoint | A | 单个 subagent：完整执行计划 + 生成 SUMMARY + 提交 |
| 只有 verify checkpoint | B | 分段执行：自动段交给 subagent，决策段留在主上下文 |
| 含 decision checkpoint | C | 整个计划在主上下文执行 |

**Pattern A：**
- 初始化 agent tracking
- 启动 `Task(subagent_type="gsd-executor", model=executor_model)`
- subagent 负责完整执行、写 `SUMMARY.md`、提交并回报
- 主上下文只做 tracking、等待和汇报

**Pattern B：**
- 先解析 segment map
- 自动段交给 subagent
- `decision` / `human-action` 段留在主上下文
- 所有 segment 完成后，主上下文聚合结果、生成 `SUMMARY.md`、提交并做 self-check

**Pattern C：**
- 直接进入 `execute` 步骤

这样做的目标是：把重上下文留给执行 agent，主上下文尽量保持轻量。
</step>

<step name="init_agent_tracking">

```bash
if [ ! -f .planning/agent-history.json ]; then
  echo '{"version":"1.0","max_entries":50,"entries":[]}' > .planning/agent-history.json
fi
rm -f .planning/current-agent-id.txt
if [ -f .planning/current-agent-id.txt ]; then
  INTERRUPTED_ID=$(cat .planning/current-agent-id.txt)
  echo "Found interrupted agent: $INTERRUPTED_ID"
fi
```

如果发现中断中的 agent：询问用户是继续 resume 还是重新开始。

**tracking 协议：**
- 启动 agent 时，把 `agent_id` 写入 `current-agent-id.txt`
- 同时向 `agent-history.json` 追加一条记录：
  `{"agent_id":"[id]","task_description":"[desc]","phase":"[phase]","plan":"[plan]","segment":[num|null],"timestamp":"[ISO]","status":"spawned","completion_timestamp":null}`
- agent 正常完成后：
  - `status` 更新为 `completed`
  - 写入 `completion_timestamp`
  - 删除 `current-agent-id.txt`
- 如果条目数超过 `max_entries`，只清理最旧的 `completed` 记录，绝不清理 `spawned`

Pattern A / B 都必须走这个 tracking 流程；Pattern C 可跳过。
</step>

<step name="segment_execution">
仅在 Pattern B 下使用，Pattern A / C 跳过。

流程：
1. 解析 segment map：checkpoint 位置与类型
2. 对每个 segment：
   - 自动段：启动 `gsd-executor`，仅读取该段对应任务，不生成 `SUMMARY.md`，也不提交整计划元数据
   - 主上下文段：走 `execute`
3. 所有 segment 完成后：
   - 聚合文件、偏差、决策
   - 生成 `SUMMARY.md`
   - 提交
   - 做 self-check：

```bash
[ -f <key file> ]
git log --oneline --all --grep="{phase}-{plan}"
```

在 `SUMMARY.md` 末尾追加：
- `## Self-Check: PASSED`
- 或 `## Self-Check: FAILED`

**已知 Claude Code 误报：**
如果某个 segment agent 返回 `failed`，但错误是 `classifyHandoffIfNeeded is not defined`，先按上面的 spot-check 判断。如果 spot-check 全过，就按成功处理。
</step>

<step name="load_prompt">

```bash
cat .planning/phases/XX-name/{phase}-{plan}-PLAN.md
```

这份 `PLAN.md` 本身就是执行指令，必须照着执行。

如果计划引用了 `CONTEXT.md`：执行过程中必须持续遵守其中锁定的用户决策。

**如果计划中包含 `<interfaces>` 块：**
这些类型 / 契约已经被 planner 预提取好了，直接使用即可，不要为了“重新发现类型”再去回读源文件。
</step>

<step name="previous_phase_check">

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phases list --type summaries --raw
```

提取上一份阶段总结（second-to-last summary）。

如果上一份 `SUMMARY.md` 中的 “Issues Encountered” 或 “Next Phase Readiness” 仍有未关闭 blocker：
- 在交互模式下，先问用户：
  - `Proceed anyway`
  - `Address first`
  - `Review previous`
</step>

<step name="execute">
执行过程中允许发现偏差，但必须按规则处理。

1. 读取 prompt 中引用的 `@context` 文件
2. 对每个 task：
   - **强制 `read_first`：** 如果任务有 `<read_first>`，必须先读完所有列出的文件，不能凭记忆跳过
   - `type="auto"`：
     - **强制三步纪律（所有任务，无例外）：**
       1. **DEFINE** — 实现前明确：可观测的完成状态是什么？验证命令是什么？可能的失败模式是什么？写不出来就不能开始。
       2. **IMPLEMENT** — 按计划实现，不随意扩展范围，记录所有修改的文件
       3. **VERIFY** — 运行 DEFINE 中写好的验证命令。通过 → SELF-CHECK。失败 → 调试修复，不能标记为"完成"
       4. **SELF-CHECK** — 提交前 30 秒自查：done-criteria 逐条核对、意外修改的文件说明、是否影响下游、commit message 是否诚实
     - 若 `tdd="true"`，在三步纪律之上叠加完整的 RED-GREEN-REFACTOR 循环（见 tdd.md）
     - 验证通过、自查通过后提交（见 task_commit）
   - `type="checkpoint:*"`：
     - 立刻停止
     - 进入 `checkpoint_protocol`
     - 等用户确认后再继续
   - **强制 `acceptance_criteria`：**
     - 每完成一个 task，都必须逐条验证 `<acceptance_criteria>`
     - 可用 grep、读文件、CLI 命令验证
     - 任一条没过，就先修好，不能留到“之后再验”
3. 跑完整个 `<verification>` 区块
4. 确认 `<success_criteria>` 达成
5. 把执行过程中出现的偏差记入 `SUMMARY.md`
</step>

<authentication_gates>

## 认证闸门

执行中遇到认证报错不算失败，通常只是正常的人机交接点。

**常见信号：**
`Not authenticated`、`Unauthorized`、`401/403`、`Please run {tool} login`、`Set {ENV_VAR}`

**处理协议：**
1. 识别出这是 auth gate，而不是业务 bug
2. 立即暂停当前任务
3. 动态创建一个 `checkpoint:human-action`
4. 明确告诉用户要执行的认证步骤
5. 等用户完成后校验凭证
6. 重试原任务
7. 继续执行

**示例：**
`vercel --yes` 返回 `Not authenticated`
-> 提示用户运行 `vercel login`
-> 用 `vercel whoami` 验证
-> 再次执行部署

**在 SUMMARY 中：**
把认证过程记在 `## Authentication Gates`，不要把它写成 deviation。

</authentication_gates>

<deviation_rules>

## 偏差处理规则

执行时一定会发现计划之外的工作。不要回避，按规则自动处理并记录。

> **调试门控（Rules 1-3 强制）：** 在执行任何"自动修复"前，必须先完成根因调查（see systematic-debugging.md Phase 1-3）。禁止在未理解根因的情况下提出或执行修复。

| 规则 | 触发条件 | 动作 | 是否自动 |
|------|----------|------|----------|
| **1: Bug** | 代码错误、类型错误、安全漏洞、崩溃、竞态、内存泄漏 | **根因调查 →** 修复 → 测试 → 验证 → 记录 `[Rule 1 - Bug]` | 自动 |
| **2: Missing Critical** | 缺少关键保障：错误处理、校验、鉴权、CSRF/CORS、限流、索引、日志 | **根因调查 →** 补齐 → 测试 → 验证 → 记录 `[Rule 2 - Missing Critical]` | 自动 |
| **3: Blocking** | 阻塞当前任务：缺依赖、错误导入、缺环境变量、缺配置、循环依赖 | **根因调查 →** 解除阻塞 → 验证可继续 → 记录 `[Rule 3 - Blocking]` | 自动 |
| **4: Architectural** | 结构性改动：新表、新 schema、换库、破坏性 API、新服务、新基础设施 | 停止并请求用户决策，记录 `[Rule 4 - Architectural]` | 询问用户 |

**Rule 4 展示格式：**

```
⚠️ 需要架构决策

当前任务：[task name]
触发原因：[what prompted this]
建议改动：[proposed change]
为什么需要：[rationale]
影响范围：[impact]
可选方案：[alternatives]

是否按建议执行？（yes / different approach / defer）
```

**优先级：**
Rule 4（必须停） > Rules 1-3（先调查根因，再自动修） > 不确定时默认按 Rule 4

**经验判断：**
只影响正确性 / 安全性 / 可完成性 → Rules 1-3
一旦会改变结构、边界或长期约束 → Rule 4

**修复尝试上限：**
同一问题修了 3 次仍未解决 → STOP。不要执行第 4 次修复。向用户汇报，先讨论是否存在架构问题再行动。见 systematic-debugging.md Phase 4。

</deviation_rules>

<deviation_documentation>

## 如何记录偏差

`SUMMARY.md` 里必须包含偏差区块。

如果完全没有偏差：

```markdown
## Deviations from Plan

无 - 完全按计划原样执行，没有任何偏差。
```

如果存在偏差，每条都要写清楚：

`[Rule N - Category] Title`
- 发现于哪个 Task
- 问题是什么
- 怎么修的
- 改了哪些文件
- 如何验证
- 对应提交 hash

最后再给出汇总：
- **Total deviations:** N auto-fixed（最好带 breakdown）
- **Impact:** 对计划范围和风险的总体影响

</deviation_documentation>

<tdd_plan_execution>
## TDD 执行方式

对于 `type: tdd` 的计划，严格执行 `RED -> GREEN -> REFACTOR`：

1. **基础设施准备**（只在第一个 TDD 计划中出现）
   - 检测项目类型
   - 安装测试框架
   - 补配置
   - 确认空测试套件能运行

2. **RED**
   - 读取 `<behavior>`
   - 写失败测试
   - 运行测试，**必须失败**
   - 提交：`test({phase}-{plan}): add failing test for [feature]`

3. **GREEN**
   - 读取 `<implementation>`
   - 写最小实现
   - 跑测试，**必须通过**
   - 提交：`feat({phase}-{plan}): implement [feature]`

4. **REFACTOR**
   - 清理实现
   - 保证测试仍全部通过
   - 提交：`refactor({phase}-{plan}): clean up [feature]`

异常处理：
- RED 没失败：先判断是测试写错了，还是现有实现已经满足需求
- GREEN 没通过：继续调试直到通过
- REFACTOR 引入回归：撤回并修正

详见 `~/.claude/get-shit-done/references/tdd.md`。
</tdd_plan_execution>

<precommit_failure_handling>
## pre-commit hook 失败处理

你的提交可能触发 pre-commit hooks。自动修复型 hook 会自己处理，改完后需要重新 stage。

如果提交被 hook 拦下：

1. `git commit` 失败，并返回 hook 错误
2. 认真读错误信息，它会告诉你是哪条规则没过
3. 修复问题
4. 重新 `git add` 对应文件
5. 再次提交
6. **不要**使用 `--no-verify`

这属于正常流程，默认给每次提交预留 1-2 轮重试空间。
</precommit_failure_handling>

<task_commit>
## Task 提交协议

每个 task 在"验证通过 + done 标准达成 + **质量门禁通过**"后，必须立刻提交。

**0. 质量门禁（提交前运行，见 commit-quality-gate.md）：**

```bash
# Gate 1: Exists
[ -f "path/to/output" ] && echo "OK" || echo "MISSING — 禁止提交"

# Gate 2: Substantive（无 stub / placeholder）
grep -nE "TODO|FIXME|placeholder|not implemented" path/to/output
# 有输出 = 存在 stub，修复后再提交

# Gate 3: Wired（已接入系统）
# 按产物类型选择，如：grep -r "import.*ModuleName" src/
```

Gate 4（Functional）= VERIFY 步骤。VERIFY 未运行则禁止提交。**任何 Gate 未通过：修复后重新验证。**

**1. 查看变更：**

```bash
git status --short
```

**2. 单独 stage，严禁 `git add .` / `git add -A`：**

```bash
git add src/api/auth.ts
git add src/types/user.ts
```

**3. 提交类型：**

| Type | 适用场景 | 示例 |
|------|----------|------|
| `feat` | 新功能 | `feat(08-02): create user registration endpoint` |
| `fix` | 修 bug | `fix(08-02): correct email validation regex` |
| `test` | 仅测试（TDD RED） | `test(08-02): add failing test for password hashing` |
| `refactor` | 不改行为的重构（TDD REFACTOR） | `refactor(08-02): extract validation to helper` |
| `perf` | 性能优化 | `perf(08-02): add database index` |
| `docs` | 文档 | `docs(08-02): add API docs` |
| `style` | 纯格式调整 | `style(08-02): format auth module` |
| `chore` | 配置 / 依赖 | `chore(08-02): add bcrypt dependency` |

**4. 提交格式：**
`{type}({phase}-{plan}): {description}`

必要时可在 commit body 中列关键改动点。

**5. 记录 hash：**

```bash
TASK_COMMIT=$(git rev-parse --short HEAD)
TASK_COMMITS+=("Task ${TASK_NUM}: ${TASK_COMMIT}")
```

**6. 检查执行过程中新生成的未跟踪文件：**

```bash
git status --short | grep '^??'
```

对每个新文件必须做出选择：
- **提交它**：如果它是源码、配置、或有意保留的产物
- **加入 `.gitignore`**：如果它是构建输出、缓存、运行时产物、`.env` 等
- 不能把生成文件长期留成未跟踪状态

</task_commit>

<step name="checkpoint_protocol">
遇到 `type="checkpoint:*"` 时，先自动把能做的都做完，再停下来请求用户。

**增强版检查点流程：**

1. **生成检查点产物** — 创建 `.planning/phases/{phase-dir}/CHECKPOINT-{plan}.json`
2. **收集质量报告** — 运行验证金字塔检查、测试覆盖率、静态分析
3. **记录验证结果** — 自动验证结果 + 人工验证清单
4. **保存回滚元数据** — 锚点 commit、依赖状态、环境快照
5. **展示增强格式** — 包含质量门禁状态和回滚锚点

展示格式：
```
CHECKPOINT: [Type] (ID: cp-{phase}-{plan}-{timestamp})
```
然后给出：
- **质量门禁状态** — 验证金字塔四层检查结果
- **测试覆盖率** — lines/branches/functions 百分比
- **静态分析** — lint/typecheck 结果
- **安全扫描** — 漏洞数量
- 当前进度 `{X}/{Y}`
- 当前任务名
- 该 checkpoint 的核心内容
- **回滚锚点** — 可回滚的 commit hash
- `YOUR ACTION: [signal]`

| Type | 展示内容 | 恢复信号 |
|------|----------|----------|
| `human-verify` | 构建结果 + 验证步骤（命令 / URL） + 质量报告 | `approved` 或问题描述 |
| `decision` | 需要用户决策的上下文 + 选项与利弊 | `Select: option-id` |
| `human-action` | 已自动完成的部分 + 用户需要执行的一步 + 回来后的验证方式 | `done` |

用户回复后：
- 如果指定了验证步骤，就先验证
- 验证通过再继续
- 验证没过则说明原因并继续等待
- 更新检查点产物中的 resolution 字段

不要臆测用户已经完成。

详见 `~/.claude/get-shit-done/references/checkpoints.md`。
</step>

<step name="checkpoint_return_for_orchestrator">
如果这个 workflow 是由上层 `Task()` 拉起的，那么遇到 checkpoint 时不能直接和用户对话，只能返回结构化状态。

**必须返回（增强版）：**
1. 检查点 ID 和产物路径
2. 质量门禁状态（验证金字塔四层）
3. 测试覆盖率和静态分析结果
4. 已完成 Tasks 表（含提交 hash 和改动文件）
5. 当前被阻塞的 Task
6. Checkpoint 详情（可直接展示给用户）
7. 回滚锚点信息
8. 正在等待用户完成什么

orchestrator 拿到这份结构化结果后：
- 向用户展示 checkpoint（含质量报告）
- 收到用户回复后，再起一个 continuation agent
- 更新检查点产物的 resolution 状态

这里不会 resume 原 agent。
</step>

<step name="verification_failure_gate">
如果验证失败：

**先看是否启用 node repair：**

```bash
NODE_REPAIR=$(node "./.claude/get-shit-done/bin/gsd-tools.cjs" config-get workflow.node_repair 2>/dev/null || echo "true")
```

如果 `NODE_REPAIR=true`：
- 调用 `@./.claude/get-shit-done/workflows/node-repair.md`
- 传入：
  - `FAILED_TASK`
  - `ERROR`
  - `PLAN_CONTEXT`
  - `REPAIR_BUDGET`

node repair 会自主尝试：
- `RETRY`
- `DECOMPOSE`
- `PRUNE`

只有在 repair budget 用尽并返回 `ESCALATE` 时，才重新回到这里。

如果 `NODE_REPAIR=false`，或 repair 最终 `ESCALATE`：
- 停止执行
- 清楚展示：
  - 哪个任务验证失败
  - 预期是什么
  - 实际结果是什么
  - 已尝试过哪些修复
- 再给用户选项：
  - Retry
  - Skip（标记不完整）
  - Stop（人工调查）

若用户选择 Skip，则必须在 `SUMMARY.md` 的 “Issues Encountered” 中写明。
</step>

<step name="record_completion_time">

```bash
PLAN_END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
PLAN_END_EPOCH=$(date +%s)

DURATION_SEC=$(( PLAN_END_EPOCH - PLAN_START_EPOCH ))
DURATION_MIN=$(( DURATION_SEC / 60 ))

if [[ $DURATION_MIN -ge 60 ]]; then
  HRS=$(( DURATION_MIN / 60 ))
  MIN=$(( DURATION_MIN % 60 ))
  DURATION="${HRS}h ${MIN}m"
else
  DURATION="${DURATION_MIN} min"
fi
```

</step>

<step name="generate_user_setup">

```bash
grep -A 50 "^user_setup:" .planning/phases/XX-name/{phase}-{plan}-PLAN.md | head -50
```

如果计划 frontmatter 中存在 `user_setup`：
- 使用模板 `~/.claude/get-shit-done/templates/user-setup.md`
- 生成 `{phase}-USER-SETUP.md`
- 内容至少包括：
  - 环境变量表
  - 账号配置清单
  - Dashboard / 控制台配置
  - 本地开发说明
  - 验证命令
- 初始状态写“未完成”
- 设 `USER_SETUP_CREATED=true`

如果 `user_setup` 缺失或为空：跳过。
</step>

<step name="create_summary">
在 `.planning/phases/XX-name/` 中创建 `{phase}-{plan}-SUMMARY.md`，模板使用 `~/.claude/get-shit-done/templates/summary.md`。

**Frontmatter 至少要包含：**
- `phase`
- `plan`
- `subsystem`
- `tags`
- `requires` / `provides` / `affects`
- `tech-stack.added` / `patterns`
- `key-files.created` / `key-files.modified`
- `key-decisions`
- `requirements-completed`
- `duration`
- `completed`

其中 `requirements-completed` **必须** 从 `PLAN.md` frontmatter 里的 `requirements` 原样复制。

标题格式：

```markdown
# 阶段 [X] 计划 [Y]：[Name] 总结
```

正文要求：
- 第一行必须是**有实质内容的一句话总结**
  - 好例子：`使用 jose 实现 JWT 鉴权与 refresh token 轮换`
  - 差例子：`完成了认证功能`
- 包含：
  - 总耗时
  - 开始 / 结束时间
  - task 数
  - 文件数

结尾路由：
- 如果还有下一个计划：`已准备好进入 {next-plan}`
- 如果这是本阶段最后一个计划：`阶段完成，准备进入 transition`
</step>

<step name="update_current_position">
使用 `gsd-tools` 更新 `STATE.md`：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state advance-plan
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state update-progress
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state record-metric \
  --phase "${PHASE}" --plan "${PLAN}" --duration "${DURATION}" \
  --tasks "${TASK_COUNT}" --files "${FILE_COUNT}"
```
</step>

<step name="extract_decisions_and_issues">
从 `SUMMARY.md` 提取关键决策与问题，回写到 `STATE.md`：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state add-decision \
  --phase "${PHASE}" --summary-file "${DECISION_TEXT_FILE}" --rationale-file "${RATIONALE_FILE}"

node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state add-blocker --text-file "${BLOCKER_TEXT_FILE}"
```

优先用文件参数传文本，避免 shell 对 `$`、`*` 等字符做意外转义。
</step>

<step name="update_session_continuity">
更新会话连续性信息：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state record-session \
  --stopped-at "Completed ${PHASE}-${PLAN}-PLAN.md" \
  --resume-file "None"
```

并确保 `STATE.md` 保持在 150 行以内。
</step>

<step name="issues_review_gate">
如果 `SUMMARY.md` 中的 “Issues Encountered” 不为 `None`：
- `yolo` 模式：记录后继续
- 交互模式：向用户展示问题并等待确认
</step>

<step name="update_roadmap">

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap update-plan-progress "${PHASE}"
```

这个命令会根据磁盘上 `PLAN` / `SUMMARY` 的数量更新阶段进度表，把状态改成 `In Progress` 或 `Complete`，并补日期。
</step>

<step name="update_requirements">
把 `PLAN.md` frontmatter 中 `requirements:` 指向的 requirement IDs 标记为完成：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" requirements mark-complete ${REQ_IDS}
```

如果没有 `requirements` 字段，则跳过。
</step>

<step name="git_commit_metadata">
代码类 task 已经按 task 级别提交过，这一步只提交计划元数据：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs({phase}-{plan}): complete [plan-name] plan" --files .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md .planning/STATE.md .planning/ROADMAP.md .planning/REQUIREMENTS.md
```
</step>

<step name="update_codebase_map">
如果 `.planning/codebase/` 不存在：直接跳过。

```bash
FIRST_TASK=$(git log --oneline --grep="feat({phase}-{plan}):" --grep="fix({phase}-{plan}):" --grep="test({phase}-{plan}):" --reverse | head -1 | cut -d' ' -f1)
git diff --name-only ${FIRST_TASK}^..HEAD 2>/dev/null
```

只更新结构性地图，不处理纯代码细节：
- 新增 `src/` 目录 -> `STRUCTURE.md`
- 依赖变化 -> `STACK.md`
- 文件组织模式变化 -> `CONVENTIONS.md`
- API / 外部服务集成变化 -> `INTEGRATIONS.md`
- 配置变化 -> `STACK.md`
- 文件重命名 -> 更新相应路径引用

然后提交 codebase map：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "" --files .planning/codebase/*.md --amend
```
</step>

<step name="offer_next">
如果 `USER_SETUP_CREATED=true`，必须优先提示用户还有环境 / 账号配置没做完。

```bash
ls -1 .planning/phases/[current-phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[current-phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
```

根据阶段内 plan / summary 数量做路由：

| 条件 | 路由 | 动作 |
|------|------|------|
| `summaries < plans` | A：还有计划未执行 | 找下一个 plan，`yolo` 直接继续，交互模式提示用户运行 `/gsd:execute-phase {phase}` |
| `summaries = plans` 且 `current < highest phase` | B：当前阶段完成 | 提示下一阶段，推荐 `/gsd:plan-phase {Z+1}` 或 `/gsd:discuss-phase {Z+1}` |
| `summaries = plans` 且 `current = highest phase` | C：里程碑完成 | 推荐 `/gsd:complete-milestone` |

所有路线都建议先 `/clear`，再进入下一步。
</step>

</process>

<success_criteria>

- [ ] `PLAN.md` 中的全部任务都已执行
- [ ] 所有验证步骤通过
- [ ] 如果存在 `user_setup`，已生成 `USER-SETUP.md`
- [ ] 已创建内容扎实的 `SUMMARY.md`
- [ ] 已更新 `STATE.md`（位置、决策、问题、会话）
- [ ] 已更新 `ROADMAP.md`
- [ ] 如果存在 codebase map，已按结构变化同步更新
- [ ] 如果生成了 `USER-SETUP.md`，已在最终输出中显著提示用户

</success_criteria>
