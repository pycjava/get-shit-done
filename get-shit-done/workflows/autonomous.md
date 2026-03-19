<purpose>
主模式：
先把所有剩余阶段汇总成一个统一的总计划，再按这个总计划自主执行。总计划必须成为用户看到的唯一主线。如果本文件里的旧指令和“先出总计划再执行”冲突，以“总计划优先”为准。

目标是让所有未完成阶段以“讨论 -> 规划 -> 执行”的顺序自动推进。只有在明确需要用户决策、阻塞升级、或人工验证时才暂停。每完成一个阶段都要重新读取 `ROADMAP.md`，以捕捉执行中途插入的新阶段。
</purpose>

<required_reading>

先读取 invoking prompt 的 execution_context 中引用的全部文件。

</required_reading>

<process>

<step name="initialize" priority="first">

## 1. 初始化

从 `$ARGUMENTS` 中解析 `--from N`：

```bash
FROM_PHASE=""
if echo "$ARGUMENTS" | grep -qE '\-\-from\s+[0-9]'; then
  FROM_PHASE=$(echo "$ARGUMENTS" | grep -oE '\-\-from\s+[0-9]+\.?[0-9]*' | awk '{print $2}')
fi
```

通过 milestone 级 init 完成引导：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init milestone-op)
```

从 JSON 中提取：`milestone_version`、`milestone_name`、`phase_count`、`completed_phases`、`roadmap_exists`、`state_exists`、`commit_docs`。

错误处理：
- `roadmap_exists=false`：报错“未找到 `ROADMAP.md`。请先运行 `/gsd:new-milestone`”
- `state_exists=false`：报错“未找到 `STATE.md`。请先运行 `/gsd:new-milestone`”

向用户展示启动信息：

```markdown
## GSD 自主执行

里程碑：{milestone_version} - {milestone_name}
阶段：共 {phase_count} 个，已完成 {completed_phases} 个
```

如果指定了 `FROM_PHASE`，额外说明：
`从阶段 ${FROM_PHASE} 开始执行`

</step>

<step name="discover_phases">

## 2. 发现阶段并先输出总计划

**总计划优先：**
把 `roadmap execution-plan` 当作权威来源。它已经会把剩余阶段合并成一个统一执行计划，并显式暴露 TDD 执行步。

```bash
MASTER_PLAN_CMD=(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap execution-plan)
if [[ -n "$FROM_PHASE" ]]; then
  MASTER_PLAN_CMD+=(--from "$FROM_PHASE")
fi
MASTER_PLAN=$("${MASTER_PLAN_CMD[@]}")
```

从结果中提取：`phases`、`master_steps`、`totals`、`next_step`。

**任何执行动作开始前，都必须先展示统一总计划。**

建议展示格式：

```markdown
## 总计划

| 步骤 | 阶段 | 类型 | 模式 | 状态 | 摘要 |
|------|------|------|------|------|------|
| 1 | 05 | 上下文 | 标准 | 已完成 | 使用现有 CONTEXT.md 决策 |
| 2 | 05 | 规划 | 标准 | 已完成 | 已有 2 个可执行计划 |
| 3 | 05 | 计划执行 | TDD | 待执行 | 登录流程：RED -> GREEN -> REFACTOR |
| 4 | 05 | 验证 | 标准 | 已阻塞 | 执行完后需要验证 |
```

规则：
- 按 `master_steps` 顺序展示
- 如果 `mode=tdd`，摘要列里必须显式写出 `RED -> GREEN -> REFACTOR`
- 必须让用户看到这是“跨阶段的一条总主线”，而不是孤立的每阶段小提示
- 如果存在 `next_step`，在表后明确点名“当前应先做哪一步”

后续执行时，阶段列表也以这里的 `phases` 为准。除非你确实缺上下文，否则不要再额外做一次重复 discovery。

为了兼容旧逻辑，可继续读取：

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

从 JSON 的 `phases` 数组中筛出“未完成阶段”：
- `disk_status !== "complete"` 或 `roadmap_complete === false`
- 如果传了 `--from N`，再过滤掉 `number < FROM_PHASE` 的阶段
- 最终按数值升序排序（支持 `5.1` 这类小数阶段）

如果过滤后为空，展示：

```markdown
## GSD 自主执行完成

