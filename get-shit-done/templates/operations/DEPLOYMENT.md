---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/DEPLOYMENT.md"
---

# Deployment 模板

用于生成 `.planning/operations/DEPLOYMENT.md`，即部署流程与部署策略文档。

<template>

```markdown
# 部署流程

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]

---

## 部署策略

### 策略概览

**Type:** [Blue-Green / Rolling / Canary / Feature Flags]

| Aspect | Configuration |
|--------|---------------|
| Strategy | [Type] |
| Rollback | [Automated / Manual] |
| Rollback Time | [如 <5min] |
| Zero-Downtime | [Yes / No] |

### 策略细节

[详细解释本项目所选的部署策略：
- 它在当前项目里如何运作
- 为什么选择它
- 有哪些取舍和前提]

---

## 部署前检查清单

### Code Review

- [ ] 所有 PR 至少有一位 reviewer 批准
- [ ] 没有未解决的 review comment
- [ ] 分支已同步到目标分支最新状态

### 测试

- [ ] 所有 unit tests 通过
- [ ] integration tests 通过
- [ ] E2E tests 通过（如适用）
- [ ] performance tests 通过（如适用）
- [ ] security scan 已完成

### 配置

- [ ] 环境变量已核对
- [ ] secrets 已按计划轮换（如适用）
- [ ] feature flags 已配置
- [ ] 已确认本次 rollout 流量下仍有足够 capacity headroom
- [ ] database migrations 已测试

### 沟通

- [ ] 已向团队宣布部署
- [ ] 如有维护窗口，已通知 stakeholders
- [ ] rollback plan 已写明

---

## 部署过程

### 分步流程

```
1. 部署前
   - 确认所有检查通过
   - 确认部署目标环境
   - 通知团队

2. 部署中
   - [Step 1：例如创建 release tag]
   - [Step 2：例如构建生产镜像]
   - [Step 3：例如先部署到 canary]
   - [Step 4：例如观察 canary 10 分钟]
   - [Step 5：例如提升为全量]

3. 部署后
   - 验证 health checks
   - 运行 smoke tests
   - 监控错误率
   - 确认部署成功
```

### 部署命令

| Environment | Command | Duration |
|-------------|---------|----------|
| Development | `[command]` | ~[X]min |
| Staging | `[command]` | ~[X]min |
| Production | `[command]` | ~[X]min |

### 自动检查

| Check | Threshold | Action on Failure |
|-------|-----------|-------------------|
| Health Check | 200 OK | Auto-rollback |
| Error Rate | <1% | Alert, manual review |
| Response Time | P95 <500ms | Alert, manual review |
| Capacity Headroom | >20% remaining at expected peak | 先扩容或暂停部署 |
| Memory Usage | <80% | Alert, scale up |

---

## 回滚流程

### 自动回滚触发条件

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Health check failure | >3 consecutive failures | Immediate rollback |
| Error rate spike | >5% errors | Immediate rollback |
| Response time degradation | >2x baseline | Alert + manual decision |

### 手动回滚

```bash
# Rollback command
[rollback command]

# Verify rollback
[verification command]
```

### 回滚决策树

```
Issue Detected
    -> Critical（服务不可用）？
       -> Yes -> 立即回滚，之后再调查
    -> Degraded（部分功能受损）？
       -> Yes -> 评估影响
           -> User-facing? -> 回滚
           -> Internal only? -> 监控，15 分钟内决定
    -> Minor（外观或非阻塞问题）？
       -> 继续监控，在下次部署修复
```

---

## 环境变量

### 必需变量

| Variable | Environment | Description | Secret? |
|----------|-------------|-------------|---------|
| `DATABASE_URL` | All | Database connection | Yes |
| `API_KEY` | All | External API key | Yes |
| `NODE_ENV` | All | Environment mode | No |
| `LOG_LEVEL` | All | Logging verbosity | No |

### 分环境变量

**Development:**
```env
NODE_ENV=development
LOG_LEVEL=debug
[Other dev-specific vars]
```

**Staging:**
```env
NODE_ENV=staging
LOG_LEVEL=info
[Other staging-specific vars]
```

**Production:**
```env
NODE_ENV=production
LOG_LEVEL=warn
[Other prod-specific vars]
```

### Secrets 管理

| Secret | Storage | Rotation | Last Rotated |
|--------|---------|----------|--------------|
| [Secret 1] | [如 AWS Secrets Manager] | [如 90 days] | [Date] |
| [Secret 2] | [如 Vault] | [如 30 days] | [Date] |

---

## Database Migrations

### 迁移策略

- **Approach:** [Forward-only / Reversible]
- **Execution:** [Pre-deploy / During deploy / Post-deploy]
- **Backup:** [Automatic / Manual]

### 迁移检查清单

- [ ] migration 已在 staging 测试
- [ ] rollback migration 已准备
- [ ] 已完成数据库备份
- [ ] 已估算迁移耗时
- [ ] 应用同时兼容旧 schema 与新 schema

### 迁移命令

```bash
# Run migrations
[migration command]

# Check migration status
[status command]

# Rollback migration (if reversible)
[rollback command]
```

---

## 部署后验证

### Smoke Tests

| Test | Endpoint | Expected | Automated? |
|------|----------|----------|------------|
| Health check | `/health` | 200 OK | Yes |
| API status | `/api/status` | 200 OK | Yes |
| Database connection | `/api/db-check` | 200 OK | Yes |
| Authentication | `/api/auth/verify` | 200/401 | Yes |

### 监控窗口

| Timeframe | Actions |
|-----------|---------|
| 0-15 min | 观察错误率与响应时间 |
| 15-60 min | 监控用户侧指标 |
| 1-24 hr | 跟踪业务指标与用户反馈 |

### 成功标准

- [ ] 所有 smoke tests 通过
- [ ] 错误率处于正常范围
- [ ] 响应时间处于 SLA 内
- [ ] 部署后 capacity headroom 仍可接受
- [ ] 没有用户上报问题
- [ ] 所有监控面板为绿色

---

## 部署日志

| Date | Version | Environment | Deployer | Status | Notes |
|------|---------|-------------|----------|--------|-------|
| [Date] | [v1.2.3] | Production | [Name] | [✅ / ❌] | [Notes] |

---

## 相关文档

- [CAPACITY.md](./CAPACITY.md) - 容量基线与扩缩容计划
- [OPERATIONS.md](./OPERATIONS.md) - Operations 总览
- [RUNBOOK.md](./RUNBOOK.md) - 故障响应
- [BACKUP.md](./BACKUP.md) - 备份流程

---

*Last deployment: [date]*  
*部署流程发生变化时及时更新*
```

</template>

<guidelines>

**这份文档是什么：**
- 详细部署流程
- 步骤化操作说明
- 回滚流程
- 环境配置约束

**部署策略：**
- 选择时要考虑：
  - 服务关键程度
  - 团队经验
  - 基础设施能力
  - 回滚要求

**部署前检查清单：**
- 按项目实际情况定制
- 覆盖所有关键检查
- 流程演变时同步更新

**回滚流程：**
- 定义清晰触发条件
- 记录决策树
- 定期演练回滚

**环境变量：**
- 不要写入真实值
- 记录轮换周期
- 标明 secret 的存储位置

**Database Migrations：**
- 优先考虑向后兼容
- 先在 staging 验证
- 永远准备 rollback 方案

**部署后：**
- 定义 smoke tests
- 明确观察窗口
- 写清成功标准

</guidelines>
