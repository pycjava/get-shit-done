---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/OPERATIONS.md"
---

# 运维总览模板

用于生成 `.planning/operations/OPERATIONS.md`，即运维策略总览文档。

<template>

```markdown
# 运维总览

**项目：** [项目名称]
**最后更新：** [YYYY-MM-DD]
**负责人：** [负责团队 / 负责人]

---

## 运维策略

### 方法观

[用一段话描述运维方法观：
- 团队如何看待可靠性、可用性与可维护性
- 做运维决策时遵循哪些原则
- 如何平衡速度与稳定性]

### 核心目标

| 目标项 | 目标值 | 当前值 | 状态 |
|--------|--------|--------|------|
| 容量余量 | [如 >30% at peak] | [current] | [On Track / Risk / Blocked] |
| 可用性 | [如 99.9%] | [current %] | [✅ / ⚠️ / ❌] |
| 响应时间（P95） | [如 <200ms] | [current] | [✅ / ⚠️ / ❌] |
| 部署频率 | [如 weekly / manual trigger] | [current] | [✅ / ⚠️ / ❌] |
| 平均恢复时间 | [如 <1hr] | [current] | [✅ / ⚠️ / ❌] |
| 变更失败率 | [如 <5%] | [current] | [✅ / ⚠️ / ❌] |

---

## 环境配置

### 环境层级

| 环境 | 用途 | URL | 部署触发方式 |
|------|------|-----|--------------|
| 开发环境 | 功能开发 | [URL] | [如手动触发 / 按需] |
| 预发环境 | 生产前测试 | [URL] | [如手动触发 / 发布前] |
| 生产环境 | 面向真实用户 | [URL] | 手动触发 |

### 配置管理

| 配置类型 | 存储位置 | 轮换频率 | 访问权限 |
|----------|----------|----------|----------|
| 环境变量 | [如 Vercel Dashboard] | [frequency] | [who can access] |
| 密钥/凭据 | [如 Vault, AWS Secrets] | [frequency] | [who can access] |
| 功能开关 | [如 LaunchDarkly] | N/A | [who can access] |

---

## CI/CD 流水线

### 流水线总览

```
[用图示或文字描述 CI/CD 流程]
Commit -> Build -> Test -> Deploy
```

### 流水线阶段

| 阶段 | 触发条件 | 耗时 | 关键检查 |
|------|----------|------|----------|
| 构建 | 每次 push | ~[X]min | Compilation, lint |
| 测试 | Build 之后 | ~[X]min | Unit, integration |
| 安全扫描 | Test 之后 | ~[X]min | SAST, dependency |
| 部署（开发） | `develop` 更新后 | ~[X]min | Smoke tests |
| 部署（生产） | 手动触发 | ~[X]min | Canary, rollback ready |

### 部署策略

- **策略：** [Blue-Green / Rolling / Canary / Feature Flags]
- **回滚：** [Automated / Manual] - [触发条件]
- **维护窗口：** [何时 / 无]

---

## 团队职责

### 值班轮值

| 角色 | 主值班 | 备值班 | 排班 |
|------|--------|--------|------|
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

| 决策 | 原因 | 日期 | 结果 |
|------|------|------|------|
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

*运维审计：[date]*  
*重大部署、运维要求变化或事故复盘后更新*
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
- 至少按季度复核一次，且在重大部署、目标变化或事故复盘后更新

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
