<purpose>
通过汇总各阶段验证结果、检查跨阶段集成和需求覆盖，判断一个里程碑是否真正达到 definition of done。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

## 0. 初始化里程碑上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init milestone-op)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

提取：`milestone_version`、`milestone_name`、`phase_count`、`completed_phases`、`commit_docs`。

解析 integration checker 模型：
```bash
integration_checker_model=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-integration-checker --raw)
```

## 1. 确定里程碑范围

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phases list
```

要完成：
- 从参数中解析版本，或从 `ROADMAP.md` 推断当前里程碑
- 找出本里程碑包含的所有阶段目录
- 从 `ROADMAP.md` 提取里程碑 definition of done
- 从 `REQUIREMENTS.md` 提取映射到这个里程碑的需求

## 2. 读取所有阶段验证结果

对每个阶段目录，读取对应的 `VERIFICATION.md`：

```bash
PHASE_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" find-phase 01 --raw)
```

从每份 `VERIFICATION.md` 中提取：
- 状态：`passed` | `gaps_found`
- 关键缺口（属于 blocker）
- 非关键缺口（tech debt / deferred / warning）
- anti-patterns
- requirements coverage

如果某个阶段没有 `VERIFICATION.md`，标记为 `unverified phase`，这属于 blocker。

## 3. 拉起 integration checker

先从 `REQUIREMENTS.md` 的 traceability table 中提取本里程碑的全部 `REQ-ID`，保存为 `MILESTONE_REQ_IDS`。

然后拉起 integration checker，检查：
- 跨阶段 wiring
- 端到端用户流程
- 每条 integration finding 映射到哪些 requirement

## 4. 汇总结果

把以下两类信息汇总在一起：
- 阶段级 gaps / tech debt
- integration checker 返回的接线问题 / 流程问题

## 5. 检查需求覆盖（3 源交叉验证）

必须对每条 requirement 同时交叉比对以下三种来源：

### 5a. REQUIREMENTS.md traceability table

提取：
- requirement ID
- 描述
- 分配到的 phase
- 当前状态
- 勾选状态（`[x]` / `[ ]`）

### 5b. 各阶段 VERIFICATION.md 中的 requirements table

提取：
- Requirement
- Source Plan
- Description
- Status
- Evidence

并映射回具体 `REQ-ID`。

### 5c. 各阶段 SUMMARY.md 的 `requirements-completed`

```bash
for summary in .planning/phases/*-*/*-SUMMARY.md; do
  node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" summary-extract "$summary" --fields requirements_completed | jq -r '.requirements_completed'
done
```

### 5d. 最终状态矩阵

根据三方来源，为每个 `REQ-ID` 判定最终状态：
- `satisfied`
- `partial`
- `unsatisfied`
- `orphaned`

### 5e. FAIL 闸门与孤儿需求检测

**强制规则：** 只要存在任何 `unsatisfied` requirement，里程碑审计状态就必须是 `gaps_found`。

**孤儿需求：** 如果某 requirement 出现在 traceability table 中，但在所有阶段 `VERIFICATION.md` 中都没有出现，则标记为 `orphaned`，并按 `unsatisfied` 对待。

## 5.5. Nyquist 合规发现

如果 `workflow.nyquist_validation` 显式为 `false`，则整段跳过；未设置则默认启用。

```bash
NYQUIST_CONFIG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config get workflow.nyquist_validation --raw 2>/dev/null)
```

对每个阶段检查 `*-VALIDATION.md`，并按以下状态分类：
- `COMPLIANT`
- `PARTIAL`
- `MISSING`

将结果写入 audit YAML 的 `nyquist` 字段。

这里只做发现，不自动调用 `/gsd:validate-phase`。

## 6. 生成 `v{version}-MILESTONE-AUDIT.md`

创建 `.planning/v{version}-v{version}-MILESTONE-AUDIT.md`，其中包含：
- frontmatter：milestone / audited / status / scores / gaps / tech_debt / nyquist
- markdown 正文：requirements、phases、integration、tech debt 等完整表格和摘要

**状态定义：**
- `passed`：所有 requirement 满足，无关键缺口，tech debt 很少
- `gaps_found`：存在 blocker 或 unsatisfied requirement
- `tech_debt`：没有 blocker，但积累了明显技术债

## 7. 展示结果

根据状态直接路由：

**如果 `passed`：**
- 展示 audit passed
- 提示下一步 `/gsd:complete-milestone {version}`

**如果 `gaps_found`：**
- 展示 unsatisfied requirements
- 展示跨阶段问题与 broken flows
- 展示 Nyquist 覆盖情况
- 提示下一步 `/gsd:plan-milestone-gaps`

**如果 `tech_debt`：**
- 展示 tech debt 摘要
- 提供两条路：
  - 直接完成里程碑
  - 先规划 cleanup / gap phases

</process>

<success_criteria>
- [ ] 已识别里程碑范围
- [ ] 已读取所有阶段 `VERIFICATION.md`
- [ ] 已读取各阶段 `SUMMARY.md` 的 `requirements-completed`
- [ ] 已解析 `REQUIREMENTS.md` traceability table
- [ ] 已完成 3 源交叉验证
- [ ] 已检测 orphaned requirements
- [ ] 已汇总 tech debt 与 deferred gaps
- [ ] 已拉起 integration checker
- [ ] 已生成 `v{version}-MILESTONE-AUDIT.md`
- [ ] 已执行 fail gate：存在 unsatisfied requirement 时强制 `gaps_found`
- [ ] 若启用了 Nyquist，已扫描全部阶段的合规状态
- [ ] 已给出可执行的下一步
</success_criteria>
