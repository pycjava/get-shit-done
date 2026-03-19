---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/OPERATIONS.md"
---

# Operations 总览模板

用于生成 `.planning/operations/OPERATIONS.md`，即运维策略总览文档。

<template>

```markdown
# Operations 总览

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]
**Owner:** [负责团队 / 负责人]

---

## 运维策略

### 方法观

[用一段话描述运维方法观：
- 团队如何看待可靠性、可用性与可维护性
- 做运维决策时遵循哪些原则
- 如何平衡速度与稳定性]

### 核心目标

| Objective | Target | Current | Status |
|-----------|--------|---------|--------|
| Capacity Headroom | [如 >30% at peak] | [current] | [On Track / Risk / Blocked] |
| Availability | [如 99.9%] | [current %] | [✅ / ⚠️ / ❌] |
| Response Time (P95) | [如 <200ms] | [current] | [✅ / ⚠️ / ❌] |
| Deployment Frequency | [如 daily] | [current] | [✅ / ⚠️ / ❌] |
| Mean Time to Recovery | [如 <1hr] | [current] | [✅ / ⚠️ / ❌] |
| Change Failure Rate | [如 <5%] | [current] | [✅ / ⚠️ / ❌] |

---

## 环境配置

### 环境层级

| Environment | Purpose | URL | Auto-Deploy |
|-------------|---------|-----|-------------|
| Development | 功能开发 | [URL] | 推送到 `develop` 时 |
| Staging | 生产前测试 | [URL] | merge 到 `main` 时 |
| Production | 面向真实用户 | [URL] | 手动批准 |

### 配置管理

| Config Type | Storage | Rotation | Access |
|-------------|---------|----------|--------|
| Environment Variables | [如 Vercel Dashboard] | [frequency] | [who can access] |
| Secrets | [如 Vault, AWS Secrets] | [frequency] | [who can access] |
| Feature Flags | [如 LaunchDarkly] | N/A | [who can access] |

---

## CI/CD Pipeline

### Pipeline 总览

```
[用图示或文字描述 CI/CD 流程]
Commit -> Build -> Test -> Deploy
```

### Pipeline 阶段

| Stage | Trigger | Duration | Critical Checks |
|-------|---------|----------|-----------------|
| Build | 每次 push | ~[X]min | Compilation, lint |
| Test | Build 之后 | ~[X]min | Unit, integration |
| Security Scan | Test 之后 | ~[X]min | SAST, dependency |
| Deploy (Dev) | `develop` 更新后 | ~[X]min | Smoke tests |
| Deploy (Prod) | 手动触发 | ~[X]min | Canary, rollback ready |

### 部署策略

- **Strategy:** [Blue-Green / Rolling / Canary / Feature Flags]
- **Rollback:** [Automated / Manual] - [触发条件]
- **Maintenance Windows:** [何时 / 无]

---

## 团队职责

### On-Call 轮值

| Role | Primary | Backup | Schedule |
|------|---------|--------|----------|
| [Role 1] | [Person/Team] | [Person/Team] | [Rotation] |
| [Role 2] | [Person/Team] | [Person/Team] | [Rotation] |

### 升级路径

```
Level 1: On-Call Engineer（响应：5min）
    -> 15min 未解决
Level 2: Senior Engineer（响应：15min）
    -> 30min 未解决
Level 3: Engineering Manager（响应：30min）
    -> 1hr 未解决
Level 4: VP Engineering（响应：1hr）
```

---

## 关键运维决策

| Decision | Rationale | Date | Outcome |
|----------|-----------|------|---------|
| [Decision 1] | [Why] | [Date] | [✅ / ⚠️ / ❌] |
| [Decision 2] | [Why] | [Date] | [✅ / ⚠️ / ❌] |

---

## 相关文档

- [CAPACITY.md](./CAPACITY.md) - 容量基线与扩缩容计划
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署流程
- [MONITORING.md](./MONITORING.md) - 监控与告警
- [RUNBOOK.md](./RUNBOOK.md) - 故障响应
- [BACKUP.md](./BACKUP.md) - 备份与恢复
- [SECURITY-OPS.md](./SECURITY-OPS.md) - 安全运维

---

*Operations audit: [date]*  
*运维要求发生变化时及时更新*
```

</template>

<guidelines>

**这份文档是什么：**
- 高层运维策略总览
- 定义运维目标与目标值
- 记录环境配置方式
- 概述 CI/CD pipeline
- 明确团队职责

**核心目标：**
- 尽可能使用 DORA 指标
- 目标要现实且可度量
- 保留当前状态，方便对比
- 至少按季度更新一次，或在目标变化时更新

**环境配置：**
- 记录所有环境
- 明确配置存储位置
- 标出 secret 轮换周期
- 说明访问控制方式

**CI/CD Pipeline：**
- 图示能显著提高可理解性
- 记录每个阶段的大致耗时
- 标明关键检查项
- 说明部署策略和回滚方式

**团队职责：**
- On-call 轮值必须清晰
- 升级路径和响应时限必须明确
- 团队变化时及时同步

**关键运维决策：**
- 跟踪重要运维选择
- 给出理由，方便后续复盘
- 标出结果，帮助沉淀经验

**何时更新：**
- 新增环境
- CI/CD 流程变化
- 团队结构变化
- 运维目标调整
- 发生重大事故之后

</guidelines>
