# 运维文档模式

GSD 项目中运维文档与流程的参考指南。

---

## 何时需要运维文档

| 项目阶段 | 建议的运维文档 |
|----------|----------------|
| Greenfield，早期 MVP | 最少只需要 `DEPLOYMENT.md` |
| Greenfield，预生产前 | 建议全部 7 份文档 |
| Brownfield，接手存量项目 | 建议全部 7 份文档 |
| 扩容 / 生产期 | 全部 7 份文档，外加定期审计 |

---

## 各文档用途

### OPERATIONS.md

**用途：** 运维策略、责任归属和环境状态的总入口。

**何时创建：** 始终创建。

### DEPLOYMENT.md

**用途：** 逐步部署与回滚流程。

**何时创建：** 只要环境不止本地开发，就应创建。

### MONITORING.md

**用途：** 可观测性栈、告警、仪表板与 SLO。

**何时创建：** 任何生产系统或面向用户的系统。

### CAPACITY.md

**用途：** 容量基线、预测、扩容拐点与余量目标。

**何时创建：** 当增长、峰值负载或固定基础设施上限已经重要时。

### RUNBOOK.md

**用途：** 事故响应流程与常见运维故障模式。

**何时创建：** 系统进入实际运行阶段后。

### BACKUP.md

**用途：** 备份、恢复与灾难恢复流程。

**何时创建：** 只要存在持久化数据存储。

### SECURITY-OPS.md

**用途：** 安全运维、Secrets 处理、访问控制与合规流程。

**何时创建：** 当系统处理用户数据、敏感系统或受监管工作负载时。

---

## 各文档关键章节

| 文档 | 关键章节 |
|------|----------|
| OPERATIONS.md | 目标、环境、CI/CD、责任人、升级路径 |
| DEPLOYMENT.md | 策略、checklist、流程、回滚、验证 |
| MONITORING.md | 栈、指标、告警、仪表板、SLO |
| CAPACITY.md | 基线负载、峰值假设、预测、瓶颈、扩容方案 |
| RUNBOOK.md | 严重级别、排障、沟通、postmortem |
| BACKUP.md | RTO/RPO、计划、恢复流程、DR 演练 |
| SECURITY-OPS.md | Auth、Secrets、扫描、事故、控制项 |

---

## 集成点

### 与 `/gsd:new-project`

初始项目搭建后，建议提供：

```text
/gsd:ops-runbook
```

优先从这些文档开始：
- `OPERATIONS.md`
- `DEPLOYMENT.md`
- 如果项目预计增长较快或基础设施受限，再补 `CAPACITY.md`

### 与 `/gsd:complete-milestone`

应复审：
- `OPERATIONS.md` 中的责任归属和环境漂移
- `DEPLOYMENT.md` 中的发布变化
- `MONITORING.md` 中的阈值和仪表板
- `CAPACITY.md` 中的预测和余量变化
- `RUNBOOK.md` 中的新事故记录

### 与 `/gsd:execute-phase`

可引用：
- `DEPLOYMENT.md` 处理发布相关工作
- `MONITORING.md` 处理指标与告警
- `CAPACITY.md` 处理扩缩容或负载敏感工作
- `RUNBOOK.md` 处理高风险运维变更

---

## 文档关系

```text
OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── CAPACITY.md
├── RUNBOOK.md
├── BACKUP.md
└── SECURITY-OPS.md

CAPACITY.md 会反向关联：
- DEPLOYMENT.md：扩容带来的发布变化
- MONITORING.md：触发信号来自哪里
- RUNBOOK.md：容量饱和事故如何处理
- BACKUP.md：存储增长对备份的影响
```

---

## 维护节奏

| 文档 | 复审频率 | 触发事件 |
|------|----------|----------|
| OPERATIONS.md | 每季度 | 团队变化、新环境 |
| DEPLOYMENT.md | 每次发布 | 新的部署流程 |
| MONITORING.md | 每季度 | 新功能、规模变化 |
| CAPACITY.md | 每月或每次发布 | 上线、增长变化、存储增长、新上限 |
| RUNBOOK.md | 每次事故后 | 新问题模式 |
| BACKUP.md | 每季度 | 新数据类型、合规变化 |
| SECURITY-OPS.md | 每季度 | 审计、事故、新威胁 |

---

## 快速参考命令

### 生成运维文档

```bash
/gsd:ops-runbook
```

### 审核运维覆盖情况

```bash
/gsd:ops-audit
```

### 查看运维状态

```bash
ls -la .planning/operations/
```

### 提交运维变更

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "ops: update [document]" --files .planning/operations/
```

---

## 常见文档组合

### 最小运维集（MVP）

```text
.planning/operations/
└── DEPLOYMENT.md
```

### 标准运维集（Production）

```text
.planning/operations/
├── OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── CAPACITY.md
├── RUNBOOK.md
└── BACKUP.md
```

### 完整运维集（Enterprise）

```text
.planning/operations/
├── OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── CAPACITY.md
├── RUNBOOK.md
├── BACKUP.md
└── SECURITY-OPS.md
```

---

## 反模式

**不要这样做：**
- 对一个几乎没有运维面的简单 CLI 工具也硬塞 7 份文档
- 当流量、存储或队列增长已经是问题时，却跳过 `CAPACITY.md`
- 直接复制模板却不替换 placeholder
- 让阈值、责任人或评审日期一直留空

**应该这样做：**
- 让文档深度匹配项目复杂度
- 明确记录阈值和余量假设
- 把扩容方案与监控、部署文档交叉关联
- 在上线、迁移和增长明显变化后复审容量

---

*最后更新：2026*
*属于 GSD Operations Suite*
