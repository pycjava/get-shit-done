<purpose>
执行小型、临时性的 quick task，同时保留 GSD 的基本保障：原子提交、`STATE.md` 追踪、产物目录化。

Quick 模式会拉起 `gsd-planner`（quick mode）和 `gsd-executor`，把任务记录到 `.planning/quick/`，并把结果写入 `STATE.md` 的 `Quick Tasks Completed` 表。

支持的增强模式：
- `--discuss`：在规划前做轻量讨论，提前暴露灰区并把用户决策写入 `CONTEXT.md`
- `--research`：在规划前先做聚焦研究，快速了解可选方案、库、坑点与集成方式
- `--full`：开启 plan-checker（最多 2 轮）和执行后验证，给 quick task 增加更强质量护栏

这些 flag 可以组合使用，例如：`--discuss --research --full`
</purpose>

<required_reading>
开始前，先读取 invoking prompt 的 execution_context 中引用的全部文件。
</required_reading>

<process>

**步骤 1：解析参数并拿到任务描述**

从 `$ARGUMENTS` 解析：
- `--full` -> `$FULL_MODE`
- `--discuss` -> `$DISCUSS_MODE`
- `--research` -> `$RESEARCH_MODE`
- 剩余文本 -> `$DESCRIPTION`

如果 `$DESCRIPTION` 为空，则交互式询问：

```text
AskUserQuestion(
  header: "快速任务",
  question: "你这次想处理什么？",
  followUp: null
)
```

把回答写回 `$DESCRIPTION`。

如果仍为空，再次提示：
`请提供一个任务描述。`

**根据启用的 flag 展示横幅。**

不要求保留旧版花哨字符框，但必须明确显示：
- 这是 `QUICK TASK`
- 当前启用的模式组合，例如 `DISCUSS + RESEARCH + FULL`
- 对用户的含义，例如：
  - `--discuss`：先澄清灰区
  - `--research`：先研究方案
  - `--full`：先审计划，再做验证

示例：

```markdown
## GSD 快速任务

模式：DISCUSS + RESEARCH + FULL
说明：先讨论，再研究，再规划；执行后还会做计划检查与结果验证。
```

---

**步骤 2：初始化**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init quick "$DESCRIPTION")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

提取：`planner_model`、`executor_model`、`checker_model`、`verifier_model`、`commit_docs`、`quick_id`、`slug`、`date`、`timestamp`、`quick_dir`、`task_dir`、`roadmap_exists`、`planning_exists`。

如果 `roadmap_exists=false`：
- 直接报错：`quick` 模式依赖一个活跃项目，必须存在 `ROADMAP.md`
- 提示用户先运行 `/gsd:new-project`

说明：quick task 可以插在任意阶段中途执行，只要求项目已初始化，不要求阶段本身处于“可执行”状态。

---

**步骤 3：创建任务目录**

```bash
mkdir -p "${task_dir}"
```

---

**步骤 4：创建 quick task 目录**

```bash
QUICK_DIR=".planning/quick/${quick_id}-${slug}"
mkdir -p "$QUICK_DIR"
```

向用户报告：

```
正在创建 quick task ${quick_id}: ${DESCRIPTION}
目录：${QUICK_DIR}
```

---

**步骤 4.5：讨论阶段（仅在 `$DISCUSS_MODE=true` 时执行）**

如果没开 `--discuss`，整步跳过。

先展示标题：

```markdown
## 快速任务讨论

目标：为任务 ${DESCRIPTION} 提前澄清灰区，避免 planner 在关键选择上靠猜。
```

**4.5a. 识别灰区**

根据任务描述，找出 2-4 个真正会影响实现结果、且值得用户拍板的灰区。

启发式：
- 用户会“看到”的：布局、密度、交互、状态呈现
- 用户会“调用”的：返回格式、错误语义、鉴权方式、版本约定
- 用户会“运行”的：输出样式、参数、模式、异常处理
- 用户会“阅读”的：结构、语气、深度、流向
- 用户会“组织”的：命名、分类、例外、聚合规则

