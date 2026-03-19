<purpose>
审计一个已完成阶段在 Nyquist 验证上的缺口，补生成缺失测试，并更新 `VALIDATION.md`。
</purpose>

<required_reading>
@~/.claude/get-shit-done/references/ops-output.md
</required_reading>

<process>

## 0. 初始化

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析：`phase_dir`、`phase_number`、`phase_name`、`phase_slug`、`padded_phase`。

```bash
AUDITOR_MODEL=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" resolve-model gsd-nyquist-auditor --raw)
NYQUIST_CFG=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config get workflow.nyquist_validation --raw)
```

如果 `NYQUIST_CFG` 为 `false`：直接退出，并提示 `Nyquist validation 已关闭。可通过 /gsd:settings 开启。`

显示 banner：`GSD > 验证阶段 {N}: {name}`

## 1. 检测输入状态

```bash
VALIDATION_FILE=$(ls "${PHASE_DIR}"/*-VALIDATION.md 2>/dev/null | head -1)
SUMMARY_FILES=$(ls "${PHASE_DIR}"/*-SUMMARY.md 2>/dev/null)
```

- **状态 A**：`VALIDATION_FILE` 非空 -> 审计已有验证文件
- **状态 B**：`VALIDATION_FILE` 为空，`SUMMARY_FILES` 非空 -> 从现有产物重建
- **状态 C**：`SUMMARY_FILES` 为空 -> 退出，并提示 `阶段 {N} 尚未执行。请先运行 /gsd:execute-phase {N}。`

## 2. 发现阶段

### 2a. 读取阶段产物

读取所有 `PLAN` 和 `SUMMARY` 文件，提取：任务列表、需求 ID、改动过的关键文件、verify 区块。

### 2b. 构建需求到任务的映射

每个任务记录为：`{ task_id, plan_id, wave, requirement_ids, has_automated_command }`

### 2c. 检测测试基础设施

状态 A：从已有 `VALIDATION.md` 的 Test Infrastructure 表格中解析。
状态 B：扫描文件系统：

```bash
find . -name "pytest.ini" -o -name "jest.config.*" -o -name "vitest.config.*" -o -name "pyproject.toml" 2>/dev/null | head -10
find . \( -name "*.test.*" -o -name "*.spec.*" -o -name "test_*" \) -not -path "*/node_modules/*" 2>/dev/null | head -40
```

### 2d. 交叉比对

将每个 requirement 与现有测试按文件名、import、测试描述做匹配，记录：requirement -> test_file -> status。

## 3. 缺口分析

为每条 requirement 分类：

| 状态 | 判定标准 |
|------|----------|
| COVERED | 测试存在、覆盖行为、可绿色运行 |
| PARTIAL | 测试存在，但失败或不完整 |
| MISSING | 没找到测试 |

构建：`{ task_id, requirement, gap_type, suggested_test_path, suggested_command }`

如果没有任何 gap -> 直接跳到步骤 6，并设置 `nyquist_compliant: true`。

## 4. 向用户展示缺口处理计划

调用 AskUserQuestion，展示 gap 表格和选项：
1. `"全部修复"` -> 步骤 5
2. `"跳过，标记为 manual-only"` -> 加入 Manual-Only，转步骤 6
3. `"取消"` -> 退出

## 5. 拉起 gsd-nyquist-auditor

```
Task(
  prompt="先读取 ~/.claude/agents/gsd-nyquist-auditor.md 中的执行说明。\n\n" +
    "<files_to_read>{PLAN, SUMMARY, impl files, VALIDATION.md}</files_to_read>" +
    "<gaps>{gap list}</gaps>" +
    "<test_infrastructure>{framework, config, commands}</test_infrastructure>" +
    "<constraints>Never modify impl files. Max 3 debug iterations. Escalate impl bugs.</constraints>",
  subagent_type="gsd-nyquist-auditor",
  model="{AUDITOR_MODEL}",
  description="Fill validation gaps for Phase {N}"
)
```

处理返回结果：
- `## GAPS FILLED` -> 记录新增测试与映射更新，转步骤 6
- `## PARTIAL` -> 记录已解决项，把其余升级到 manual-only，转步骤 6
- `## ESCALATE` -> 全部移到 manual-only，转步骤 6

## 6. 生成或更新 VALIDATION.md

**状态 B（创建）：**
1. 读取模板 `~/.claude/get-shit-done/templates/VALIDATION.md`
2. 填入：frontmatter、Test Infrastructure、Per-Task Map、Manual-Only、Sign-Off
3. 写入 `${PHASE_DIR}/${PADDED_PHASE}-VALIDATION.md`

**状态 A（更新）：**
1. 更新 Per-Task Map 状态，把升级项加到 Manual-Only，更新 frontmatter
2. 追加审计记录：

```markdown
## Validation Audit {date}
| Metric | Count |
|--------|-------|
| Gaps found | {N} |
| Resolved | {M} |
| Escalated | {K} |
```

## 7. 提交

```bash
git add {test_files}
git commit -m "test(phase-${PHASE}): add Nyquist validation tests"

node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(phase-${PHASE}): add/update validation strategy"
```

## 8. 结果与路由

**Compliant：**
```
GSD > 阶段 {N} 已符合 NYQUIST 要求
所有需求都已有自动化验证。
-> 下一步：/gsd:audit-milestone
```

**Partial：**
```
GSD > 阶段 {N} 验证完成（部分）
{M} 条已自动化，{K} 条仍是 manual-only。
-> 重试：/gsd:validate-phase {N}
```

最后提醒用户可执行 `/clear`。

</process>

<success_criteria>
- [ ] 已检查 Nyquist 配置（关闭时正确退出）
- [ ] 已识别输入状态（A/B/C）
- [ ] 状态 C 能干净退出
- [ ] 已读取 PLAN/SUMMARY 并构建 requirement 映射
- [ ] 已识别测试基础设施
- [ ] 已将 gaps 分类为 COVERED/PARTIAL/MISSING
- [ ] 已通过用户关卡展示 gap 表格
- [ ] 已用完整上下文拉起 auditor
- [ ] 已处理三种返回格式
- [ ] 已创建或更新 VALIDATION.md
- [ ] 测试文件已单独提交
- [ ] 已向用户展示结果和下一步路由
</success_criteria>
