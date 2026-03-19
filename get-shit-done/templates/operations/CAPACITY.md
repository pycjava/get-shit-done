---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/CAPACITY.md"
---

# 容量规划模板

用于 `.planning/operations/CAPACITY.md` 的模板，覆盖容量基线、预测与扩缩容策略。

<template>

```markdown
# 容量规划

**项目：** [项目名称]
**最后更新：** [YYYY-MM-DD]
**负责人：** [负责团队/人员]

---

## 容量目标

| 目标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| CPU 峰值余量 | [例如：>30%] | [current] | [On Track / Risk / Blocked] |
| 内存峰值余量 | [例如：>25%] | [current] | [On Track / Risk / Blocked] |
| 队列积压恢复 | [例如：<15 min] | [current] | [On Track / Risk / Blocked] |
| 存储增长预算 | [例如：每月 <10%] | [current] | [On Track / Risk / Blocked] |
| 成本上限 | [例如：<$X/month] | [current] | [On Track / Risk / Blocked] |

---

## 工作负载画像

### 流量特征

| 工作负载 | 常态 | 峰值 | 突发模式 | 备注 |
|----------|------|------|----------|------|
| API 请求 | [baseline] | [peak] | [daily/weekly/event-driven] | [notes] |
| 后台任务 | [baseline] | [peak] | [pattern] | [notes] |
| 定时任务 | [baseline] | [peak] | [pattern] | [notes] |
| 外部集成 | [baseline] | [peak] | [pattern] | [notes] |

### 数据增长

| 数据域 | 当前大小 | 月增长 | 峰值增长触发因素 | 保留策略 |
|--------|----------|--------|------------------|----------|
| 主数据库 | [size] | [growth] | [trigger] | [retention] |
| 对象存储 | [size] | [growth] | [trigger] | [retention] |
| 日志 | [size] | [growth] | [trigger] | [retention] |
| 备份 | [size] | [growth] | [trigger] | [retention] |

### 依赖上限

| 依赖 | 上限类型 | 当前使用量 | 上限 | 备注 |
|------|----------|------------|------|------|
| Database | Connections / throughput | [usage] | [limit] | [notes] |
| Cache | Memory / ops | [usage] | [limit] | [notes] |
| Queue | Throughput / depth | [usage] | [limit] | [notes] |
| Third-Party API | Rate limit | [usage] | [limit] | [notes] |

---

## 当前基线

### 服务基线

| 服务 | 副本数 / 规格 | CPU 峰值 | 内存峰值 | 延迟 P95 | 错误率 |
|------|---------------|----------|----------|----------|--------|
| [service-name] | [count/size] | [value] | [value] | [value] | [value] |
| [service-name] | [count/size] | [value] | [value] | [value] | [value] |

### 基础设施基线

| 资源 | 当前容量 | 平均利用率 | 峰值利用率 | 余量 |
|------|----------|------------|------------|------|
| Compute | [value] | [value] | [value] | [value] |
| Database | [value] | [value] | [value] | [value] |
| Cache | [value] | [value] | [value] | [value] |
| Storage | [value] | [value] | [value] | [value] |
| Network | [value] | [value] | [value] | [value] |

### 成本基线

| 区域 | 当前月成本 | 成本驱动项 | 预测敏感度 |
|------|------------|------------|------------|
| Compute | [cost] | [driver] | [high/medium/low] |
| Database | [cost] | [driver] | [high/medium/low] |
| Storage | [cost] | [driver] | [high/medium/low] |
| 可观测性 | [cost] | [driver] | [high/medium/low] |

---

## 预测

### 需求预测

| 时间范围 | 请求 / 任务量 | 存储增长 | 峰值并发 | 成本预估 |
|----------|---------------|----------|----------|----------|
| 接下来 30 天 | [forecast] | [forecast] | [forecast] | [estimate] |
| 接下来 90 天 | [forecast] | [forecast] | [forecast] | [estimate] |
| 接下来 12 个月 | [forecast] | [forecast] | [forecast] | [estimate] |

### 规划假设

- [关于用户或流量增长的假设]
- [关于发布、区域扩张或新客户的假设]
- [关于保留策略或数据扩张的假设]
- [关于供应商或基础设施上限的假设]

### 场景规划

| 场景 | 触发条件 | 预期影响 | 缓解措施 |
|------|----------|----------|----------|
| 计划发布 | [date/event] | [impact] | [mitigation] |
| 流量激增 | [condition] | [impact] | [mitigation] |
| 依赖变慢 | [condition] | [impact] | [mitigation] |
| 存储增长超预期 | [condition] | [impact] | [mitigation] |

---

## 扩缩容策略

### 扩缩容动作

| 约束 | 触发条件 | 动作 | 负责人 | 前置周期 |
|------|----------|------|--------|----------|
| Compute 饱和 | [threshold] | [scale out/up action] | [owner] | [lead time] |
| Database 饱和 | [threshold] | [action] | [owner] | [lead time] |
| Queue 积压 | [threshold] | [action] | [owner] | [lead time] |
| Storage 利用率 | [threshold] | [action] | [owner] | [lead time] |

### 与部署的耦合

- [更高负载下部署策略如何变化]
- [流量增长前必须验证什么]
- [饱和状态下回滚应如何执行]

### 成本控制

- [Reserved capacity / autoscaling / limits]
- [支出告警与审批路径]
- [低优先级工作负载削峰方案]

---

## 验证

### 负载与压力测试

| 测试 | 目标 | 环境 | 最近执行 | 结果 |
|------|------|------|----------|------|
| 基线负载测试 | 确认稳态上限 | [env] | [date] | [result] |
| 峰值负载测试 | 验证预期峰值 | [env] | [date] | [result] |
| 压力测试 | 找出崩溃点 | [env] | [date] | [result] |
| 恢复测试 | 验证饱和后的恢复能力 | [env] | [date] | [result] |

### 评审节奏

| 评审 | 频率 | 负责人 |
|------|------|--------|
| 余量评审 | 每周 | [owner] |
| 预测刷新 | 每月 | [owner] |
| 成本评审 | 每月 | [owner] |
| 扩容演练 | 每季度 | [owner] |

---

## 告警与触发器

| 信号 | Warning | Critical | 动作 |
|------|---------|----------|------|
| CPU 余量 | [threshold] | [threshold] | [action] |
| 内存余量 | [threshold] | [threshold] | [action] |
| 队列深度 | [threshold] | [threshold] | [action] |
| 数据库连接数 | [threshold] | [threshold] | [action] |
| 存储利用率 | [threshold] | [threshold] | [action] |
| 成本燃烧率 | [threshold] | [threshold] | [action] |

---

## 风险与瓶颈

| 风险 | 可能性 | 影响 | 缓解措施 | 负责人 |
|------|--------|------|----------|--------|
| [risk] | [L/M/H] | [L/M/H] | [mitigation] | [owner] |
| [risk] | [L/M/H] | [L/M/H] | [mitigation] | [owner] |

---

## 决策记录

| 日期 | 决策 | 原因 | 复审日期 |
|------|------|------|----------|
| [date] | [decision] | [why] | [date] |
| [date] | [decision] | [why] | [date] |

---

## 相关文档

- [OPERATIONS.md](./OPERATIONS.md) - 运维总览
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署流程
- [MONITORING.md](./MONITORING.md) - 监控与告警
- [RUNBOOK.md](./RUNBOOK.md) - 事故响应
- [BACKUP.md](./BACKUP.md) - 备份与恢复

---

*容量评审： [date]*
*在发布、持续增长变化或基础设施上限变化后更新*
```

</template>

<guidelines>

**这份文档是什么：**
- 容量基线与预测文档
- 扩缩容策略与触发器参考
- 负载验证与余量规划
- 成本与依赖上限可见性

**工作负载画像：**
- 记录常态、峰值与突发行为
- 包含数据增长与保留假设
- 标明第三方或平台上限

**当前基线：**
- 记录真实测得的基线，而不是猜测
- 跟踪每个关键资源的余量
- 当扩容影响预算时，一并记录成本驱动项

**预测：**
- 明确写出假设
- 在发布、迁移和客户增长后复审
- 使用多个时间范围，避免被动扩容

**扩缩容策略：**
- 明确定义触发条件与负责人
- 标注手动扩容需要的提前量
- 将扩容方案与部署、回滚流程关联起来

**验证：**
- 使用负载、压力和恢复测试
- 基线变化后刷新阈值
- 按固定节奏评审

**何时更新：**
- 发布或迁移前
- 流量或存储显著变化后
- 供应商上限或定价变化时
- 发生容量饱和导致的事故后

</guidelines>
