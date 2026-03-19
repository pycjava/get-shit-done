<purpose>
零摩擦记录想法。一次 Write、一次确认，不追问、不弹额外流程。
直接内联执行，不使用 `Task`、`AskUserQuestion` 或 `Bash`。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="storage_format">
**Note 的存储格式。**

Note 按单独 markdown 文件存储：

- **项目级**：`.planning/notes/{YYYY-MM-DD}-{slug}.md`，当当前目录存在 `.planning/` 时使用
- **全局级**：`~/.claude/notes/{YYYY-MM-DD}-{slug}.md`，当不存在 `.planning/`，或显式带了 `--global` 时使用

每个 note 文件格式：

```markdown
---
date: "YYYY-MM-DD HH:mm"
promoted: false
---

{note text verbatim}
```

**`--global` 参数**：在解析 `$ARGUMENTS` 前，先从任意位置剥离 `--global`。只要出现，就强制使用全局级存储，不管当前目录是否存在 `.planning/`。

**重要：** 如果不存在 `.planning/`，不要帮用户创建它。直接静默回退到全局级。
</step>

<step name="parse_subcommand">
**从 `$ARGUMENTS` 中解析子命令（先移除 `--global`）。**

| 条件 | 子命令 |
|------|--------|
| 参数恰好为 `list`（忽略大小写） | **list** |
| 参数恰好为 `promote <N>` 且 N 为数字 | **promote** |
| 参数为空（完全没有文本） | **list** |
| 其他任何内容 | **append**（把文本本身当作 note） |

**关键：** 只有当参数**完全等于** `list` 时，它才算子命令。`/gsd:note list of groceries` 应保存一条文本为 `"list of groceries"` 的 note。`promote` 同理，只有后面严格跟着一个数字才算子命令。
</step>

<step name="append">
**子命令：append -> 创建带时间戳的 note 文件。**

1. 按上面的存储规则确定 scope（project 或 global）
2. 确保 notes 目录存在（`.planning/notes/` 或 `~/.claude/notes/`）
3. 生成 slug：取 note 文本前约 4 个有意义的词，小写、用 `-` 连接，并剥掉开头的冠词 / 介词
4. 生成文件名：`{YYYY-MM-DD}-{slug}.md`
   - 如果同名文件已存在，则追加 `-2`、`-3` 等后缀
5. 按存储格式写入文件
6. 只输出一行确认：`已记录（{scope}）：{note text}`
   - `{scope}` 只能是 `"project"` 或 `"global"`

**约束：**
- **绝不改写 note 文本**，包括原始错别字也原样保留
- **绝不追问用户**
- **时间格式** 使用本地时间：`YYYY-MM-DD HH:mm`（24 小时制、无秒）
</step>

<step name="list">
**子命令：list -> 同时展示 project / global 两个作用域的 notes。**

1. Glob `.planning/notes/*.md`（如果目录存在）-> 项目级 notes
2. Glob `~/.claude/notes/*.md`（如果目录存在）-> 全局级 notes
3. 对每个文件，读取 frontmatter，提取 `date` 和 `promoted`
4. 统计活跃数量时，排除 `promoted: true` 的条目；但展示时仍然保留，并弱化显示
5. 按日期排序，对所有活跃条目从 1 开始连续编号
6. 如果活跃条目超过 20 条，只显示最后 10 条，并说明省略了多少条

**展示格式：**

```
Notes：

Project (.planning/notes/)：
  1. [2026-02-08 14:32] refactor the hook system to support async validators
  2. [promoted] [2026-02-08 14:40] add rate limiting to the API endpoints
  3. [2026-02-08 15:10] consider adding a --dry-run flag to build

Global (~/.claude/notes/)：
  4. [2026-02-08 10:00] cross-project idea about shared config

{count} 条活跃 note。使用 `/gsd:note promote <N>` 可以将其转成 todo。
```

如果某个作用域没有目录或没有内容，显示：`(no notes)`
</step>

<step name="promote">
**子命令：promote -> 把一条 note 转成 todo。**

1. 先执行 **list** 的索引逻辑，得到统一编号
2. 找到编号 N 对应的条目
3. 如果 N 无效，或者该 note 已经 promoted，则提示并停止
4. **要求存在 `.planning/` 目录**；如果不存在，则警告：`todo 需要一个 GSD 项目。请先运行 /gsd:new-project 初始化。`
5. 确保 `.planning/todos/pending/` 目录存在
6. 生成 todo ID：`{NNN}-{slug}`
   - 扫描 `.planning/todos/pending/` 和 `.planning/todos/done/` 中现有最高编号，加 1 后补零到 3 位
   - `slug` 使用 note 文本前约 4 个有意义的词
7. 读取源 note 文件中的正文（frontmatter 之后的内容）
8. 创建 `.planning/todos/pending/{id}.md`：

```yaml
---
title: "{note text}"
status: pending
priority: P2
source: "promoted from /gsd:note"
created: {YYYY-MM-DD}
theme: general
---

## Goal

{note text}

## Context

Promoted from quick note captured on {original date}.

## Acceptance Criteria

- [ ] {primary criterion derived from note text}
```

9. 把源 note 文件的 frontmatter 更新为 `promoted: true`
10. 确认：`已将 note {N} 提升为 todo {id}: {note text}`
</step>

</process>

<edge_cases>
1. **"list" 作为正文**：`/gsd:note list of things` 应保存 `"list of things"`，只有参数完全等于 `list` 才是子命令
2. **没有 `.planning/`**：自动回退到全局 `~/.claude/notes/`，任意目录都可用
3. **未初始化项目就 promote**：提示 todo 需要 `.planning/`，并建议 `/gsd:new-project`
4. **条目过多**：`list` 在活跃条目超过 20 条时只展示最后 10 条
5. **slug 重复**：同一天内若 slug 已存在，则追加 `-2`、`-3`
6. **`--global` 位置任意**：`--global my idea` 和 `my idea --global` 都应保存 `"my idea"` 到全局
7. **promote 已 promoted 的条目**：提示 `Note {N} 已经 promoted`
8. **移除 flags 后正文为空**：按 `list` 子命令处理
</edge_cases>

<success_criteria>
- [ ] append：已按正确 frontmatter 和原文写入 note 文件
- [ ] append：没有追问，做到即时记录
- [ ] list：两个作用域都已展示，编号连续
- [ ] list：已 promoted 的 notes 仍展示但做弱化
- [ ] promote：已按正确格式创建 todo
- [ ] promote：源 note 已标记为 promoted
- [ ] 全局回退：在没有 `.planning/` 时也能工作
</success_criteria>
