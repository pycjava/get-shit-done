<purpose>
并行调度多个代码库映射 agent，分析代码库并在 `.planning/codebase/` 下产出结构化文档。

每个 agent 使用独立上下文，只负责一个焦点领域，并且**直接写文档**。orchestrator 只接收确认信息和行数摘要，然后给出总览。

输出：`.planning/codebase/` 目录，包含 7 份结构化代码库现状文档。
</purpose>

<philosophy>
**为什么使用专门的 mapper agent：**
- 每个领域都有独立上下文，避免 token 污染
- agent 直接写文档，不需要把大段分析回传给 orchestrator
- orchestrator 只做汇总，节省上下文
- 可并行执行，更快

**文档质量优先于长度：**
写到足够可作为参考资料为止。优先保留实用示例，尤其是代码模式。

**始终写出真实文件路径：**
这些文档会被 Claude 在后续规划 / 执行时引用，路径必须使用反引号，例如：`src/services/user.ts`。
</philosophy>

<process>

<step name="init_context" priority="first">
加载代码库映射上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init map-codebase)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 中提取：`mapper_model`、`commit_docs`、`codebase_dir`、`existing_maps`、`has_maps`、`codebase_dir_exists`。
</step>

<step name="check_existing">
用 init 上下文中的 `has_maps` 检查 `.planning/codebase/` 是否已存在。

如果 `codebase_dir_exists` 为 true：
```bash
ls -la .planning/codebase/
```

**如果已存在：**

```
.planning/codebase/ 已存在，包含以下文档：
[List files found]

接下来怎么做？
1. Refresh - 删除旧文档并重新映射
2. Update - 保留现有文档，只更新指定文件
3. 跳过 - 直接使用现有代码库映射
```

等待用户选择。

如果选 “Refresh”：删除 `.planning/codebase/`，继续到 `create_structure`
如果选 “Update”：询问要更新哪些文档，然后继续到 `spawn_agents`（仅更新所选项）
如果选 “Skip”：直接退出

**如果不存在：**
直接继续到 `create_structure`。
</step>

<step name="create_structure">
创建 `.planning/codebase/` 目录：

```bash
mkdir -p .planning/codebase
```

**预期输出文件：**
- `STACK.md`
- `INTEGRATIONS.md`
- `ARCHITECTURE.md`
- `STRUCTURE.md`
- `CONVENTIONS.md`
- `TESTING.md`
- `CONCERNS.md`

继续到 `spawn_agents`。
</step>

<step name="spawn_agents">
并行拉起 4 个 `gsd-codebase-mapper` agent。

使用 `Task`，参数包含：
- `subagent_type="gsd-codebase-mapper"`
- `model="{mapper_model}"`
- `run_in_background=true`

**关键：** 必须使用 `gsd-codebase-mapper`，不要用 `Explore`。mapper agent 的职责就是直接写文档。

**Agent 1：Tech Focus**
- 产出：`STACK.md`、`INTEGRATIONS.md`

**Agent 2：Architecture Focus**
- 产出：`ARCHITECTURE.md`、`STRUCTURE.md`

**Agent 3：Quality Focus**
- 产出：`CONVENTIONS.md`、`TESTING.md`

**Agent 4：Concerns Focus**
- 产出：`CONCERNS.md`

继续到 `collect_confirmations`。
</step>

<step name="collect_confirmations">
等待 4 个 agent 全部完成。

读取每个 agent 的输出确认。

**期望确认格式：**
```
## Mapping Complete

**Focus:** {focus}
**Documents written:**
- `.planning/codebase/{DOC1}.md` ({N} lines)
- `.planning/codebase/{DOC2}.md` ({N} lines)

可返回给 orchestrator 做摘要。
```

**orchestrator 只接收路径和行数，不接收文档正文。**

如果某个 agent 失败，记录失败信息，其余成功文档照常继续。
</step>

<step name="verify_output">
验证文档是否都已创建成功：

```bash
ls -la .planning/codebase/
wc -l .planning/codebase/*.md
```

**检查清单：**
- 7 份文档都存在
- 没有空文档（每份至少应超过 20 行）

如果有缺失或空文件，标记可能失败的 agent。
</step>

<step name="scan_for_secrets">
**关键安全检查：** 在提交前扫描生成文档里是否误写入敏感信息。

```bash
grep -E '(sk-[a-zA-Z0-9]{20,}|sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|glpat-[a-zA-Z0-9_-]+|AKIA[A-Z0-9]{16}|xox[baprs]-[a-zA-Z0-9-]+|-----BEGIN.*PRIVATE KEY|eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.)' .planning/codebase/*.md 2>/dev/null && SECRETS_FOUND=true || SECRETS_FOUND=false
```

如果 `SECRETS_FOUND=true`：

```
安全警报：代码库映射文档中疑似包含敏感信息。

发现疑似 API key / token 的内容：
[show grep output]

在提交前必须先确认这些内容是否安全：
1. 检查上面的命中内容
2. 如果是真实凭据，先移除
3. 必要时把敏感文件加入 Claude Code 的 Deny 权限

在继续提交前先暂停。若确认不是敏感信息，可回复 “safe to proceed”。
```

等待用户确认后再继续。

如果 `SECRETS_FOUND=false`：直接进入 `commit_codebase_map`。
</step>

<step name="commit_codebase_map">
提交代码库映射：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: map existing codebase" --files .planning/codebase/*.md
```
</step>

<step name="offer_next">
向用户展示完成摘要与下一步。

先取行数：
```bash
wc -l .planning/codebase/*.md
```

**输出格式：**

```
代码库映射完成。

已创建 `.planning/codebase/`：
- STACK.md ([N] lines) - 技术栈与依赖
- ARCHITECTURE.md ([N] lines) - 系统设计与架构模式
- STRUCTURE.md ([N] lines) - 目录布局与组织方式
- CONVENTIONS.md ([N] lines) - 代码风格与模式
- TESTING.md ([N] lines) - 测试结构与实践
- INTEGRATIONS.md ([N] lines) - 外部服务与 API
- CONCERNS.md ([N] lines) - 技术债与风险点

---

## 下一步

**初始化项目** - 让后续规划使用这份代码库上下文

`/gsd:new-project`

<sub>建议先 `/clear`，获得更干净的上下文窗口</sub>

---

**也可以：**
- 重新映射：`/gsd:map-codebase`
- 查看某份文档：`cat .planning/codebase/STACK.md`
- 先手动编辑其中任意文档再继续
```
</step>

</process>

<success_criteria>
- `.planning/codebase/` 已创建
- 已并行拉起 4 个 `gsd-codebase-mapper`
- agent 直接写文档，orchestrator 不接收正文
- 已读取 agent 输出确认
- 7 份代码库文档全部存在
- 已给出带行数的清晰完成摘要
- 已向用户给出明确下一步
</success_criteria>
