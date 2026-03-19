---
name: gsd:bootstrap
description: 初始化项目 → 代码库映射 → 审计 → 规划 → 执行 → 验证，全链路一键启动
argument-hint: "[--phase N] [--skip-audit] [--skip-map]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Skill
  - AskUserQuestion
---

<objective>
检测当前项目状态，缺什么初始化什么，然后按顺序执行完整链路：new-project → map-codebase → ops-audit → plan-phase → execute-phase → verify-work。

"有就跳过，没有就初始化"——重复运行是安全的。
</objective>

<process>

## 0. 解析参数

从 `$ARGUMENTS` 中提取：

| 参数 | 含义 |
|---|---|
| `--phase N` | 从第 N 个 phase 开始（默认 1） |
| `--skip-audit` | 跳过 ops-audit |
| `--skip-map` | 跳过 map-codebase |

```bash
TARGET_PHASE=1
SKIP_AUDIT=false
SKIP_MAP=false

if echo "$ARGUMENTS" | grep -qE '\-\-phase\s+[0-9]'; then
  TARGET_PHASE=$(echo "$ARGUMENTS" | grep -oE '\-\-phase\s+[0-9]+\.?[0-9]*' | awk '{print $2}')
fi
if echo "$ARGUMENTS" | grep -qE '\-\-skip-audit'; then
  SKIP_AUDIT=true
fi
if echo "$ARGUMENTS" | grep -qE '\-\-skip-map'; then
  SKIP_MAP=true
fi
```

</step>

<step name="detect_state" priority="first">

## 1. 检测项目状态

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init milestone-op)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

提取：`planning_exists`、`state_exists`、`roadmap_exists`、`milestone_version`、`milestone_name`。

再检查运维文档：

```bash
OPS_INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init ops-audit 2>/dev/null)
if [[ "$OPS_INIT" == @file:* ]]; then OPS_INIT=$(cat "${OPS_INIT#@file:}"); fi
```

提取：`planning_exists`（再次确认）、`has_operations`、`ops_dir`。

</step>

<step name="new_project">

## 2. 初始化项目（如需要）

如果 `planning_exists=false`：

```
Skill(skill="gsd:new-project")
```

展示：`尚未初始化项目，开始创建 .planning 结构...`

如果 `planning_exists=true`：

展示：`项目已初始化，跳过 new-project。`

继续到下一步。

</step>

<step name="map_codebase">

## 3. 代码库映射（如需要）

如果 `SKIP_MAP=true`：

展示：`已跳过 map-codebase。`

否则：

```bash
MAP_INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init map-codebase)
if [[ "$MAP_INIT" == @file:* ]]; then MAP_INIT=$(cat "${MAP_INIT#@file:}"); fi
```

提取 `has_maps`。

如果 `has_maps=true`：

展示：`代码库映射已存在，跳过 map-codebase。`

如果 `has_maps=false` 且 `codebase_dir_exists=true`：

```
Skill(skill="gsd:map-codebase")
```

</step>

<step name="ops_audit">

## 4. 运维审计（如需要）

如果 `SKIP_AUDIT=true`：

展示：`已跳过 ops-audit。`

继续到下一步。

如果 `planning_exists=false`：

展示：`项目未初始化，ops-audit 留到项目建立后运行。`

否则：

提取 `has_operations`：

- 如果 `has_operations=true`：执行 `ops-audit` 审计已有文档
- 如果 `has_operations=false`：提示用户初始化运维文档

展示启动横幅：

```markdown
## GSD Bootstrap · 运维审计

项目：{project_name}
阶段：{milestone_name}
```

```
Skill(skill="gsd:ops-audit", args="all")
```

审计完成后继续。

</step>

<step name="plan_phase">

## 5. 规划阶段

向用户展示：

```markdown
## GSD Bootstrap · 阶段规划 · {TARGET_PHASE}
```

如果 `TARGET_PHASE` 已有 `PLAN.md`：

展示：`阶段 {TARGET_PHASE} 已有 PLAN.md，跳过 plan-phase。`

如果 `TARGET_PHASE` 还没有计划：

```
Skill(skill="gsd:plan-phase", args="{TARGET_PHASE}")
```

</step>

<step name="execute_phase">

## 6. 执行阶段

向用户展示：

```markdown
## GSD Bootstrap · 阶段执行 · {TARGET_PHASE}
```

```
Skill(skill="gsd:execute-phase", args="{TARGET_PHASE} --no-transition")
```

执行完成后读取验证状态：

```bash
PHASE_STATE=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op ${TARGET_PHASE})
VERIFY_STATUS=$(grep "^status:" "${phase_dir}"/*-VERIFICATION.md 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' ')
```

</step>

<step name="verify_work">

## 7. 验证工作

向用户展示：

```markdown
## GSD Bootstrap · 阶段验证 · {TARGET_PHASE}
```

```
Skill(skill="gsd:verify-work", args="{TARGET_PHASE}")
```

</step>

<step name="summary">

## 8. 汇总报告

展示完成报告：

```markdown
## GSD Bootstrap 完成

| 步骤 | 状态 |
|---|---|
| new-project | {skipped/completed} |
| map-codebase | {skipped/completed} |
| ops-audit | {skipped/completed} |
| plan-phase {TARGET_PHASE} | {skipped/completed} |
| execute-phase {TARGET_PHASE} | {completed} |
| verify-work {TARGET_PHASE} | {completed} |

当前阶段：{TARGET_PHASE}
验证状态：{VERIFY_STATUS}

继续执行：
/gsd:autonomous --from {TARGET_PHASE}
```

</step>

</process>

<success_criteria>
- [ ] 检测到项目未初始化时自动运行 new-project
- [ ] 检测到已有映射时跳过 map-codebase
- [ ] 已有运维文档时执行审计，没有时提示初始化
- [ ] 已有计划时跳过 plan-phase
- [ ] 执行完成后进入 verify-work
- [ ] 输出完整汇总报告
- [ ] 重复运行是安全的（跳过已完成步骤）
</success_criteria>