灰区要写得具体，例如“加载态是否骨架屏”比“UX 风格”更好。

**4.5b. 把灰区呈现给用户**

```text
AskUserQuestion(
  header: "灰区",
  question: "在开始规划前，哪些地方需要先说明白？",
  options: [
    { label: "${area_1}", description: "${why_it_matters_1}" },
    { label: "${area_2}", description: "${why_it_matters_2}" },
    { label: "${area_3}", description: "${why_it_matters_3}" },
    { label: "全部清楚", description: "直接进入规划" }
  ],
  multiSelect: true
)
```

如果用户选 `全部清楚`：
- 直接跳到步骤 5
- 不写 `CONTEXT.md`

**4.5c. 深挖所选灰区**

对每个选中的灰区，最多追问 1-2 轮：

```text
AskUserQuestion(
  header: "${area_name}",
  question: "${specific_question_about_this_area}",
  options: [
    { label: "${choice_1}", description: "${meaning_1}" },
    { label: "${choice_2}", description: "${meaning_2}" },
    { label: "${choice_3}", description: "${meaning_3}" },
    { label: "交给 Claude", description: "由 Claude 自主判断" }
  ],
  multiSelect: false
)
```

规则：
- 选项必须是具体选择，不是抽象类目
- 如果你有明确推荐项，可以把推荐放第一位
- 用户如果用 Other 填自由文本，就转成自然语言补充说明
- 如果用户选 `交给 Claude`，记录到 `Claude's Discretion`
- quick task 只做轻量澄清，不做长会话

把所有结果汇总成 `$DECISIONS`。

**4.5d. 写 `CONTEXT.md`**

文件路径：
`${QUICK_DIR}/${quick_id}-CONTEXT.md`

结构：

```markdown
# Quick 任务 ${quick_id}: ${DESCRIPTION} - 上下文
**收集时间：** ${date}
**状态：** 可进入规划

<domain>
## 任务边界

${DESCRIPTION}

</domain>

<decisions>
## 决策（Decisions）
### ${area_1_name}
- ${decision_from_discussion}

### ${area_2_name}
- ${decision_from_discussion}

### Claude 自主判断（Claude's Discretion）
${areas_where_user_said_you_decide_or_areas_not_discussed}

</decisions>

<specifics>
## 具体想法（Specific Ideas）
${any_specific_references_or_examples_from_discussion}

[如果没有：无特定要求——可采用标准方案]

</specifics>

<canonical_refs>
## 规范参考（Canonical References）
${any_specs_adrs_or_docs_referenced_during_discussion}

[如果没有：无外部规范——上面的决策已足够]

</canonical_refs>
```

quick task 的 `CONTEXT.md` 保持精简：
- 不需要 `<code_context>`
- 不需要 `<deferred>`
- 只有在提到外部文档时才需要 `<canonical_refs>`

写完后向用户报告：
`上下文已记录：{QUICK_DIR}/${quick_id}-CONTEXT.md`

---

**步骤 4.75：研究阶段（仅在 `$RESEARCH_MODE=true` 时执行）**

如果没开 `--research`，整步跳过。

标题：

```markdown
## 快速任务研究

目标：在规划前快速摸清 ${DESCRIPTION} 的可行实现路径、常见坑点和集成方式。
```

只启动一个聚焦 researcher，不像完整 phase 那样开多路并行：

