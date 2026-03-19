<purpose>
从项目路线图中移除一个尚未开始的未来阶段，删除对应目录，并重编号后续所有阶段以保持连续顺序。git 提交即为这次移除的历史记录。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 参数就是要移除的阶段号（整数或小数）
- 示例：`/gsd:remove-phase 17` -> phase = 17
- 示例：`/gsd:remove-phase 16.1` -> phase = 16.1

如果没有提供参数：

```
ERROR: 缺少阶段号
用法：/gsd:remove-phase <phase-number>
示例：/gsd:remove-phase 17
```

退出。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${target}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

提取：`phase_found`、`phase_dir`、`phase_number`、`commit_docs`、`roadmap_exists`。

同时读取 `STATE.md` 与 `ROADMAP.md`，以解析当前所处位置。
</step>

<step name="validate_future_phase">
确认目标阶段是未来阶段（尚未开始）：

1. 将目标阶段与 `STATE.md` 中的当前阶段比较
2. 目标阶段必须大于当前阶段

如果 `target <= current`：

```
ERROR: 不能移除阶段 {target}

只能移除未来阶段：
- 当前阶段：{current}
- 阶段 {target} 属于当前阶段或已完成阶段

如果要中止当前工作，请使用 /gsd:pause-work。
```

退出。
</step>

<step name="confirm_removal">
展示移除摘要并确认：

```
将移除阶段 {target}: {Name}

这会：
- 删除：.planning/phases/{target}-{slug}/
- 重编号后续所有阶段
- 更新：ROADMAP.md、STATE.md

是否继续？(y/n)
```

等待确认。
</step>

<step name="execute_removal">
**将整个移除操作交给 `gsd-tools`：**

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase remove "${target}")
```

如果该阶段已经有执行过的计划（存在 `SUMMARY.md`），`gsd-tools` 会报错。只有用户确认后才允许使用 `--force`：

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase remove "${target}" --force)
```

CLI 负责：
- 删除阶段目录
- 重编号后续目录（倒序处理以避免冲突）
- 重命名被重编号目录中的文件（`PLAN.md`、`SUMMARY.md` 等）
- 更新 `ROADMAP.md`（删除阶段区块、重编号阶段引用、更新依赖）
- 更新 `STATE.md`（阶段总数减一）

从结果中提取：`removed`、`directory_deleted`、`renamed_directories`、`renamed_files`、`roadmap_updated`、`state_updated`。
</step>

<step name="commit">
暂存并提交这次移除：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: remove phase {target} ({original-phase-name})" --files .planning/
```

这条提交消息就是移除操作的历史记录。
</step>

<step name="completion">
向用户展示完成摘要：

```
阶段 {target}（{original-name}）已移除。

变更：
- 已删除：.planning/phases/{target}-{slug}/
- 已重编号：{N} 个目录、{M} 个文件
- 已更新：ROADMAP.md、STATE.md
- 已提交：chore: remove phase {target} ({original-name})

---

## 下一步

你现在可以：
- `/gsd:progress` - 查看更新后的路线图状态
- 继续当前阶段
- 查看路线图

---
```
</step>

</process>

<anti_patterns>

- 不要对已完成阶段（存在 `SUMMARY.md`）使用普通删除，除非用户明确同意 `--force`
- 不要删除当前阶段或过去阶段
- 不要手工重编号，必须使用 `gsd-tools phase remove`
- 不要往 `STATE.md` 里额外加“removed phase”说明，git 提交就是记录
- 不要修改已完成阶段目录中的内容
</anti_patterns>

<success_criteria>
阶段移除完成时应满足：

- [ ] 已验证目标阶段属于未来 / 未开始阶段
- [ ] 已成功执行 `gsd-tools phase remove`
- [ ] 已用清晰的提交信息提交改动
- [ ] 已向用户说明变更结果
</success_criteria>
