# 总结模板

用于生成 `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`。

要求：
- frontmatter 键名保持英文，便于工具读取
- 面向人的标题、表头和正文使用中文
- 一句话总结必须具体，不要写“阶段完成”“实现完成”这种空话
- 如果计划声明了 `golden_signal`，总结里必须明确写出该信号的现状、风险、阈值 / 告警候选和 runbook 影响

---

## 文件模板

```markdown
---
phase: XX-name
plan: YY
subsystem: [主要类别，如 api, database, infra, monitoring, alerting, runbook ...]
tags: [可检索技术标签]

# Dependency graph
requires:
  - phase: [依赖的前置阶段]
    provides: [该阶段提供了什么]
provides:
  - [本计划交付了什么]
affects: [后续会受影响的阶段或关键词]

signal-focus:
  primary: [latency|traffic|errors|saturation|mixed|none]
  secondary: []

monitoring-coverage:
  metrics_added: []
  dashboards_touched: []
  alerts_added: []
  gaps_remaining: []

alert-candidates:
  - signal: latency
    condition: [例如 P95 > 800ms 持续 10 分钟]
    severity: [warning|critical]
    action: [先看哪里]

runbook-impact:
  updated: []
  follow_up: []

business-watchpoints:
  - "[需要重点关注的业务结果或风险点]"

# Tech tracking
tech-stack:
  added: [新增库 / 工具]
  patterns: [建立的模式]

key-files:
  created: [关键新文件]
  modified: [关键修改文件]

key-decisions:
  - "决策 1"
  - "决策 2"

patterns-established:
  - "模式 1：描述"
  - "模式 2：描述"

requirements-completed: []  # REQUIRED：从 PLAN.md frontmatter 的 requirements 原样复制

# Metrics
duration: Xmin
completed: YYYY-MM-DD
---

# 阶段 [X]：[Name] 总结

**[用一句有信息量的话概括本次产出]**

## 执行概况

- **耗时：** [time]
- **开始时间：** [ISO timestamp]
- **完成时间：** [ISO timestamp]
- **完成任务：** [count completed]
- **修改文件：** [count]

## 信号结论

- **主信号：** [latency / traffic / errors / saturation / none]
- **当前现状：** [基线、现有数据、已知缺口]
- **主要风险：** [用户体验 / 业务 / 发布 / 值班影响]
- **阈值 / 观察项：** [告警阈值、观察窗口、升级条件]

## 监控覆盖与告警候选

- [新增或确认的指标]
- [新增或确认的仪表盘]
- [新增或确认的告警候选]
- [仍然缺失的采集或阈值]

## 业务关注点

- [业务链路 1：为什么重要]
- [业务链路 2：什么情况下要报警]
- [如果没有，写“无”]

## 文档与手册影响

- **已更新：** [MONITORING.md / RUNBOOK.md / DEPLOYMENT.md / 其他]
- **下次部署前还需补齐：** [follow-up items]

## 任务提交记录

每个任务都应原子提交：
1. **任务 1：[任务名称]** - `abc123f` (docs/fix/perf/chore...)
2. **任务 2：[任务名称]** - `def456g` (docs/fix/perf/chore...)
3. **任务 3：[任务名称]** - `hij789k` (docs/fix/perf/chore...)

**计划元数据提交：** `lmn012o` (docs: complete plan)

## 创建 / 修改的文件

- `path/to/file.ts` - 文件作用
- `path/to/another.ts` - 文件作用

## 已作决策

[关键决策及其原因；如果没有，写“无——按计划执行”]

## 偏离计划

[如果没有偏离：写“无——完全按计划原样执行”]

[如果有偏离：]

### 自动修复的问题

**1. [Rule X - Category] 简述**

- **发现于：** 任务 [N]（[任务名称]）
- **问题：** [哪里有问题]
- **修复：** [做了什么]
- **修改文件：** [file paths]
- **验证方式：** [如何验证]
- **提交记录：** [hash]

---

**总偏差数：** [N]
**对计划的影响：** [简短评估]

## 遇到的问题

[执行过程中遇到的问题及处理方式；如果没有，写“无”]

## 用户需要完成的设置

[如果生成了 USER-SETUP.md：]
**外部服务仍需人工配置。** 详见 [{phase}-USER-SETUP.md](./{phase}-USER-SETUP.md)：
- 需要补充的环境变量
- 控制台 / 仪表盘配置步骤
- 验证命令

[如果没有 USER-SETUP.md：]
无——不需要额外人工配置。

## 下一次发布 / 部署前关注

- [发布前必须确认的信号]
- [部署后第一观察窗需要看的指标]
- [值班或回滚注意事项]

## 下一阶段准备情况

[下一阶段已经具备的条件]
[阻塞项或注意事项]

---
*阶段：XX-name*  
*完成时间：[date]*
```

---

## 编写规则

- frontmatter 必须完整
- 一句话总结要可感知、可复述，例如“补齐登录链路的延迟基线、阈值和发布后观察项”
- `signal-focus`、`monitoring-coverage`、`alert-candidates`、`runbook-impact` 是这次运维版改造新增的关键字段
- “业务关注点”要写真实会影响值班和告警优先级的链路
- 如果计划没有 `golden_signal`，也要说明它支撑了哪类运维分析输出