所有阶段都已经完成，没有剩余工作。
```

然后正常退出。

如果还有未完成阶段，可额外展示一张简表：

```markdown
## 阶段顺序

| # | 阶段 | 状态 |
|---|------|------|
| 5 | Skill Scaffolding & Phase Discovery | 进行中 |
| 6 | Smart Discuss | 未开始 |
| 7 | Auto-Chain Refinements | 未开始 |
```

必要时对每个阶段读取详情：

```bash
DETAIL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase ${PHASE_NUM})
```

提取 `phase_name`、`goal`、`success_criteria`，用于执行前说明与 blocker 提示。

</step>

<step name="execute_phase">

## 3. 执行阶段

开始某个阶段前，先从前面生成的 `MASTER_PLAN` 中查出该阶段对应的条目。

向用户介绍当前阶段时，必须说明：
- 这个阶段的目标是什么
- 当前阶段内还剩多少执行步
- 如果其中存在 `mode: tdd` 的执行步，要明确指出这是 TDD 阶段，并点名 `RED -> GREEN -> REFACTOR`

如果这些要求与旧版 banner 冲突，以这里为准。

当前阶段开始时，展示进度 banner：

```markdown
## GSD 自主执行 · 阶段 {N}/{T}: {Name} [■■■□□□] {P}%
```

其中：
- `N`：当前 ROADMAP 阶段编号
- `T`：里程碑总阶段数
- `P`：已完成阶段数 / 总阶段数 * 100
- 进度条固定 8 格，已完成用 `■`，未完成用 `□`

**3a. Smart Discuss**

先检查当前阶段是否已经有 `CONTEXT.md`：

```bash
PHASE_STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op ${PHASE_NUM})
```

读取 `has_context`。

如果 `has_context=true`：
- 直接跳过 discuss
- 输出：`阶段 ${PHASE_NUM} 已存在 CONTEXT.md，跳过讨论。`
- 进入 3b

如果 `has_context=false`：
- 执行 `smart_discuss`

执行后再次读取：

```bash
PHASE_STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op ${PHASE_NUM})
```

如果 `has_context` 仍是 `false`：
- 进入 `handle_blocker`
- 描述：`阶段 ${PHASE_NUM} 的 smart discuss 没有生成 CONTEXT.md`

**3b. Plan**

```
Skill(skill="gsd:plan-phase", args="${PHASE_NUM}")
```

执行完后再次 `init phase-op`，确认 `has_plans=true`。
如果没有计划：
- 进入 `handle_blocker`
- 描述：`阶段 ${PHASE_NUM} 的 plan-phase 没有生成任何计划`

**3c. Execute**

```
Skill(skill="gsd:execute-phase", args="${PHASE_NUM} --no-transition")
```

**3d. 执行后路由**

读取验证结果：

```bash
VERIFY_STATUS=$(grep "^status:" "${PHASE_DIR}"/*-VERIFICATION.md 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' ')
```

如果 `PHASE_DIR` 不在作用域内，重新取：

```bash
PHASE_STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op ${PHASE_NUM})
```

从中取 `phase_dir`。

分支：

- `VERIFY_STATUS` 为空：
  - `handle_blocker`
  - 描述：`阶段 ${PHASE_NUM} 的 execute-phase 没有生成验证结果`

- `passed`：
  - 输出：`阶段 ${PHASE_NUM} ✓ ${PHASE_NAME} - 验证通过`
  - 进入 `iterate`

- `human_needed`：
  - 从 `VERIFICATION.md` 里读取 `human_verification`
  - 展示待人工验证项
  - 通过 `AskUserQuestion` 询问：
    - 问题：`阶段 ${PHASE_NUM} 还有需要人工验证的项目。现在验证，还是先继续下一阶段？`
    - 选项：`现在验证` / `暂不验证，继续下一阶段`

  如果用户选 `现在验证`：
  - 展示具体测试项
  - 再问：
    - 问题：`验证结果如何？`
    - 选项：`全部正常，继续` / `发现问题`

  如果用户选 `全部正常，继续`：
  - 输出：`阶段 ${PHASE_NUM} ✓ 人工验证通过`
  - 进入 `iterate`

  如果用户选 `发现问题`：
  - 进入 `handle_blocker`
  - 用用户反馈的问题作为描述

  如果用户选 `暂不验证，继续下一阶段`：
  - 输出：`阶段 ${PHASE_NUM} ⏭ 人工验证已延后`
  - 进入 `iterate`

- `gaps_found`：
  - 读取 `VERIFICATION.md` 里的 gap 摘要与得分
  - 展示：

    ```
    ⚠️ 阶段 ${PHASE_NUM}: ${PHASE_NAME} - 发现缺口
    得分：{N}/{M} 个必备项已验证
    ```

  - 询问：
    - 问题：`阶段 ${PHASE_NUM} 发现缺口。如何继续？`
    - 选项：`运行缺口修复` / `暂不修复，继续` / `停止自主模式`

  如果用户选 `运行缺口修复`：

  ```
  Skill(skill="gsd:plan-phase", args="${PHASE_NUM} --gaps")
  ```

  然后再次确认 gap plans 已生成；若没有：
  - `handle_blocker`
  - 描述：`阶段 ${PHASE_NUM} 的缺口修复规划没有生成计划`

  再执行：

  ```
  Skill(skill="gsd:execute-phase", args="${PHASE_NUM} --no-transition")
  ```

  再次读取：

  ```bash
  VERIFY_STATUS=$(grep "^status:" "${PHASE_DIR}"/*-VERIFICATION.md 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' ')
  ```

  - 如果变成 `passed` 或 `human_needed`：按正常分支继续
  - 如果仍是 `gaps_found`：提示“自动修复一轮后仍有残留缺口”，再问：
    - `仍然继续`
    - `停止自主模式`

  若选 `仍然继续`：进入 `iterate`
  若选 `停止自主模式`：进入 `handle_blocker`

  这一步只允许 1 次自动 gap closure，避免无限循环。

  如果用户选 `暂不修复，继续`：
  - 输出：`阶段 ${PHASE_NUM} ⏭ 缺口已延后`
  - 进入 `iterate`

  如果用户选 `停止自主模式`：
  - 进入 `handle_blocker`
  - 描述：`用户已停止，阶段 ${PHASE_NUM} 仍存在缺口`

</step>

<step name="smart_discuss">

## Smart Discuss

这是面向 autonomous 模式的 discuss 变体：不是按题逐个提问，而是按“灰区 -> 建议答案 -> 用户接受/修改”的方式批量收敛决策。最终产出的 `CONTEXT.md` 结构必须与普通 `discuss-phase` 保持一致。

> 说明：这是 `gsd:discuss-phase` 的自主执行优化版。输出格式相同，只是交互方式更适合自动链。

输入：`PHASE_NUM`

先取阶段路径信息：

```bash
PHASE_STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op ${PHASE_NUM})
```

提取：`phase_dir`、`phase_slug`、`padded_phase`、`phase_name`。

---

### 子步骤 1：加载已有上下文

为了避免重复问已经锁定的问题，先读取项目级和前序阶段上下文。

**项目级文件：**

```bash
cat .planning/PROJECT.md 2>/dev/null
cat .planning/REQUIREMENTS.md 2>/dev/null
cat .planning/STATE.md 2>/dev/null
```

重点提取：
- `PROJECT.md`：愿景、原则、不可谈判项、用户偏好
- `REQUIREMENTS.md`：验收标准、约束、must-have / nice-to-have
- `STATE.md`：当前进展与已经记录的决策

**前序 `CONTEXT.md`：**

```bash
find .planning/phases -name "*-CONTEXT.md" 2>/dev/null | sort
```

对所有“阶段号 < 当前阶段号”的 `CONTEXT.md`：
- 读取 `<decisions>`：这些是已经锁定的偏好
- 读取 `<specifics>`：例如“我想要像 X 那样”这种具体风格要求
- 总结可迁移的模式

构建内部的 `prior_decisions`：

```markdown
<prior_decisions>
## Project-Level
- [来自 PROJECT.md 的关键原则或约束]
- [来自 REQUIREMENTS.md 的阶段相关要求]

## From Prior Phases
### Phase N: [Name]
- [与当前阶段相关的已决策内容]
- [建立了明确风格或模式的偏好]
</prior_decisions>
```

如果没有历史上下文，允许为空。

---

### 子步骤 2：快速侦察代码库

做一轮轻量代码扫描，为灰区建议提供依据。上下文预算控制在约 5%。

**优先看现有 codebase map：**

```bash
ls .planning/codebase/*.md 2>/dev/null
```

如果存在：
- 只读取相关项，例如 `CONVENTIONS.md`、`STRUCTURE.md`、`STACK.md`
- 提取可复用组件、既有模式、接入点

如果不存在：
- 从阶段 goal 提取关键词
- 在代码里做定向搜索

```bash
grep -rl "{term1}\|{term2}" src/ app/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | head -10
ls src/components/ src/hooks/ src/lib/ src/utils/ 2>/dev/null
```

然后读取最相关的 3-5 个文件，形成内部 `codebase_context`：
- 可复用资产
- 已建立模式
- 接入点

---

### 子步骤 3：分析阶段并生成建议答案

先取阶段详情：

```bash
DETAIL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase ${PHASE_NUM})
```

提取：`goal`、`requirements`、`success_criteria`。

**先判断是否是纯基础设施阶段。**

满足以下条件时视为 infrastructure-only：
1. goal 关键词属于：`scaffolding`、`plumbing`、`setup`、`configuration`、`migration`、`refactor`、`rename`、`restructure`、`upgrade`、`infrastructure`
2. success criteria 全是技术性结果，如“文件存在”“测试通过”“配置有效”“命令可运行”
3. 没有任何用户可感知的行为描述，如“users can”“displays”“shows”“presents”

如果是纯基础设施阶段：
- 直接跳过提问
- 写最小 `CONTEXT.md`
- 输出：`阶段 ${PHASE_NUM} 是纯基础设施阶段，跳过讨论，直接记录最小上下文。`

默认内容：
- `<domain>`：直接写阶段边界
- `<decisions>`：只保留 `Claude's Discretion`
- `<code_context>`：写扫描到的现有代码信息
- `<specifics>`：`无特定要求——基础设施阶段`
- `<deferred>`：`无`

如果不是基础设施阶段，再继续生成灰区提案。

**灰区分类启发式：**
- 用户会“看到”的：布局、交互、状态、密度
- 用户会“调用”的：接口、错误、鉴权、返回格式
- 用户会“运行”的：命令、输出、模式、参数
- 用户会“阅读”的：结构、语气、深度、流向
- 用户会“组织”的：分类、命名、例外、分组

跳过那些在 `prior_decisions` 中已经锁定过的灰区。

最终生成：
- 3-4 个灰区
- 每个灰区约 4 个问题
- 每个问题都给：
  - 推荐答案
  - 1-2 个备选
  - 推荐理由
  - 如果适用，说明它与前序决策或代码既有模式的关联

---

### 子步骤 4：逐个灰区向用户展示

灰区按顺序一个一个呈现。每个灰区展示一张表：

```markdown
### 灰区 {M}/{N}: {Area Name}

| # | 问题 | 推荐 | 备选项 |
|---|------|------|--------|
| 1 | {question} | {answer} - {rationale} | {alt1}; {alt2} |
| 2 | {question} | {answer} - {rationale} | {alt1} |
| 3 | {question} | {answer} - {rationale} | {alt1}; {alt2} |
| 4 | {question} | {answer} - {rationale} | {alt1} |
```

然后用 `AskUserQuestion` 提问：
- `header`: `区域 {M}/{N}`
- `question`: `接受 {Area Name} 的这些建议吗？`
- `options`：
  - `全部接受`
  - `修改 Q1`
  - `修改 Q2`
  - ...
  - `深入讨论`

**如果用户选 `全部接受`：**
- 记录该灰区全部推荐答案
- 进入下一个灰区

**如果用户选 `修改 QN`：**
- 只针对这一题再问一次
- 选项是该题的备选答案 + `交给 Claude 决定`
- 收集结果后刷新表格，再次给出“全部接受 / 继续改 / 深入讨论”

**如果用户选 `深入讨论`：**
- 切换为细问模式
- 每次只问 1 题
- 每题给 2-3 个具体选项 + `交给 Claude 决定`
- 4 题后再问：
  - `继续问关于 {area} 的问题`
  - `进入下一个区域`

**如果用户用 Other 输入自由文本：**
- 把自由文本吸收为这个灰区的决策或约束
- 刷新表格并继续

**如果用户提出了当前阶段范围外的新能力点：**

```
"{Feature}" 更像一个新的能力点，应该单独作为后续阶段处理。
我会先把它记录为 deferred idea。
现在回到 {current area}。
```

把这些内容记录进 deferred ideas。

---

### 子步骤 5：写 `CONTEXT.md`

所有灰区都收敛后，写入：
`${phase_dir}/${padded_phase}-CONTEXT.md`

结构必须保持：

```markdown
# 阶段 {PHASE_NUM}: {Phase Name} - 上下文
**收集时间：** {date}
**状态：** 可进入规划

<domain>
## 阶段边界

{本阶段要交付什么}

</domain>

<decisions>
## 决策（Decisions）
### {Area 1 Name}
- {Q1 的最终答案}
- {Q2 的最终答案}
- {Q3 的最终答案}
- {Q4 的最终答案}

### {Area 2 Name}
- ...

### Claude 自主判断（Claude's Discretion）
{用户明确交给 Claude 决定的项}

</decisions>

<code_context>
## 现有代码洞察

### 可复用资产
- ...

### 已建立模式
- ...

### 集成点
- ...

</code_context>

<specifics>
## 具体想法（Specific Ideas）
{讨论中提到的具体参考、示例、偏好}
{如果没有：无特定要求——可采用标准方案}

</specifics>

<deferred>
## 延后想法（Deferred Ideas）
{超出本阶段范围、但值得记录的点}
{如果没有：无——讨论范围未超出当前阶段}

</deferred>
```

写完后提交：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(${PADDED_PHASE}): smart discuss context" --files "${phase_dir}/${padded_phase}-CONTEXT.md"
```

再向用户确认：

```
已创建：{path}
已记录决策：共 {count} 条，覆盖 {area_count} 个灰区
```

</step>

<step name="iterate">

## 4. 阶段间迭代

**每完成一个阶段，都要先刷新统一总计划。**

```bash
MASTER_PLAN_CMD=(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap execution-plan)
if [[ -n "$FROM_PHASE" ]]; then
  MASTER_PLAN_CMD+=(--from "$FROM_PHASE")
fi
MASTER_PLAN=$("${MASTER_PLAN_CMD[@]}")
```

重新提取：`phases`、`master_steps`、`totals`、`next_step`。

如果还有未完成阶段：
- 用这次刷新后的 `phases` 作为新的循环输入
- 简短重展示一下剩余总计划摘要
- 按刷新后的顺序继续执行下一个阶段

如果没有剩余阶段：
- 进入 `lifecycle`

为了兼容旧逻辑，也重新执行一次：

```bash
ROADMAP=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap analyze)
```

重新过滤未完成阶段：
- `disk_status !== "complete"` 或 `roadmap_complete === false`
- 应用 `--from`
- 数值升序排序

然后刷新 `STATE.md`：

```bash
cat .planning/STATE.md
```

如果 `Blockers/Concerns` 区块中出现 blocker：
- 进入 `handle_blocker`

如果仍有阶段待执行：
- 回到 `execute_phase`

如果全部完成：
- 进入 `lifecycle`

</step>

<step name="lifecycle">

## 5. 生命周期收尾

当所有阶段都完成后，必须自动进入：`audit -> complete -> cleanup`

向用户展示转场：

```markdown
## GSD 自主执行 · 生命周期

所有阶段已完成 -> 开始生命周期流程：audit -> complete -> cleanup
里程碑：{milestone_version} - {milestone_name}
```

**5a. Audit**

```
Skill(skill="gsd:audit-milestone")
```

执行后读取：

```bash
AUDIT_FILE=".planning/v${milestone_version}-MILESTONE-AUDIT.md"
AUDIT_STATUS=$(grep "^status:" "${AUDIT_FILE}" 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' ')
```

如果 `AUDIT_STATUS` 为空：
- 进入 `handle_blocker`
- 描述：`审计没有产出有效结果——审计文件缺失或格式不正确`

如果 `AUDIT_STATUS=passed`：
- 输出：`审计 ✓ 已通过 - 继续完成里程碑`
- 直接进入 5b

如果 `AUDIT_STATUS=gaps_found`：
- 读取 gap 摘要
- 问用户：
  - `继续，接受这些缺口`
  - `停止，先手动修复缺口`

若选 `继续，接受这些缺口`：
- 输出：`审计 ⏭ 已接受缺口 - 继续完成里程碑`
- 进入 5b

若选 `停止，先手动修复缺口`：
- `handle_blocker`
- 描述：`用户已停止——审计缺口仍未处理。请先运行 /gsd:audit-milestone 查看，再在准备好后运行 /gsd:complete-milestone`

如果 `AUDIT_STATUS=tech_debt`：
- 读取 tech debt 摘要
- 问用户：
  - `带着技术债继续`
  - `停止，先处理技术债`

若选 `带着技术债继续`：
- 输出：`审计 ⏭ 已确认技术债 - 继续完成里程碑`
- 进入 5b

若选 `停止，先处理技术债`：
- `handle_blocker`
- 描述：`用户已停止——仍有技术债需要处理。请先运行 /gsd:audit-milestone 查看详情`

**5b. Complete Milestone**

```
Skill(skill="gsd:complete-milestone", args="${milestone_version}")
```

完成后验证归档产物：

```bash
ls .planning/milestones/v${milestone_version}-ROADMAP.md 2>/dev/null
```

若归档文件不存在：
- `handle_blocker`
- 描述：`complete-milestone 没有生成预期归档文件`

**5c. Cleanup**

```
Skill(skill="gsd:cleanup")
```

cleanup 自带 dry-run 和用户确认，这个暂停是允许的。

**5d. 最终完成提示**

```markdown
## GSD 自主执行完成

里程碑：{milestone_version} - {milestone_name}
状态：已完成 ✓
生命周期：audit ✓ -> complete ✓ -> cleanup ✓
可以发布。
```

</step>

<step name="handle_blocker">

## 6. 处理阻塞

任何阶段或生命周期动作失败时，都通过 `AskUserQuestion` 给用户 3 个选项。

**提示：**
`阶段 {N}（{Name}）遇到问题：{description}`

**选项：**
1. `修复并重试` - 重新执行当前阶段的失败步骤
2. `跳过此阶段` - 记为跳过，继续下一个未完成阶段
3. `停止自主模式` - 输出进度摘要并正常退出

**如果用户选 `修复并重试`：**
- 回到 `execute_phase` 中失败的那个步骤
- 如果再次失败，重复给出这 3 个选项

**如果用户选 `跳过此阶段`：**
- 记录：`阶段 {N} ⏭ {Name} - 用户已跳过`
- 进入 `iterate`

**如果用户选 `停止自主模式`：**
- 输出摘要：

```markdown
## GSD 自主执行已停止

已完成：{completed phases}
已跳过：{skipped phases}
剩余：{remaining phases}

继续执行：
/gsd:autonomous --from {next_phase}
```

</step>

</process>

<success_criteria>
- [ ] 所有未完成阶段都按顺序执行
- [ ] 开始执行前先展示统一总计划
- [ ] 总计划来自 `gsd-tools.cjs roadmap execution-plan`
- [ ] TDD 阶段在总计划中明确显示 `RED -> GREEN -> REFACTOR`
- [ ] 每个阶段按 smart discuss -> plan -> execute 顺序推进
- [ ] `execute-phase` 始终带 `--no-transition`，由 autonomous 自己负责阶段间路由
- [ ] 每个阶段结束后读取 `VERIFICATION.md` 并按状态路由
- [ ] `passed` 自动继续
- [ ] `human_needed` 时提示用户人工验证或延后
- [ ] `gaps_found` 时提供补洞、继续、停止三种选择
- [ ] gap closure 自动重试至多 1 次
- [ ] 计划失败或执行失败都能进入 blocker 路由
- [ ] 每完成一阶段都刷新统一总计划，再决定下一步
- [ ] 仍保留 `ROADMAP.md` 重读，能识别中途插入的小数阶段
- [ ] 生命周期阶段会自动执行 `audit -> complete -> cleanup`
- [ ] 审计结果按 `passed / gaps_found / tech_debt` 正确路由
- [ ] 最终给出清晰完成或停止摘要
</success_criteria>
