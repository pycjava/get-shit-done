<purpose>
把会话中出现的想法、任务或问题记录成结构化 todo，留待后续处理。支持“想到 -> 记录 -> 继续当前工作”的流程，不丢上下文。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="init_context">
加载 todo 上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init todos)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

从 init JSON 中提取：`commit_docs`、`date`、`timestamp`、`todo_count`、`todos`、`pending_dir`、`todos_dir_exists`。

确保目录存在：
```bash
mkdir -p .planning/todos/pending .planning/todos/done
```

为后续 `infer_area` 步骤记录现有 todo 中的 area，用于保持一致。
</step>

<step name="extract_content">
**有参数时：** 直接把参数作为标题 / 焦点。
- `/gsd:add-todo Add auth token refresh` -> title = "Add auth token refresh"

**无参数时：** 从最近对话中提取：
- 讨论中的具体问题、想法或任务
- 提到的相关文件路径
- 技术细节（错误信息、行号、约束）

整理出：
- `title`：3-10 个词的描述性标题，优先使用动作动词
- `problem`：这个问题是什么，或者为什么需要它
- `solution`：已有方案线索；如果只是一个想法，则写 `TBD`
- `files`：对话中提到的相关路径和行号
</step>

<step name="infer_area">
根据文件路径推断 area：

| 路径模式 | Area |
|----------|------|
| `src/api/*`, `api/*` | `api` |
| `src/components/*`, `src/ui/*` | `ui` |
| `src/auth/*`, `auth/*` | `auth` |
| `src/db/*`, `database/*` | `database` |
| `tests/*`, `__tests__/*` | `testing` |
| `docs/*` | `docs` |
| `.planning/*` | `planning` |
| `scripts/*`, `bin/*` | `tooling` |
| 没有文件或不清楚 | `general` |

如果第 2 步和现有 todo 中存在相似 area，优先沿用现有 area。
</step>

<step name="check_duplicates">
```bash
# 根据标题关键词搜索现有 todo
grep -l -i "[key words from title]" .planning/todos/pending/*.md 2>/dev/null
```

如果发现潜在重复：
1. 读取已有 todo
2. 比较两者范围

如果范围重叠，使用 AskUserQuestion：
- header: "重复项？"
- question: "已存在相似 todo：[title]。你希望怎么处理？"
- options:
  - "跳过" - 保留现有 todo
  - "替换" - 用新的上下文更新原 todo
  - "仍然新增" - 作为独立 todo 创建
</step>

<step name="create_file">
直接使用 init 上下文中的 `timestamp` 和 `date`。

为标题生成 slug：
```bash
slug=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" generate-slug "$title" --raw)
```

写入 `.planning/todos/pending/${date}-${slug}.md`：

```markdown
---
created: [timestamp]
title: [title]
area: [area]
files:
  - [file:lines]
---

## Problem（问题）

[问题描述，要足够清楚，让未来数周后的 Claude 也能立刻理解]

## Solution（思路）

[方案线索，或 "TBD"]
```
</step>

<step name="update_state">
如果 `.planning/STATE.md` 存在：

1. 使用 init 上下文中的 `todo_count`（如果数量已变化则重新运行 `init todos`）
2. 更新“## Accumulated Context”下的“### Pending Todos”
</step>

<step name="git_commit">
提交 todo 和更新后的状态文件：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: capture todo - [title]" --files .planning/todos/pending/[filename] .planning/STATE.md
```

该工具会自动遵守 `commit_docs` 配置与 gitignore。

确认信息：`已提交：docs: capture todo - [title]`
</step>

<step name="confirm">
```
Todo 已保存：.planning/todos/pending/[filename]

  [title]
  Area: [area]
  关联文件：引用了 [count] 个文件

---

接下来你想：

1. 继续当前工作
2. 再添加一个 todo
3. 查看所有 todo（/gsd:check-todos）
```
</step>

</process>

<success_criteria>
- [ ] 目录结构已存在
- [ ] 已创建带有效 frontmatter 的 todo 文件
- [ ] Problem 区块包含足够上下文，便于后续接手
- [ ] 已检查并处理重复项
- [ ] Area 与现有 todo 体系保持一致
- [ ] 若存在 `STATE.md`，则已更新
- [ ] 已将 todo 与状态改动提交到 git
</success_criteria>
