<purpose>
展示完整的项目统计信息，包括阶段、计划、需求、git 指标和时间线。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="gather_stats">
收集项目统计信息：

```bash
STATS=$(node "$GSD_TOOLS" stats json)
if [[ "$STATS" == @file:* ]]; then STATS=$(cat "${STATS#@file:}"); fi
```

从 JSON 中提取字段：`milestone_version`、`milestone_name`、`phases`、`phases_completed`、`phases_total`、`total_plans`、`total_summaries`、`percent`、`plan_percent`、`requirements_total`、`requirements_complete`、`git_commits`、`git_first_commit_date`、`last_activity`。
</step>

<step name="present_stats">
按如下格式展示给用户：

```
# 项目统计 - {milestone_version} {milestone_name}

## 进度
[████░░░░░░] X/Y 个阶段（Z%）

## 计划
X/Y 个计划已完成（Z%）

## 阶段
| 阶段 | 名称 | 计划数 | 已完成 | 状态 |
|------|------|--------|--------|------|
| ...  | ...  | ...    | ...    | ...  |

## 需求
已完成 X/Y 条需求

## Git
- **提交数：** N
- **开始日期：** YYYY-MM-DD
- **最近活动：** YYYY-MM-DD

## 时间线
- **项目年龄：** N 天
```

如果不存在 `.planning/` 目录，提示用户先运行 `/gsd:new-project`。
</step>

</process>

<success_criteria>
- [ ] 已从项目状态中收集统计信息
- [ ] 已清晰格式化结果
- [ ] 已展示给用户
</success_criteria>
