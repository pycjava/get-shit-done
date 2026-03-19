<purpose>
验证 `.planning/` 目录的完整性，并给出可执行的问题报告。检查缺失文件、无效配置、状态不一致、孤儿计划等问题，并在可能时自动修复。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="parse_args">
**解析参数：**

检查命令参数中是否带有 `--repair`。

```
REPAIR_FLAG=""
if arguments contain "--repair"; then
  REPAIR_FLAG="--repair"
fi
```
</step>

<step name="run_health_check">
**执行 health 校验：**

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" validate health $REPAIR_FLAG
```

解析 JSON 输出：
- `status`: `"healthy"` | `"degraded"` | `"broken"`
- `errors[]`: 严重问题（code, message, fix, repairable）
- `warnings[]`: 非严重问题
- `info[]`: 提示信息
- `repairable_count`: 可自动修复的问题数量
- `repairs_performed[]`: 如果用了 `--repair`，这里记录实际修复动作
</step>

<step name="format_output">
**格式化并展示结果：**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD 健康检查
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

状态：HEALTHY | DEGRADED | BROKEN
错误：N | 警告：N | 信息：N
```

**如果执行了修复：**
```
## 已执行修复

- 已创建 config.json 默认配置
- 已根据 roadmap 重建 STATE.md
```

**如果存在 errors：**
```
## 错误

- [E001] config.json：第 5 行 JSON 解析失败
  修复：运行 /gsd:health --repair 重置为默认值

- [E002] 未找到 PROJECT.md
  修复：运行 /gsd:new-project 创建
```

**如果存在 warnings：**
```
## 警告

- [W001] STATE.md 引用了阶段 5，但磁盘上只有阶段 1-3
  修复：运行 /gsd:health --repair 重新生成

- [W005] 阶段目录 "1-setup" 不符合 NN-name 命名格式
  修复：手动重命名为规范格式（例如 01-setup）
```

**如果存在 info：**
```
## 信息

- [I001] 02-implementation/02-01-PLAN.md 还没有 SUMMARY.md
  说明：可能仍在执行中
```

**如果存在可修复问题，且本次没有使用 `--repair`：**
```
---
有 N 个问题可自动修复。运行：/gsd:health --repair
```
</step>

<step name="offer_repair">
**如果存在可修复问题，且本次没有使用 `--repair`：**

询问用户是否要自动修复：

```
是否要运行 /gsd:health --repair，自动修复 N 个问题？
```

如果用户同意，则带 `--repair` 重新运行并展示结果。
</step>

<step name="verify_repairs">
**如果执行过修复：**

不带 `--repair` 再运行一次 health check，确认问题已解决：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" validate health
```

然后汇报最终状态。
</step>

</process>

<error_codes>

| Code | Severity | Description | Repairable |
|------|----------|-------------|------------|
| E001 | error | 未找到 `.planning/` 目录 | No |
| E002 | error | 未找到 `PROJECT.md` | No |
| E003 | error | 未找到 `ROADMAP.md` | No |
| E004 | error | 未找到 `STATE.md` | Yes |
| E005 | error | `config.json` 解析失败 | Yes |
| W001 | warning | `PROJECT.md` 缺少必需区块 | No |
| W002 | warning | `STATE.md` 引用了无效阶段 | Yes |
| W003 | warning | 未找到 `config.json` | Yes |
| W004 | warning | `config.json` 中字段值非法 | No |
| W005 | warning | 阶段目录命名不符合规范 | No |
| W006 | warning | `ROADMAP` 中有阶段，但磁盘没有对应目录 | No |
| W007 | warning | 磁盘上有阶段目录，但 `ROADMAP` 中没有 | No |
| W008 | warning | `config.json` 缺少 `workflow.nyquist_validation`（默认仍视为启用，但 agent 可能跳过） | Yes |
| W009 | warning | `RESEARCH.md` 含 Validation Architecture，但没有 `VALIDATION.md` | No |
| I001 | info | 有 PLAN 没有 SUMMARY（可能还在进行） | No |

</error_codes>

<repair_actions>

| Action | Effect | Risk |
|--------|--------|------|
| createConfig | 用默认值创建 `config.json` | None |
| resetConfig | 删除并重建 `config.json` | 会丢失自定义设置 |
| regenerateState | 按 `ROADMAP` 结构重建 `STATE.md` | 会丢失会话历史 |
| addNyquistKey | 向 `config.json` 添加 `workflow.nyquist_validation: true` | None，符合现有默认行为 |

**以下内容不自动修复（风险太高）：**
- `PROJECT.md` / `ROADMAP.md` 正文内容
- 阶段目录重命名
- 孤儿计划清理

</repair_actions>
