<purpose>
通过“目标回推”方式验证阶段目标是否真的达成。重点检查代码库是否兑现了该阶段承诺的结果，而不是只看任务是否勾完。

这个 workflow 由 `execute-phase.md` 拉起的验证子 agent 执行。
</purpose>

<core_principle>
**任务完成 ≠ 目标达成**

例如一个“创建聊天组件”的任务，即使只是做了占位组件，也可能被标记完成；但阶段目标“聊天界面可用”其实并没有达成。

目标回推验证的思路：
1. 如果目标达成，哪些事实必须为真？
2. 为了让这些事实成立，哪些产物必须存在？
3. 为了让这些产物真正工作，哪些连接必须接通？

然后逐层对照真实代码库验证。
</core_principle>

<required_reading>
@~/.claude/get-shit-done/references/verification-patterns.md
@~/.claude/get-shit-done/templates/verification-report.md
</required_reading>

<process>

<step name="load_context" priority="first">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 中提取：`phase_dir`、`phase_number`、`phase_name`、`has_plans`、`plan_count`。

然后加载阶段详情，并列出 plans / summaries：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${phase_number}"
grep -E "^| ${phase_number}" .planning/REQUIREMENTS.md 2>/dev/null
ls "$phase_dir"/*-SUMMARY.md "$phase_dir"/*-PLAN.md 2>/dev/null
```

从 `ROADMAP.md` 中提取**阶段目标**（要验证的结果，而不是任务列表），如果存在 `REQUIREMENTS.md`，也提取对应需求。
</step>

<step name="establish_must_haves">
**方案 A：从 PLAN frontmatter 中读取 must_haves**

对每个 PLAN，用 gsd-tools 提取 `must_haves`：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  MUST_HAVES=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" frontmatter get "$plan" --field must_haves)
  echo "=== $plan ===" && echo "$MUST_HAVES"
done
```

返回 JSON：`{ truths: [...], artifacts: [...], key_links: [...] }`

把该阶段下所有 PLAN 的 `must_haves` 汇总，用于阶段级验证。

**方案 B：使用 ROADMAP.md 中的 Success Criteria**

如果 frontmatter 中没有 `must_haves`（返回报错或为空），就检查 Success Criteria：

```bash
PHASE_DATA=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${phase_number}" --raw)
```

解析 JSON 中的 `success_criteria` 数组。如果非空：
1. 将每条 Success Criterion 直接作为一个 **truth**（它们本来就是可观察、可测试的行为）
2. 推导 **artifacts**（支撑这些 truth 的具体文件路径）
3. 推导 **key links**（最容易藏 stub 的关键连接）
4. 在继续之前，先把 must-haves 明确下来

`ROADMAP.md` 里的 Success Criteria 是合同级约束；如果它和 PLAN 里的 must_haves 同时存在，以 Success Criteria 为准。

**方案 C：从阶段目标反推（兜底）**

如果 PLAN frontmatter 没有 `must_haves`，同时 ROADMAP 里也没有 Success Criteria：
1. 先陈述 ROADMAP 里的阶段目标
2. 推导 **truths**（3-7 条可观察、可测试的行为）
3. 推导 **artifacts**（对应的具体文件路径）
4. 推导 **key links**（关键连接点）
5. 在继续前明确记录这些派生出来的 must-haves
</step>

<step name="verify_truths">
对每条可观察 truth，判断代码库是否真的支持它。

**状态：**
- `VERIFIED`：所有支撑该 truth 的产物都通过
- `FAILED`：存在缺失 / stub / 未接线
- `UNCERTAIN`：无法可靠自动判断，需要人工验证

对每条 truth 的流程：
识别支撑产物 -> 检查产物状态 -> 检查接线状态 -> 给出 truth 状态。

**示例：**
truth “用户能看到已有消息” 依赖 `Chat.tsx`（负责渲染）、`/api/chat` 的 GET（提供数据）、`Message` model（定义结构）。
如果 `Chat.tsx` 只是 stub，或者 API 返回硬编码空数组 -> `FAILED`。
如果这些都真实存在、实现完整、且已经接好 -> `VERIFIED`。
</step>

<step name="verify_artifacts">
对每个 PLAN，用 gsd-tools 验证 artifacts：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  ARTIFACT_RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" verify artifacts "$plan")
  echo "=== $plan ===" && echo "$ARTIFACT_RESULT"
done
```

解析 JSON：`{ all_passed, passed, total, artifacts: [{path, exists, issues, passed}] }`

**根据结果映射 artifact 状态：**
- `exists=false` -> `MISSING`
- `issues` 非空 -> `STUB`（重点看 `"Only N lines"` 或 `"Missing pattern"`）
- `passed=true` -> `VERIFIED`（通过了 Level 1-2）

**Level 3：Wired（对通过 Level 1-2 的 artifact 做手工接线检查）**
```bash
grep -r "import.*$artifact_name" src/ --include="*.ts" --include="*.tsx"  # IMPORTED
grep -r "$artifact_name" src/ --include="*.ts" --include="*.tsx" | grep -v "import"  # USED
```

`WIRED` = 被导入且被实际使用。
`ORPHANED` = 文件存在，但没被导入 / 使用。

| Exists | Substantive | Wired | Status |
|--------|-------------|-------|--------|
| yes | yes | yes | VERIFIED |
| yes | yes | no | ORPHANED |
| yes | no | - | STUB |
| no | - | - | MISSING |

**导出级抽查（WARNING 级别）：**

对已经通过 Level 3 的 artifact，抽查其导出项：
- 提取关键导出符号（函数、常量、类；跳过 types / interfaces）
- 对每个导出项，grep 它是否在定义文件之外被使用
- 如果导出项在外部没有任何调用点，则标记为“exported but unused”

这类检查能发现死存储，例如某个 `setPlan()` 存在于已接线文件中，但实际上从未被调用。
报告为 `WARNING`，因为它通常意味着跨计划接线不完整，或计划迭代后遗留了死代码。
</step>

<step name="verify_wiring">
对每个 PLAN，用 gsd-tools 验证 key links：

```bash
for plan in "$PHASE_DIR"/*-PLAN.md; do
  LINKS_RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" verify key-links "$plan")
  echo "=== $plan ===" && echo "$LINKS_RESULT"
done
```

解析 JSON：`{ all_verified, verified, total, links: [{from, to, via, verified, detail}] }`

**根据结果映射 link 状态：**
- `verified=true` -> `WIRED`
- `verified=false` 且 detail 含 `"not found"` -> `NOT_WIRED`
- `verified=false` 且 detail 含 `"Pattern not found"` -> `PARTIAL`

**兜底模式（当 must_haves 中没有 key_links 时）：**

| Pattern | Check | Status |
|---------|-------|--------|
| Component -> API | 是否调用 fetch / axios 命中 API 路径，且响应有被消费（await / .then / setState） | WIRED / PARTIAL / NOT_WIRED |
| API -> Database | 是否有 Prisma / DB 查询，且结果通过 `res.json()` 返回 | WIRED / PARTIAL / NOT_WIRED |
| Form -> Handler | `onSubmit` 是否接了真实实现（fetch / axios / mutate / dispatch），而不是 console.log / 空函数 | WIRED / STUB / NOT_WIRED |
| State -> Render | `useState` 变量是否出现在 JSX 中 | WIRED / NOT_WIRED |

为每条 key link 记录状态和证据。
</step>

<step name="verify_requirements">
如果存在 `REQUIREMENTS.md`：
```bash
grep -E "Phase ${PHASE_NUM}" .planning/REQUIREMENTS.md 2>/dev/null
```

对每条 requirement：
解析描述 -> 找到对应支撑的 truths / artifacts -> 给出状态：
`SATISFIED` / `BLOCKED` / `NEEDS HUMAN`
</step>

<step name="scan_antipatterns">
从 `SUMMARY.md` 提取本阶段改动过的文件，对每个文件做扫描：

| 模式 | 搜索方式 | 严重性 |
|------|----------|--------|
| TODO/FIXME/XXX/HACK | `grep -n -E "TODO\|FIXME\|XXX\|HACK"` | Warning |
| Placeholder 内容 | `grep -n -iE "placeholder\|coming soon\|will be here"` | Blocker |
| 空返回 | `grep -n -E "return null\|return \{\}\|return \[\]\|=> \{\}"` | Warning |
| 只有 console.log 的函数 | 函数体中只有 `console.log` | Warning |

归类为：`Blocker`（阻止目标达成）/ `Warning`（实现不完整）/ `Info`（值得注意）
</step>

<step name="identify_human_verification">
**始终需要人工验证的内容：**
视觉表现、完整用户流程、实时行为（WebSocket / SSE）、外部服务集成、体感性能、错误提示清晰度。

**不确定时需要人工验证的内容：**
grep 无法稳定追踪的复杂接线、依赖动态状态的行为、边界场景。

每条都要写成：测试名称 -> 如何操作 -> 预期结果 -> 为什么不能自动验证。
</step>

<step name="determine_status">
**passed：**
所有 truths 都是 `VERIFIED`，所有 artifacts 通过 1-3 级检查，所有 key links 都是 `WIRED`，且不存在 blocker 级反模式。

**gaps_found：**
任何 truth 为 `FAILED`，任何 artifact 为 `MISSING` / `STUB`，任何 key link 为 `NOT_WIRED`，或发现 blocker。

**human_needed：**
自动化检查全部通过，但还有人工验证项。

**得分：**
`verified_truths / total_truths`
</step>

<step name="generate_fix_plans">
如果 `gaps_found`：

1. **把相关缺口聚类：**
API 是 stub + 组件未接线 -> “打通前后端”
多个关键实现缺失 -> “补完核心实现”
只差接线 -> “连接现有组件”

2. **为每个缺口簇生成一个修复计划：**
包含 objective、2-3 个任务（每个任务写明 files / action / verify），以及 re-verify 步骤。
每个计划只聚焦一个问题。

3. **按依赖顺序排序：**
先修缺失 -> 再修 stub -> 再修接线 -> 最后复验。
</step>

<step name="create_report">
```bash
REPORT_PATH="$PHASE_DIR/${PHASE_NUM}-VERIFICATION.md"
```

填充模板中的以下部分：
frontmatter（phase / timestamp / status / score）、goal achievement、artifact table、wiring table、requirements coverage、anti-patterns、human verification、gaps summary、fix plans（如果 `gaps_found`）、metadata。

完整模板见 `~/.claude/get-shit-done/templates/verification-report.md`。
</step>

<step name="return_to_orchestrator">
返回：
- 状态：`passed` | `gaps_found` | `human_needed`
- 得分：`N/M must-haves`
- 报告路径

如果 `gaps_found`：列出缺口摘要和推荐修复计划名。
如果 `human_needed`：列出需要人工测试的项目。

orchestrator 的路由：
- `passed` -> `update_roadmap`
- `gaps_found` -> 创建并执行修复，再重新验证
- `human_needed` -> 向用户展示并等待人工验证
</step>

</process>

<success_criteria>
- [ ] 已建立 must-haves（来自 frontmatter 或推导）
- [ ] 已为所有 truths 给出状态与证据
- [ ] 已对所有 artifacts 完成三层检查
- [ ] 已验证所有 key links
- [ ] 已评估 requirements coverage（如适用）
- [ ] 已扫描并归类 anti-patterns
- [ ] 已识别人工验证项
- [ ] 已得出整体状态
- [ ] 若存在 `gaps_found`，已生成 fix plans
- [ ] 已创建完整的 `VERIFICATION.md`
- [ ] 已把结果返回给 orchestrator
</success_criteria>