```
Task(
  prompt="
<research_context>

**Mode:** quick-task
**Task:** ${DESCRIPTION}
**Output:** ${QUICK_DIR}/${quick_id}-RESEARCH.md

<files_to_read>
- .planning/STATE.md
- .planning/PROJECT.md
- ./CLAUDE.md（如果存在）
${DISCUSS_MODE ? '- ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md' : ''}
</files_to_read>

</research_context>

<focus>
这是 quick task，不是完整 phase。研究只需要聚焦这些点：
1. 当前任务最合适的库 / 模式
2. 常见坑点与规避方式
3. 与现有代码库的集成点
4. 开始规划前必须知道的约束或 gotcha

不要做大而全的综述，控制在 1-2 页可执行结论。
</focus>

<output>
写入：${QUICK_DIR}/${quick_id}-RESEARCH.md
可以使用标准 research 格式，但只保留相关区块。
返回：## RESEARCH COMPLETE with file path
</output>
",
  subagent_type="gsd-phase-researcher",
  model="{planner_model}",
  description="Research: ${DESCRIPTION}"
)
```

researcher 返回后：
1. 确认 `${QUICK_DIR}/${quick_id}-RESEARCH.md` 存在
2. 向用户报告：`研究完成：${QUICK_DIR}/${quick_id}-RESEARCH.md`

如果文件不存在：
- 给出 warning
- 继续进入规划
- 提示：`研究 agent 没有产出文件，继续按无研究输入进行规划`

---

**步骤 5：拉起 planner（`quick` 模式）**

如果 `$FULL_MODE=true`，使用 `quick-full`。
否则使用标准 `quick`。

```
Task(
  prompt="
<planning_context>

**Mode:** ${FULL_MODE ? 'quick-full' : 'quick'}
**Directory:** ${QUICK_DIR}
**Description:** ${DESCRIPTION}

<files_to_read>
- .planning/STATE.md
- ./CLAUDE.md（如果存在）
${DISCUSS_MODE ? '- ' + QUICK_DIR + '/' + quick_id + '-CONTEXT.md' : ''}
${RESEARCH_MODE ? '- ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md' : ''}
</files_to_read>

**Project skills:** 如果存在 .claude/skills/ 或 .agents/skills/，读取各自 SKILL.md，并让规划遵守项目技能规则。

</planning_context>

<constraints>
- 生成一个 SINGLE plan，包含 1-3 个聚焦任务
- quick task 必须保持原子、边界清晰、可独立完成
${RESEARCH_MODE ? '- 研究结果已提供：用它指导库与模式选择' : '- 没有研究阶段输入'}
${FULL_MODE ? '- 目标上下文占用约 40%，方便后续验证' : '- 目标上下文占用约 30%，保持简洁'}
${FULL_MODE ? '- 必须生成 `must_haves`（truths / artifacts / key_links）' : ''}
${FULL_MODE ? '- 每个 task 必须带 `files` / `action` / `verify` / `done`' : ''}
</constraints>

<output>
写入：${QUICK_DIR}/${quick_id}-PLAN.md
返回：## PLANNING COMPLETE with plan path
</output>
",
  subagent_type="gsd-planner",
  model="{planner_model}",
  description="Quick plan: ${DESCRIPTION}"
)
```

planner 返回后：
1. 确认 `${QUICK_DIR}/${quick_id}-PLAN.md` 存在
2. 向用户报告：`计划已创建：${QUICK_DIR}/${quick_id}-PLAN.md`

如果没生成计划文件：
- 直接报错：`Planner failed to create ${quick_id}-PLAN.md`

---

**步骤 5.5：计划检查循环（仅在 `$FULL_MODE=true` 时执行）**

如果不是 `--full`，整步跳过。

先向用户说明：

```markdown
## 计划检查

当前为完整模式，会先检查 quick plan 的完备性，再决定是否执行。
```

checker prompt：

```markdown
<verification_context>
**Mode:** quick-full
**Task Description:** ${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md
</files_to_read>

**Scope:** 这是 quick task，不是完整 phase。跳过需要 ROADMAP 阶段目标的检查。
</verification_context>

<check_dimensions>
- 需求覆盖：计划是否覆盖任务描述
- 任务完整性：是否包含 files / action / verify / done
- Key links：引用的文件是否真实存在
- 规模合理性：对 quick task 来说是否仍是 1-3 个任务
- must_haves 推导：是否能回溯到任务描述

Skip: cross-plan deps、ROADMAP alignment
${DISCUSS_MODE ? '- Context compliance：计划是否遵守 CONTEXT.md 中锁定的决策' : '- Skip: context compliance（无 CONTEXT.md）'}
</check_dimensions>

<expected_output>
- ## VERIFICATION PASSED
- ## ISSUES FOUND
</expected_output>
```

