---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/MONITORING.md"
---

# Monitoring 模板

用于生成 `.planning/operations/MONITORING.md`，覆盖监控、告警与可观测性配置。

<template>

```markdown
# 监控与告警

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]

---

## 可观测性技术栈

### 工具总览

| Layer | Tool | Purpose | Retention |
|-------|------|---------|-----------|
| Metrics | [如 Prometheus, Datadog] | Time-series data | [如 30 days] |
| Logs | [如 CloudWatch, ELK] | Log aggregation | [如 14 days] |
| Traces | [如 Jaeger, X-Ray] | Distributed tracing | [如 7 days] |
| Dashboards | [如 Grafana, Datadog] | Visualization | N/A |
| Alerts | [如 PagerDuty, Opsgenie] | Alert routing | N/A |

### 架构

```
Application
    -> Metrics -> [Metrics Store] -> [Dashboards]
    -> Logs -> [Log Store]
    -> Traces -> [Trace Store]
                         -> [Alert Manager]
                         -> [On-Call Team]
```

---

## 关键指标

### Golden Signals（RED Method）

| Metric | Description | Warning | Critical |
|--------|-------------|---------|----------|
| **Rate** | Requests per second | [threshold] | [threshold] |
| **Errors** | Error rate (%) | [threshold] | [threshold] |
| **Duration** | Response time (P95) | [threshold] | [threshold] |

### USE Method（资源侧）

| Resource | Utilization | Saturation | Errors |
|----------|-------------|------------|--------|
| CPU | [threshold] | [threshold] | N/A |
| Memory | [threshold] | [threshold] | N/A |
| Disk I/O | [threshold] | [threshold] | [threshold] |
| Network | [threshold] | [threshold] | [threshold] |

### 应用指标

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `[metric_name]` | Counter/Gauge/Histogram | [description] | [threshold] |
| `[metric_name]` | Counter/Gauge/Histogram | [description] | [threshold] |

### 业务指标

| Metric | Description | Target | Current |
|--------|-------------|--------|---------|
| Active Users | DAU | [target] | [current] |
| Conversion Rate | Sign-ups / visits | [target] | [current] |
| Revenue | Daily revenue | [target] | [current] |

---

## 容量信号

### Headroom 与饱和度

| Signal | Why It Matters | Warning | Critical |
|--------|----------------|---------|----------|
| CPU Headroom | 反映峰值时剩余算力缓冲 | [threshold] | [threshold] |
| Memory Headroom | 提前发现泄漏或内存打满风险 | [threshold] | [threshold] |
| Queue Depth | 发现后台需求已经超过吞吐能力 | [threshold] | [threshold] |
| Database Connections | 暴露连接池或实例上限逼近情况 | [threshold] | [threshold] |
| Storage Growth | 追踪保留策略或备份增长是否需调整 | [threshold] | [threshold] |

---

## 告警规则

### Critical Alerts（立即呼叫）

| Alert | Condition | Response Time | Runbook |
|-------|-----------|---------------|---------|
| Service Down | Health check fails > 2min | 5min | [Link] |
| Error Rate High | Error rate > 5% for 5min | 5min | [Link] |
| Response Time Critical | P95 > 2s for 5min | 10min | [Link] |
| Database Connection Failed | DB unreachable | 5min | [Link] |

### Warning Alerts（通知但不立即呼叫）

| Alert | Condition | Response Time | Runbook |
|-------|-----------|---------------|---------|
| Error Rate Elevated | Error rate > 1% for 10min | 30min | [Link] |
| Response Time Degraded | P95 > 500ms for 10min | 30min | [Link] |
| Memory Usage High | Memory > 80% for 15min | 1hr | [Link] |
| Disk Space Low | Disk > 85% used | 4hr | [Link] |

### 告警路由

| Severity | Channel | Recipients |
|----------|---------|------------|
| Critical | PagerDuty + Slack | On-call + Team channel |
| Warning | Slack | Team channel |
| Info | Email | Team mailing list |

---

## Dashboards

### 主仪表盘

**Purpose:** 提供系统健康的高层视图

| Panel | Metric | Visualization |
|-------|--------|---------------|
| Request Rate | Requests/sec | Line graph |
| Error Rate | Errors/sec, % | Line graph + Stat |
| Response Time | P50, P95, P99 | Line graph |
| Active Users | Current users | Stat |
| System Health | Up/Down status | Status panel |

### 应用仪表盘

**Purpose:** 展示更细的应用层指标

| Panel | Metric | Visualization |
|-------|--------|---------------|
| Endpoint Performance | Latency by endpoint | Heatmap |
| Database Queries | Query time distribution | Histogram |
| Cache Hit Rate | Hit/Miss ratio | Pie chart |
| Background Jobs | Queue depth, processing time | Line graph |

### 基础设施仪表盘

**Purpose:** 展示资源利用率

| Panel | Metric | Visualization |
|-------|--------|---------------|
| CPU Usage | By service | Line graph |
| Memory Usage | By service | Line graph |
| Disk I/O | Read/Write | Line graph |
| Network Traffic | In/Out | Line graph |

---

## 日志策略

### 日志级别

| Level | Usage | Examples |
|-------|-------|----------|
| ERROR | 需要关注的失败 | Unhandled exceptions, service failures |
| WARN | 潜在问题 | Deprecated API use, retry attempts |
| INFO | 重要事件 | Request start/end, state changes |
| DEBUG | 详细诊断信息 | Variable values, flow tracing |

### 日志格式

```json
{
  "timestamp": "ISO8601",
  "level": "ERROR|WARN|INFO|DEBUG",
  "service": "service-name",
  "trace_id": "correlation-id",
  "message": "Human readable message",
  "context": {
    "key": "value"
  }
}
```

### 日志保留

| Environment | Retention | Reason |
|-------------|-----------|--------|
| Development | 7 days | Debugging |
| Staging | 14 days | Testing, debugging |
| Production | 30 days | Compliance, debugging |

---

## Distributed Tracing

### Trace 配置

| Setting | Value |
|---------|-------|
| Sampling Rate | [如 10% of requests] |
| Max Spans per Trace | [如 1000] |
| Propagation Format | [如 W3C Trace Context] |

### 关键 Span

| Span Name | Service | Purpose |
|-----------|---------|---------|
| `http.request` | API Gateway | Incoming requests |
| `db.query` | Database | Database operations |
| `cache.get/set` | Cache | Cache operations |
| `external.api` | External | Third-party calls |

---

## SLO / SLI 定义

### Service Level Objectives

| SLO | Target | Measurement Window | Current |
|-----|--------|-------------------|---------|
| Availability | 99.9% | Monthly | [current] |
| Latency (P95) | < 200ms | Monthly | [current] |
| Error Rate | < 0.1% | Monthly | [current] |

### Error Budget

| Metric | Value |
|--------|-------|
| Monthly Budget | [如 43.2 min downtime] |
| Remaining | [current remaining] |
| Last Reset | [date] |

---

## On-Call 流程

### 告警响应

```
1. 5 分钟内确认告警
2. 判断严重程度
3. 查阅已知 runbook
4. 用 dashboard / logs 调查
5. 向团队同步状态
6. 解决或升级
7. 记录 incident
```

### 升级触发条件

- 告警 10 分钟内无人确认
- 30 分钟内无法定位问题
- 1 小时内没有明显解决进展
- 已确认影响真实用户

---

## 监控维护

### 常规任务

| Task | Frequency | Owner |
|------|-----------|-------|
| Review alert thresholds | Monthly | On-call lead |
| Update dashboards | As needed | Team |
| Audit log retention | Quarterly | Ops team |
| Test alert routing | Monthly | On-call |

### 告警调优

| Metric | Last Tuned | Reason |
|--------|------------|--------|
| [Alert name] | [Date] | [Reason for change] |

---

## 相关文档

- [CAPACITY.md](./CAPACITY.md) - 容量基线与扩缩容计划
- [OPERATIONS.md](./OPERATIONS.md) - Operations 总览
- [RUNBOOK.md](./RUNBOOK.md) - 故障响应
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署流程

---

*Monitoring audit: [date]*  
*监控要求变化时及时更新*
```

</template>

<guidelines>

**这份文档是什么：**
- 监控与告警配置
- 关键指标和阈值
- Dashboard 定义
- SLO / SLI 跟踪

**可观测性技术栈：**
- 记录所有监控工具
- 标明保留周期
- 尽量附带架构图

**关键指标：**
- 服务侧优先用 RED method（Rate、Errors、Duration）
- 资源侧优先用 USE method（Utilization、Saturation、Errors）
- 业务指标也应纳入上下文

**告警规则：**
- 区分 critical 与 warning
- 定义清晰响应时限
- 关联 runbook
- 记录路由路径

**Dashboards：**
- 每个 dashboard 都应有明确目的
- 配置关键可视化
- 系统演进时同步更新

**日志：**
- 统一日志格式
- 明确日志级别语义
- 设置合理的保留周期

**SLO / SLI：**
- 目标要现实
- 跟踪 error budget
- 定期复核

**On-Call：**
- 定义响应流程
- 明确升级条件
- 记录责任归属

</guidelines>
