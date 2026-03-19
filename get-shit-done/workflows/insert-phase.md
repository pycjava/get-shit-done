<purpose>
在里程碑执行过程中，如果中途发现紧急工作，需要在已有整数阶段之间插入一个小数阶段。使用小数编号（如 `72.1`、`72.2`）可以保留原有阶段顺序，而不必重编号整个路线图。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 第一个参数：要插入到哪个整数阶段之后
- 其余参数：阶段描述

示例：`/gsd:insert-phase 72 Fix critical auth bug`
-> after = 72
-> description = "Fix critical auth bug"

如果参数不完整：

```
ERROR: 缺少阶段号或描述
用法：/gsd:insert-phase <after> <description>
示例：/gsd:insert-phase 72 Fix critical auth bug
```

退出。

第一个参数必须是整数。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${after_phase}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

检查 init JSON 中的 `roadmap_exists`。如果为 false：
```
ERROR: 未找到 roadmap（.planning/ROADMAP.md）
```
退出。
</step>

<step name="insert_phase">
**将插入阶段操作交给 `gsd-tools`：**

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase insert "${after_phase}" "${description}")
```

CLI 负责：
- 确认目标阶段在 `ROADMAP.md` 中存在
- 计算下一个可用的小数阶段号（同时检查磁盘上已有的小数阶段）
- 由描述生成 slug
- 创建阶段目录（`.planning/phases/{N.M}-{slug}/`）
- 在 `ROADMAP.md` 中把新阶段插入到目标阶段之后，并带上 `(INSERTED)` 标记

从结果中提取：`phase_number`、`after_phase`、`name`、`slug`、`directory`。
</step>

<step name="update_project_state">
更新 `STATE.md` 以反映插入阶段：

1. 读取 `.planning/STATE.md`
2. 在“## Accumulated Context”下的“### Roadmap Evolution”中追加：
   ```
   - 已在阶段 {after_phase} 后插入阶段 {decimal_phase}: {description} (URGENT)
   ```

如果不存在 “Roadmap Evolution” 区块，则创建它。
</step>

<step name="completion">
向用户展示完成摘要：

```
已在阶段 {after_phase} 后插入阶段 {decimal_phase}：
- 描述：{description}
- 目录：.planning/phases/{decimal-phase}-{slug}/
- 状态：尚未规划
- 标记：(INSERTED) - 表示中途插入的紧急工作

已更新路线图：.planning/ROADMAP.md
已更新项目状态：.planning/STATE.md

---

## 下一步

**阶段 {decimal_phase}: {description}** -- 紧急插入阶段

`/gsd:plan-phase {decimal_phase}`

<sub>建议先 `/clear`，获得更干净的上下文窗口</sub>

---

**也建议检查：**
- 插入后的影响：确认阶段 {next_integer} 的依赖关系是否仍然成立
- 查看路线图

---
```
</step>

</process>

<anti_patterns>

- 不要把它用于里程碑尾部的常规新增工作（那是 `/gsd:add-phase`）
- 不要在阶段 1 之前插入（`0.1` 没意义）
- 不要重编号已有阶段
- 不要修改目标阶段原有内容
- 不要在这里创建计划（那是 `/gsd:plan-phase` 的职责）
- 不要自动提交改动（是否提交由用户决定）
</anti_patterns>

<success_criteria>
阶段插入完成时应满足：

- [ ] 已成功执行 `gsd-tools phase insert`
- [ ] 已创建阶段目录
- [ ] 已在路线图中加入新阶段条目（含 `(INSERTED)` 标记）
- [ ] 已在 `STATE.md` 中记录 roadmap evolution
- [ ] 已告知用户下一步和潜在依赖影响
</success_criteria>
