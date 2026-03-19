<purpose>
并行调度 debug agent，调查 UAT 中记录的缺口并定位根因。

当 UAT 发现问题后，为每个 gap 启动一个 debug agent。每个 agent 会基于 UAT 已记录的症状继续排查，最终汇总根因、把诊断结果写回 `UAT.md`，然后将结果交给 `plan-phase --gaps` 生成修复计划。

orchestrator 保持轻量：只负责解析 gap、拉起 agent、收集结果、回写 UAT。
</purpose>

<paths>
DEBUG_DIR=.planning/debug

调试会话文件统一写入 `.planning/debug/`（隐藏目录）。
</paths>

<core_principle>
**先诊断，再规划修复。**

UAT 只能告诉我们“哪里坏了”（症状），debug agent 负责回答“为什么会坏”（根因）。后续 `plan-phase --gaps` 应基于真实根因生成修复方案，而不是猜。

没有诊断时：
`评论提交后不刷新` -> 猜一个修复 -> 可能修错

有诊断时：
`评论提交后不刷新` -> `useEffect 缺少依赖` -> 可以精确修复
</core_principle>

<process>

<step name="parse_gaps">
**从 UAT.md 中提取 gap：**

读取 `## Gaps（缺口）` 区块中的 YAML：
```yaml
- truth: "Comment appears immediately after submission"
  status: failed
  reason: "User reported: works but doesn't show until I refresh the page"
  severity: major
  test: 2
  artifacts: []
  missing: []
```

同时读取对应的 `## Tests（测试项）` 区块，补齐测试上下文。

构造 gap 列表：
```
gaps = [
  {truth: "Comment appears immediately...", severity: "major", test_num: 2, reason: "..."},
  {truth: "Reply button positioned correctly...", severity: "minor", test_num: 5, reason: "..."},
  ...
]
```
</step>

<step name="report_plan">
**向用户说明诊断计划：**

```
## 正在诊断缺口

将并行启动 debug agents 调查根因：

| 缺口（行为真相） | 严重级别 |
|------------------|------------|
| Comment appears immediately after submission | major |
| Reply button positioned correctly | minor |
| Delete removes comment | blocker |

每个 agent 都会：
1. 生成已填入症状的 DEBUG-{slug}.md
2. 自主排查（读代码、提假设、做验证）
3. 返回根因

所有 gap 会并行调查。
```
</step>

<step name="spawn_agents">
**并行启动 debug agents：**

对每个 gap，填充 debug-subagent-prompt 模板并启动：

```
Task(
  prompt=filled_debug_subagent_prompt + "\n\n<files_to_read>\n- {phase_dir}/{phase_num}-UAT.md\n- .planning/STATE.md\n</files_to_read>",
  subagent_type="gsd-debugger",
  description="Debug: {truth_short}"
)
```

**所有 agent 必须在同一轮消息中一起启动**，以便并行执行。

模板占位符：
- `{truth}`：失败的期望行为
- `{expected}`：来自 UAT 测试中的预期
- `{actual}`：`reason` 字段中的原始用户描述
- `{errors}`：UAT 中记录的错误信息（没有则填 `None reported`）
- `{reproduction}`：`Test {test_num} in UAT`
- `{timeline}`：`Discovered during UAT`
- `{goal}`：`find_root_cause_only`（UAT 流程只诊断，不修）
- `{slug}`：由 truth 生成
</step>

<step name="collect_results">
**收集各 agent 返回的根因：**

每个 agent 返回格式：
```
## ROOT CAUSE FOUND（已找到根因）

**Debug Session:** ${DEBUG_DIR}/{slug}.md

**Root Cause:** {specific cause with evidence}

**Evidence Summary:**
- {key finding 1}
- {key finding 2}
- {key finding 3}

**涉及文件：**
- {file1}: {what's wrong}
- {file2}: {related issue}

**建议修复方向：** {brief hint for plan-phase --gaps}
```

需要从返回中提取：
- `root_cause`：诊断出的根因
- `files`：涉及文件
- `debug_path`：调试会话路径
- `suggested_fix`：为 gap 修复计划提供方向提示

如果 agent 返回 `## INVESTIGATION INCONCLUSIVE（调查结论不足）`：
- `root_cause` 记为 `Investigation inconclusive - manual review needed`
- 标明需要人工继续排查的点
- 保留 agent 给出的剩余可能性
</step>

<step name="update_uat">
**将诊断结果写回 UAT.md：**

针对 `## Gaps（缺口）` 中的每个 gap，补充 `artifacts` 与 `missing` 等字段：

```yaml
- truth: "Comment appears immediately after submission"
  status: failed
  reason: "User reported: works but doesn't show until I refresh the page"
  severity: major
  test: 2
  root_cause: "useEffect in CommentList.tsx missing commentCount dependency"
  artifacts:
    - path: "src/components/CommentList.tsx"
      issue: "useEffect missing dependency"
  missing:
    - "Add commentCount to useEffect dependency array"
    - "Trigger re-render when new comment added"
  debug_session: .planning/debug/comment-not-refreshing.md
```

frontmatter 中的 `status` 更新为 `diagnosed`。

提交更新后的 `UAT.md`：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs({phase_num}): add root causes from diagnosis" --files ".planning/phases/XX-name/{phase_num}-UAT.md"
```
</step>

<step name="report_results">
**报告诊断结果并继续后续流程：**

向用户展示：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ▶ 诊断完成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 缺口（行为真相） | Root Cause（根因） | Files |
|------------------|--------------------|-------|
| Comment appears immediately | useEffect missing dependency | CommentList.tsx |
| Reply button positioned correctly | CSS flex order incorrect | ReplyButton.tsx |
| Delete removes comment | API missing auth header | api/comments.ts |

调试会话目录：${DEBUG_DIR}/

继续生成修复计划...
```

然后返回给 `verify-work` orchestrator，由它自动进入后续规划。
**不要**额外给手动下一步建议，`verify-work` 会继续接管。
</step>

</process>

<context_efficiency>
各 agent 会直接拿到 UAT 中已经记录好的症状，不需要重复收集现象。
各 agent 只负责诊断；真正的修复由 `plan-phase --gaps` 处理。
</context_efficiency>

<failure_handling>
**如果某个 agent 找不到根因：**
- 将该 gap 标记为 `needs manual review`
- 其他 gap 继续处理
- 在最终结果中明确说明诊断未完成

**如果 agent 超时：**
- 检查 `DEBUG-{slug}.md` 是否已有部分结果
- 必要时可用 `/gsd:debug` 续跑

**如果所有 agent 都失败：**
- 说明可能存在系统性问题（权限、git、环境等）
- 报告需要人工介入
- 最差情况下退回 `plan-phase --gaps`，在没有根因的前提下做较粗糙的修复计划
</failure_handling>

<success_criteria>
- [ ] 已从 `UAT.md` 解析 gap
- [ ] 已并行启动 debug agents
- [ ] 已收集各 agent 的根因结果
- [ ] 已把 `artifacts` / `missing` 等诊断信息写回 `UAT.md`
- [ ] 调试会话已保存到 `${DEBUG_DIR}/`
- [ ] 已交还给 `verify-work` 继续自动规划
</success_criteria>
