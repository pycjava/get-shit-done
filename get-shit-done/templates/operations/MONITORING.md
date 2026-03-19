---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/MONITORING.md"
---

# 监控模板

用于生成 `.planning/operations/MONITORING.md`，覆盖监控、告警与可观测性配置。

<template>

```markdown
# 监控与告警

**项目：** [项目名称]
**最后更新：** [YYYY-MM-DD]

---

## 可观测性技术栈

### 工具总览

| 层级 | 工具 | 用途 | 保留期 |
|------|------|------|--------|
| 指标 | [如 Prometheus, Datadog] | 时序指标数据 | [如 30 days] |
| 日志 | [如 CloudWatch, ELK] | 日志聚合 | [如 14 days] |
| 链路追踪 | [如 Jaeger, X-Ray] | 分布式追踪 | [如 7 days] |
| 仪表盘 | [如 Grafana, Datadog] | 可视化展示 | N/A |
| 告警 | [如 PagerDuty, Opsgenie] | 告警路由 | N/A |

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

### 四大黄金信号（Google SRE）

| 信号 | 说明 | 警告阈值 | 严重阈值 |
|------|------|----------|----------|
| **Latency** | 响应时间、队列等待、关键链路耗时（建议记录 P50 / P95 / P99） | [threshold] | [threshold] |
| **Traffic** | 请求量、吞吐量、任务量、峰值流量模式 | [threshold] | [threshold] |
| **Errors** | 错误率、失败请求、业务失败、重试风暴 | [threshold] | [threshold] |
| **Saturation** | CPU / 内存 / 队列 / 连接池 / 磁盘等逼近上限情况 | [threshold] | [threshold] |

### USE 方法（资源侧）

| 资源 | 利用率 | 饱和度 | 错误 |
|------|--------|--------|------|
| CPU | [threshold] | [threshold] | N/A |
| Memory | [threshold] | [threshold] | N/A |
| Disk I/O | [threshold] | [threshold] | [threshold] |
| Network | [threshold] | [threshold] | [threshold] |

### 应用指标

| 指标 | 类型 | 说明 | 告警阈值 |
|------|------|------|----------|
| `[metric_name]` | Counter/Gauge/Histogram | [description] | [threshold] |
| `[metric_name]` | Counter/Gauge/Histogram | [description] | [threshold] |

### 业务指标

| 指标 | 说明 | 目标值 | 当前值 |
|------|------|--------|--------|
| 活跃用户 | DAU | [target] | [current] |
| 转化率 | 注册数 / 访问数 | [target] | [current] |
| 收入 | 日收入 | [target] | [current] |

### 业务告警关注点

| 业务点 | 异常信号 | 关联黄金信号 | 告警触发条件 | 处理提示 |
|--------|----------|--------------|--------------|----------|
| [例如：登录成功率] | [例如：成功率骤降] | Errors | [threshold] | [先看认证服务 / 第三方依赖] |
| [例如：支付确认链路] | [例如：确认耗时飙升] | Latency | [threshold] | [先看支付回调 / 队列积压] |
| [例如：活动峰值流量] | [例如：流量超预测] | Traffic | [threshold] | [先看限流 / 扩容 / 缓存命中] |
| [例如：库存写入链路] | [例如：队列深度持续上升] | Saturation | [threshold] | [先看消费者吞吐 / DB 连接池] |

---

## 容量信号

### 容量余量与饱和度

| 信号 | 关注原因 | 警告阈值 | 严重阈值 |
|------|----------|----------|----------|
| CPU 余量 | 反映峰值时剩余算力缓冲 | [threshold] | [threshold] |
| 内存余量 | 提前发现泄漏或内存打满风险 | [threshold] | [threshold] |
| 队列深度 | 发现后台需求已经超过吞吐能力 | [threshold] | [threshold] |
| 数据库连接数 | 暴露连接池或实例上限逼近情况 | [threshold] | [threshold] |
| 存储增长 | 追踪保留策略或备份增长是否需调整 | [threshold] | [threshold] |

---

## 告警规则

### 严重告警（立即呼叫）

| 告警 | 条件 | 响应时限 | 处理手册 |
|------|------|----------|----------|
| 服务不可用 | 健康检查失败持续 > 2min | 5min | [Link] |
| 错误率过高 | 错误率 > 5% 持续 5min | 5min | [Link] |
| 响应时间严重恶化 | P95 > 2s 持续 5min | 10min | [Link] |
| 数据库连接失败 | DB 不可达 | 5min | [Link] |

### 警告告警（通知但不立即呼叫）

| 告警 | 条件 | 响应时限 | 处理手册 |
|------|------|----------|----------|
| 错误率升高 | 错误率 > 1% 持续 10min | 30min | [Link] |
| 响应时间变差 | P95 > 500ms 持续 10min | 30min | [Link] |
| 内存使用率过高 | 内存 > 80% 持续 15min | 1hr | [Link] |
| 磁盘空间不足 | 磁盘使用率 > 85% | 4hr | [Link] |

### 告警路由

| 严重级别 | 通知渠道 | 接收人 |
|----------|----------|--------|
| 严重 | PagerDuty + Slack | On-call + Team channel |
| 警告 | Slack | Team channel |
| 信息 | Email | Team mailing list |

---

## 仪表盘

### 主仪表盘

**目的：** 提供系统健康的高层视图

| 面板 | 指标 | 可视化方式 |
|------|------|------------|
| 请求速率 | Requests/sec | 折线图 |
| 错误率 | Errors/sec, % | 折线图 + 统计卡 |
| 响应时间 | P50, P95, P99 | 折线图 |
| 活跃用户 | 当前用户数 | 统计卡 |
| 系统健康 | Up/Down status | 状态面板 |

### 应用仪表盘

**目的：** 展示更细的应用层指标

| 面板 | 指标 | 可视化方式 |
|------|------|------------|
| 接口性能 | 按端点统计延迟 | 热力图 |
| 数据库查询 | 查询耗时分布 | 直方图 |
| 缓存命中率 | Hit/Miss ratio | 饼图 |
| 后台任务 | 队列深度、处理时长 | 折线图 |

### 基础设施仪表盘

**目的：** 展示资源利用率

| 面板 | 指标 | 可视化方式 |
|------|------|------------|
| CPU 使用率 | 按服务拆分 | 折线图 |
| 内存使用率 | 按服务拆分 | 折线图 |
| 磁盘 I/O | Read/Write | 折线图 |
| 网络流量 | In/Out | 折线图 |

---

## 日志策略

### 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
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

| 环境 | 保留期 | 原因 |
|------|--------|------|
| 开发环境 | 7 days | Debugging |
| 预发环境 | 14 days | Testing, debugging |
| 生产环境 | 30 days | Compliance, debugging |

---

## 分布式追踪

### Trace 配置

| 设置项 | 值 |
|--------|----|
| 采样率 | [如 10% of requests] |
| 每条 Trace 最大 Span 数 | [如 1000] |
| 传播格式 | [如 W3C Trace Context] |

### 关键 Span

| Span 名称 | 服务 | 用途 |
|-----------|------|------|
| `http.request` | API Gateway | 进入请求 |
| `db.query` | Database | 数据库操作 |
| `cache.get/set` | Cache | 缓存操作 |
| `external.api` | External | 第三方调用 |

---

## SLO / SLI 定义

### 服务级目标

| SLO | 目标值 | 观测窗口 | 当前值 |
|-----|--------|----------|--------|
| Availability | 99.9% | Monthly | [current] |
| Latency (P95) | < 200ms | Monthly | [current] |
| Error Rate | < 0.1% | Monthly | [current] |

### 错误预算

| 指标 | 值 |
|------|----|
| Monthly Budget | [如 43.2 min downtime] |
| Remaining | [current remaining] |
| Last Reset | [date] |

---

## 值班响应流程

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

| 任务 | 频率 | 负责人 |
|------|------|--------|
| 复核告警阈值 | Monthly | 值班负责人 |
| 更新仪表盘 | As needed | 团队 |
| 审计日志保留策略 | Quarterly | 运维团队 |
| 测试告警路由 | Monthly | 值班人员 |

### 告警调优

| 指标/告警 | 最近调优时间 | 原因 |
|-----------|--------------|------|
| [Alert name] | [Date] | [Reason for change] |

---

## 相关文档

- [CAPACITY.md](./CAPACITY.md) - 容量基线与扩缩容计划
- [OPERATIONS.md](./OPERATIONS.md) - 运维总览
- [RUNBOOK.md](./RUNBOOK.md) - 故障响应
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署流程

---

*监控审计：[date]*  
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
- 优先从四大黄金信号组织：Latency / Traffic / Errors / Saturation
- 资源余量仍然要看，但要放进 Saturation 视角
- 业务指标也应纳入上下文
- 业务告警关注点要明确写出对应信号与处理入口

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
