<purpose>
在当前里程碑的路线图末尾新增一个整数阶段。自动计算下一个阶段号、创建阶段目录，并更新路线图结构。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="parse_arguments">
解析命令参数：
- 所有参数一起作为阶段描述
- 示例：`/gsd:add-phase Add authentication` -> description = "Add authentication"
- 示例：`/gsd:add-phase Fix critical performance issues` -> description = "Fix critical performance issues"

如果没有提供参数：

```
ERROR: 缺少阶段描述
用法：/gsd:add-phase <description>
示例：/gsd:add-phase Add authentication system
```

退出。
</step>

<step name="init_context">
加载阶段操作上下文：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "0")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

检查 init JSON 中的 `roadmap_exists`。如果为 false：
```
ERROR: 未找到 roadmap（.planning/ROADMAP.md）
请先运行 /gsd:new-project 进行初始化。
```
退出。
</step>

<step name="add_phase">
**将新增阶段操作交给 `gsd-tools`：**

```bash
RESULT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phase add "${description}")
```

CLI 负责：
- 查找当前最高的整数阶段号
- 计算下一个阶段号（max + 1）
- 由描述生成 slug
- 创建阶段目录（`.planning/phases/{NN}-{slug}/`）
- 在 `ROADMAP.md` 中插入包含 Goal、Depends on、Plans 的阶段条目

从结果中提取：`phase_number`、`padded`、`name`、`slug`、`directory`。
</step>

<step name="update_project_state">
更新 `STATE.md` 以反映新阶段：

1. 读取 `.planning/STATE.md`
2. 在“## Accumulated Context”下的“### Roadmap Evolution”中追加：
   ```
   - 已新增阶段 {N}：{description}
   ```

如果不存在 “Roadmap Evolution” 区块，则创建它。
</step>

<step name="completion">
向用户展示完成摘要：

```
已将阶段 {N} 加入当前里程碑：
- 描述：{description}
- 目录：.planning/phases/{phase-num}-{slug}/
- 状态：尚未规划

已更新路线图：.planning/ROADMAP.md

---

## 下一步

**阶段 {N}: {description}**

`/gsd:plan-phase {N}`

<sub>建议先 `/clear`，获得更干净的上下文窗口</sub>

---

**也可以继续：**
- `/gsd:add-phase <description>` - 再添加一个阶段
- 查看路线图

---
```
</step>

</process>

<success_criteria>
- [ ] 已成功执行 `gsd-tools phase add`
- [ ] 已创建阶段目录
- [ ] 已在路线图中加入新阶段条目
- [ ] 已在 `STATE.md` 中记录 roadmap evolution
- [ ] 已告知用户下一步
</success_criteria>
