<planning_config>

`.planning/` 目录行为的配置选项说明。

<config_schema>
```json
"planning": {
  "commit_docs": true,
  "search_gitignored": false
},
"git": {
  "branching_strategy": "none",
  "phase_branch_template": "gsd/phase-{phase}-{slug}",
  "milestone_branch_template": "gsd/{milestone}-{slug}"
}
```

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `commit_docs` | `true` | 是否把规划产物提交到 git |
| `search_gitignored` | `false` | 在宽范围 `rg` 搜索时追加 `--no-ignore` |
| `git.branching_strategy` | `"none"` | Git 分支策略：`"none"`、`"phase"` 或 `"milestone"` |
| `git.phase_branch_template` | `"gsd/phase-{phase}-{slug}"` | `phase` 策略使用的分支模板 |
| `git.milestone_branch_template` | `"gsd/{milestone}-{slug}"` | `milestone` 策略使用的分支模板 |
</config_schema>

<commit_docs_behavior>

**当 `commit_docs: true`（默认）时：**
- 规划文件正常提交
- `SUMMARY.md`、`STATE.md`、`ROADMAP.md` 会被 git 跟踪
- 规划决策的完整历史会被保留

**当 `commit_docs: false` 时：**
- 跳过针对 `.planning/` 文件的所有 `git add` / `git commit`
- 用户必须把 `.planning/` 加入 `.gitignore`
- 适用于：OSS 贡献、客户项目、希望规划内容保持私有

**使用 `gsd-tools.cjs`（推荐）：**

```bash
# 提交时自动检查 commit_docs 和 gitignore：
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: update state" --files .planning/STATE.md

# 通过 state load 加载配置（返回 JSON）：
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
# JSON 输出中可直接读取 commit_docs

# 或使用包含 commit_docs 的 init 命令：
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "1")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
# 所有 init 命令输出都包含 commit_docs
```

**自动检测：** 如果 `.planning/` 已被 gitignore，`commit_docs` 会自动视为 `false`，不受 `config.json` 配置影响。这样可以避免用户把 `.planning/` 放进 `.gitignore` 后触发 git 报错。

**通过 CLI 提交（自动处理检查）：**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: update state" --files .planning/STATE.md
```

CLI 会在内部检查 `commit_docs` 配置与 gitignore 状态，无需手写条件分支。

</commit_docs_behavior>

<search_behavior>

**当 `search_gitignored: false`（默认）时：**
- 使用标准 `rg` 行为（遵守 `.gitignore`）
- 显式路径搜索依然有效：`rg "pattern" .planning/` 能找到文件
- 宽范围搜索会跳过 gitignored 文件：`rg "pattern"` 会跳过 `.planning/`

**当 `search_gitignored: true` 时：**
- 对需要覆盖 `.planning/` 的宽范围 `rg` 搜索追加 `--no-ignore`
- 只有在搜索整个仓库且希望命中 `.planning/` 时才需要

**注意：** 大多数 GSD 操作都使用直接读文件或显式路径，因此不受 gitignore 状态影响。

</search_behavior>

<setup_uncommitted_mode>

要使用未提交模式：

1. **设置配置：**
   ```json
   "planning": {
     "commit_docs": false,
     "search_gitignored": true
   }
   ```

2. **加入 `.gitignore`：**
   ```
   .planning/
   ```

3. **若已有被跟踪文件：** 如果 `.planning/` 之前已经被 git 跟踪：
   ```bash
   git rm -r --cached .planning/
   git commit -m "chore: stop tracking planning docs"
   ```

4. **分支合并：** 当使用 `branching_strategy: phase` 或 `milestone` 时，如果 `commit_docs: false`，`complete-milestone` workflow 会在合并提交前自动把 `.planning/` 文件从 staging 中移除。

</setup_uncommitted_mode>

<branching_strategy_behavior>

**分支策略：**

| 策略 | 何时创建分支 | 分支作用范围 | 合并时机 |
|------|--------------|--------------|----------|
| `none` | 从不 | N/A | N/A |
| `phase` | 在 `execute-phase` 开始时 | 单个阶段 | 阶段结束后由用户合并 |
| `milestone` | 在里程碑第一次 `execute-phase` 时 | 整个里程碑 | 在 `complete-milestone` 时 |

**当 `git.branching_strategy: "none"`（默认）时：**
- 所有工作都提交到当前分支
- 保持标准 GSD 行为

**当 `git.branching_strategy: "phase"` 时：**
- `execute-phase` 会在执行前创建 / 切换到对应分支
- 分支名来自 `phase_branch_template`（例如 `gsd/phase-03-authentication`）
- 该计划中的所有提交都进入该分支
- 阶段完成后由用户手动合并
- `complete-milestone` 会提供合并所有 phase 分支的选项

**当 `git.branching_strategy: "milestone"` 时：**
- 里程碑中第一次 `execute-phase` 会创建里程碑分支
- 分支名来自 `milestone_branch_template`（例如 `gsd/v1.0-mvp`）
- 该里程碑下所有阶段都提交到同一分支
- `complete-milestone` 会提供把里程碑分支合并回主分支的选项

**模板变量：**

| 变量 | 可用位置 | 说明 |
|------|----------|------|
| `{phase}` | `phase_branch_template` | 左侧补零的阶段号（例如 `"03"`） |
| `{slug}` | 两者都可用 | 小写、使用连字符的名称 |
| `{milestone}` | `milestone_branch_template` | 里程碑版本号（例如 `"v1.0"`） |

**检查配置：**

使用 `init execute-phase`，它会返回完整 JSON 配置：
```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init execute-phase "1")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
# JSON 输出包含：branching_strategy、phase_branch_template、milestone_branch_template
```

或者使用 `state load` 读取配置值：
```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" state load)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
# 从 JSON 中解析 branching_strategy、phase_branch_template、milestone_branch_template
```

**分支创建：**

```bash
# phase 策略
if [ "$BRANCHING_STRATEGY" = "phase" ]; then
  PHASE_SLUG=$(echo "$PHASE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  BRANCH_NAME=$(echo "$PHASE_BRANCH_TEMPLATE" | sed "s/{phase}/$PADDED_PHASE/g" | sed "s/{slug}/$PHASE_SLUG/g")
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi

# milestone 策略
if [ "$BRANCHING_STRATEGY" = "milestone" ]; then
  MILESTONE_SLUG=$(echo "$MILESTONE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
  BRANCH_NAME=$(echo "$MILESTONE_BRANCH_TEMPLATE" | sed "s/{milestone}/$MILESTONE_VERSION/g" | sed "s/{slug}/$MILESTONE_SLUG/g")
  git checkout -b "$BRANCH_NAME" 2>/dev/null || git checkout "$BRANCH_NAME"
fi
```

**在 `complete-milestone` 时的合并选项：**

| 选项 | Git 命令 | 结果 |
|------|----------|------|
| Squash merge（推荐） | `git merge --squash` | 每个分支压成一个干净提交 |
| 保留历史合并 | `git merge --no-ff` | 保留所有独立提交历史 |
| 不合并直接删除 | `git branch -D` | 丢弃该分支工作 |
| 保留分支 | （无） | 后续手动处理 |

推荐使用 Squash merge，这样主分支历史更干净，同时在分支未删除前仍保留完整开发历史。

**适用场景：**

| 策略 | 最适合 |
|------|--------|
| `none` | 单人开发、简单项目 |
| `phase` | 按阶段做 code review、细粒度回滚、团队协作 |
| `milestone` | Release 分支、staging 环境、按版本建 PR |

</branching_strategy_behavior>

</planning_config>