```
Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  description="Check quick plan: ${DESCRIPTION}"
)
```

处理 checker 返回：

- `## VERIFICATION PASSED`
  - 说明计划已通过检查
- 进入步骤 6

- `## ISSUES FOUND`
  - 展示 issue 列表
  - 如果还没达到 2 轮上限，就发回 planner 做修订

**修订循环最多 2 轮：**

```markdown
<revision_context>
**Mode:** quick-full (revision)

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md
</files_to_read>

**Checker issues:** ${structured_issues_from_checker}

</revision_context>

<instructions>
只做定向修订，不要整份重做。
除非 checker 提出的是结构性根本问题，否则禁止完全重规划。
返回你改了什么。
</instructions>
```

如果 2 轮后仍没通过：
- 向用户展示剩余问题
- 询问：
  - `强行继续`
  - `中止 quick task`

---

**步骤 6：拉起 executor**

```
Task(
  prompt="
执行 quick task ${quick_id}。

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md
- .planning/STATE.md
- ./CLAUDE.md（如果存在）
- .claude/skills/ 或 .agents/skills/（如果存在，读取每个 SKILL.md）
</files_to_read>

<constraints>
- 执行计划中的全部任务
- 每个任务都做原子提交
- 在 ${QUICK_DIR}/${quick_id}-SUMMARY.md 生成总结
- 不要更新 ROADMAP.md（quick task 独立于阶段主线）
</constraints>
",
  subagent_type="gsd-executor",
  model="{executor_model}",
  description="Execute: ${DESCRIPTION}"
)
```

executor 返回后：
1. 确认 `${QUICK_DIR}/${quick_id}-SUMMARY.md` 存在
2. 从输出中提取 commit hash
3. 向用户报告完成状态

**已知 Claude Code 误报：**
如果 executor 报错为 `classifyHandoffIfNeeded is not defined`，先不要直接判定失败。检查：
- `SUMMARY.md` 是否存在
- git log 里是否有预期提交

如果两者都在，就按成功处理。

如果 `SUMMARY.md` 不存在：
- 报错：`Executor failed to create ${quick_id}-SUMMARY.md`

注：quick task 理论上也可能拆成多 plan，但极少见。如果真的出现多 plan，参考 `execute-phase` 的 wave 模式处理。

---

**步骤 6.5：结果验证（仅在 `$FULL_MODE=true` 时执行）**

如果没开 `--full`，整步跳过。

向用户提示：

```markdown
## 结果验证

当前为完整模式，将对 quick task 的 must_haves 做结果回推验证。
```

```
Task(
  prompt="Verify quick task goal achievement.
Task directory: ${QUICK_DIR}
Task goal: ${DESCRIPTION}

<files_to_read>
- ${QUICK_DIR}/${quick_id}-PLAN.md
</files_to_read>

Check must_haves against actual codebase. Create VERIFICATION.md at ${QUICK_DIR}/${quick_id}-VERIFICATION.md.",
  subagent_type="gsd-verifier",
  model="{verifier_model}",
  description="Verify: ${DESCRIPTION}"
)
```

读取状态：

```bash
grep "^status:" "${QUICK_DIR}/${quick_id}-VERIFICATION.md" | cut -d: -f2 | tr -d ' '
```

把结果写入 `$VERIFICATION_STATUS`：

| Status | 动作 |
|--------|------|
| `passed` | 记为 `Verified`，继续步骤 7 |
| `human_needed` | 展示人工验证项，记为 `Needs Review`，继续 |
| `gaps_found` | 展示缺口摘要，询问“重新执行修复”还是“按现状接受”，记为 `Gaps` |

---

**步骤 7：更新 `STATE.md`**

