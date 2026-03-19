<purpose>
为 `/gsd:audit-milestone` 发现的缺口自动创建补齐阶段。读取 `MILESTONE-AUDIT.md`，把 gaps 按逻辑聚成阶段，写入 `ROADMAP.md`，并提示用户继续为这些阶段建计划。用户不需要手工对每个 gap 分别执行 `/gsd:add-phase`。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

## 1. 读取审计结果

```bash
ls -t .planning/v*-MILESTONE-AUDIT.md 2>/dev/null | head -1
```

从 YAML frontmatter 中提取结构化 gaps：
- `gaps.requirements`
- `gaps.integration`
- `gaps.flows`

如果没有 audit 文件，或文件中没有 gaps：
```
未找到可处理的 audit gaps。请先运行 `/gsd:audit-milestone`。
```

## 2. 给缺口分优先级

根据 `REQUIREMENTS.md` 中的优先级分组：

| Priority | 动作 |
|----------|------|
| `must` | 必须创建阶段，会阻塞里程碑完成 |
| `should` | 建议创建阶段 |
| `nice` | 询问用户：现在纳入还是延后 |

对于 integration / flow 类缺口，从受影响 requirement 反推优先级。

## 3. 把 gaps 聚成阶段

将相关 gaps 聚成逻辑阶段：

**分组规则：**
- 影响同一阶段 -> 尽量合并
- 属于同一子系统（auth / API / UI）-> 合并
- 按依赖顺序组织（先补 stub，再补接线）
- 阶段保持聚焦，每个阶段约 2-4 个任务

## 4. 决定新阶段编号

找出当前最高阶段号：

```bash
PHASES=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" phases list)
HIGHEST=$(printf '%s\n' "$PHASES" | jq -r '.directories[-1]')
```

新的 gap closure 阶段从这里往后续编号。

## 5. 向用户展示 gap closure 方案

```markdown
## 缺口补齐方案

**Milestone:** {version}
**待关闭缺口：** {N} 条需求、{M} 个集成问题、{K} 条流程问题

### 建议新增阶段

**Phase {N}: {Name}**
关闭：
- {REQ-ID}: {description}
- Integration: {from} -> {to}
任务数：{count}

**Phase {N+1}: {Name}**
关闭：
- {REQ-ID}: {description}
- Flow: {flow name}
任务数：{count}

{If nice-to-have gaps exist:}

### 可延期项（nice-to-have）
- {gap description}
- {gap description}

---

是否创建以上 {X} 个阶段？（yes / adjust / defer all optional）
```

等待用户确认。

## 6. 更新 ROADMAP.md

把新的补齐阶段加入当前里程碑：

```markdown
### Phase {N}: {Name}
**Goal:** {derived from gaps being closed}
**Requirements:** {REQ-IDs being satisfied}
**Gap Closure:** Closes gaps from audit
```

## 7. 更新 REQUIREMENTS.md 可追踪表（必做）

对于每个被分配到 gap closure 阶段的 `REQ-ID`：
- 更新其 Phase 列
- 将 Status 重置为 `Pending`

对于审计中被判定为 unsatisfied 的 requirement：
- 把 `[x]` 改回 `[ ]`
- 更新 `REQUIREMENTS.md` 顶部的覆盖统计

```bash
grep -c "Pending" .planning/REQUIREMENTS.md
```

## 8. 创建阶段目录

```bash
mkdir -p ".planning/phases/{NN}-{name}"
```

## 9. 提交路线图和需求变更

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs(roadmap): add gap closure phases {N}-{M}" --files .planning/ROADMAP.md .planning/REQUIREMENTS.md
```

## 10. 提示下一步

```markdown
## 已创建缺口补齐阶段

**新增阶段：** {N} - {M}
**覆盖缺口：** {count} 条需求、{count} 个集成问题、{count} 条流程问题

---

## 下一步

**先规划第一个 gap closure 阶段**

`/gsd:plan-phase {N}`

<sub>建议先 `/clear`，获得更干净的上下文窗口</sub>

---

**也可以：**
- `/gsd:execute-phase {N}` - 如果计划已经存在
- `cat .planning/ROADMAP.md` - 查看更新后的路线图

---

**等所有 gap phase 完成后：**
- `/gsd:audit-milestone` - 重新审计，确认缺口已关闭
- `/gsd:complete-milestone {version}` - 审计通过后归档里程碑
```

</process>

<success_criteria>
- [ ] 已读取 `MILESTONE-AUDIT.md` 并解析 gaps
- [ ] 已完成优先级划分（must / should / nice）
- [ ] 已将 gaps 组织为合理阶段
- [ ] 已得到用户确认
- [ ] 已更新 `ROADMAP.md`
- [ ] 已更新 `REQUIREMENTS.md` 的可追踪关系
- [ ] 已把 unsatisfied requirement 的勾选项从 `[x]` 重置为 `[ ]`
- [ ] 已更新需求覆盖计数
- [ ] 已创建阶段目录
- [ ] 已提交改动（含 `REQUIREMENTS.md`）
- [ ] 已明确提示用户下一步运行 `/gsd:plan-phase`
</success_criteria>
