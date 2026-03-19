<purpose>
列出所有待处理 todo，让用户选择其中一项，加载完整上下文，并路由到合适的后续动作。
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

从 init JSON 中提取：`todo_count`、`todos`、`pending_dir`。

如果 `todo_count` 为 0：
```
当前没有待处理 todo。

todo 可以在工作过程中通过 /gsd:add-todo 随时记录。

---

你现在可以：

1. 继续当前阶段（/gsd:progress）
2. 现在新增一个 todo（/gsd:add-todo）
```

退出。
</step>

<step name="parse_filter">
检查参数中是否带有 area 过滤：
- `/gsd:check-todos` -> 显示全部
- `/gsd:check-todos api` -> 只显示 `api` area
</step>

<step name="list_todos">
使用 init 上下文中的 `todos` 数组（如果指定了 area，则这里已是过滤后的结果）。

按编号展示：

```
待处理 Todos：

1. Add auth token refresh (api, 2d ago)
2. Fix modal z-index issue (ui, 1d ago)
3. Refactor database connection pool (database, 5h ago)

---

回复一个编号可查看详情，或者：
- `/gsd:check-todos [area]` 按 area 过滤
- `q` 退出
```

创建时间使用相对时间格式展示。
</step>

<step name="handle_selection">
等待用户回复一个编号。

如果输入有效：加载对应 todo，继续。
如果无效：提示 `选择无效。请输入 1-[N] 之间的编号，或输入 \`q\` 退出。`
</step>

<step name="load_context">
完整读取 todo 文件，并展示：

```
## [title]

**Area:** [area]
**创建时间：** [date]（[relative time] 前）
**相关文件：** [list or "None"]

### Problem（问题）
[problem section content]

### Solution（思路）
[solution section content]
```

如果 `files` 字段中有条目，读取这些文件并做简短总结。
</step>

<step name="check_roadmap">
检查是否存在 roadmap（可用 `init progress`，也可直接检查文件是否存在）：

如果 `.planning/ROADMAP.md` 存在：
1. 检查 todo 的 area 是否对应某个后续阶段
2. 检查 todo 的文件是否与某个阶段范围重叠
3. 如有匹配，在动作选项中体现出来
</step>

<step name="offer_actions">
**如果 todo 能映射到某个 roadmap 阶段：**

使用 AskUserQuestion：
- header: "操作"
- question: "这个 todo 与阶段 [N]：[name] 有关。你希望怎么处理？"
- options:
  - "现在处理" - 移到 done，并开始处理
  - "并入阶段计划" - 规划阶段 [N] 时纳入
  - "先讨论方案" - 先想清楚再决定
  - "放回列表" - 返回 todo 列表

**如果没有 roadmap 匹配：**

使用 AskUserQuestion：
- header: "操作"
- question: "你想怎么处理这个 todo？"
- options:
  - "现在处理" - 移到 done，并开始处理
  - "创建新阶段" - 用这个范围调用 `/gsd:add-phase`
  - "先讨论方案" - 先想清楚再决定
  - "放回列表" - 返回 todo 列表
</step>

<step name="execute_action">
**现在处理：**
```bash
mv ".planning/todos/pending/[filename]" ".planning/todos/done/"
```
更新 `STATE.md` 中的 todo 数量。展示 problem / solution 上下文，然后开始工作，或询问下一步。

**并入阶段计划：**
把这个 todo 记入阶段规划备注。保持在 pending 中。返回列表或退出。

**创建新阶段：**
展示：`/gsd:add-phase [description from todo]`
保持在 pending 中，由用户在新上下文中执行。

**先讨论方案：**
保持在 pending 中，进入问题与方案讨论。

**放回列表：**
返回 `list_todos` 步骤。
</step>

<step name="update_state">
在任何会改变 todo 数量的动作后：

重新运行 `init todos` 获取最新数量，然后更新 `STATE.md` 中的“### Pending Todos”区块（如果存在）。
</step>

<step name="git_commit">
如果 todo 被移动到了 `done/`，提交改动：

```bash
git rm --cached .planning/todos/pending/[filename] 2>/dev/null || true
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: start work on todo - [title]" --files .planning/todos/done/[filename] .planning/STATE.md
```

该工具会自动遵守 `commit_docs` 配置与 gitignore。

确认信息：`已提交：docs: start work on todo - [title]`
</step>

</process>

<success_criteria>
- [ ] 已列出所有待处理 todo，包含标题、area、时间
- [ ] 如果指定了 area，则已正确过滤
- [ ] 已加载所选 todo 的完整上下文
- [ ] 已检查与 roadmap 的关联
- [ ] 已提供合适的后续动作
- [ ] 已执行所选动作
- [ ] 若 todo 数量变化，则已更新 `STATE.md`
- [ ] 若 todo 移入 done，则已提交 git 变更
</success_criteria>