把这条 quick task 追加到 `STATE.md` 中的 quick 记录表。

**7a. 检查是否存在 `Quick Tasks Completed` 区块**

读取 `STATE.md`，查找字面量：
`### Quick Tasks Completed`

**7b. 如果不存在，则创建**

插入到 `### Blockers/Concerns` 后面。

如果是 `--full`：

```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
```

如果不是 `--full`：

```markdown
### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
```

**注意：**
- 如果表已经存在，优先沿用原表列结构
- 如果以前项目里 quick 表没有 `Status` 列，而现在第一次使用 `--full`，就把表头升级为带 `Status`
- 旧记录的 `Status` 列可留空，不必回填

**7c. 追加新行**

如果表带 `Status` 列：

```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | ${VERIFICATION_STATUS} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

如果表不带 `Status` 列：

```markdown
| ${quick_id} | ${DESCRIPTION} | ${date} | ${commit_hash} | [${quick_id}-${slug}](./quick/${quick_id}-${slug}/) |
```

**7d. 更新 `Last activity`**

```
Last activity: ${date} - Completed quick task ${quick_id}: ${DESCRIPTION}
```

用编辑工具原子地写入这些变化。

---

**步骤 8：最终提交并结束**

整理要提交的 quick task 产物：
- `${QUICK_DIR}/${quick_id}-PLAN.md`
- `${QUICK_DIR}/${quick_id}-SUMMARY.md`
- `.planning/STATE.md`
- 如果有 discuss 结果：`${QUICK_DIR}/${quick_id}-CONTEXT.md`
- 如果有 research 结果：`${QUICK_DIR}/${quick_id}-RESEARCH.md`
- 如果是 full mode 且有验证：`${QUICK_DIR}/${quick_id}-VERIFICATION.md`

执行：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(quick-${quick_id}): ${DESCRIPTION}" --files ${file_list}
```

然后读取最终 hash：

```bash
commit_hash=$(git rev-parse --short HEAD)
```

**如果是 `$FULL_MODE=true`：**

```markdown
---

GSD > 快速任务完成（完整模式）

Quick Task ${quick_id}: ${DESCRIPTION}

${RESEARCH_MODE ? 'Research: ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md' : ''}
Summary: ${QUICK_DIR}/${quick_id}-SUMMARY.md
Verification: ${QUICK_DIR}/${quick_id}-VERIFICATION.md (${VERIFICATION_STATUS})
Commit: ${commit_hash}

---

下一项任务：/gsd:quick
```

**如果不是 full mode：**

```markdown
---

GSD > 快速任务完成

Quick Task ${quick_id}: ${DESCRIPTION}

${RESEARCH_MODE ? 'Research: ' + QUICK_DIR + '/' + quick_id + '-RESEARCH.md' : ''}
Summary: ${QUICK_DIR}/${quick_id}-SUMMARY.md
Commit: ${commit_hash}

---

下一项任务：/gsd:quick
```

</process>

<success_criteria>
- [ ] `ROADMAP.md` 存在且 quick mode 初始化通过
- [ ] 用户提供了 quick task 描述
- [ ] `--full` / `--discuss` / `--research` 参数正确解析
- [ ] 已生成 slug 与 quick ID
- [ ] 已在 `.planning/quick/YYMMDD-xxx-slug/` 创建目录
- [ ] `--discuss` 模式下已生成 `${quick_id}-CONTEXT.md`
- [ ] `--research` 模式下已生成 `${quick_id}-RESEARCH.md`
- [ ] 已生成 `${quick_id}-PLAN.md`
- [ ] `--full` 模式下已经过 plan-checker，且修订循环不超过 2 次
- [ ] 已生成 `${quick_id}-SUMMARY.md`
- [ ] `--full` 模式下已生成 `${quick_id}-VERIFICATION.md`
- [ ] `STATE.md` 的 `Quick Tasks Completed` 表已追加记录
- [ ] quick task 相关产物已提交
</success_criteria>
