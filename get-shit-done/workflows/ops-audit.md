<purpose>
审计项目现有的运维文档和基础设施，识别缺口、过期信息，并给出改进建议。
</purpose>

<required_reading>
1. `.planning/PROJECT.md`
2. `.planning/ROADMAP.md`
3. `.planning/config.json`
4. `.planning/operations/OPERATIONS.md`（如果存在）
5. `.planning/operations/DEPLOYMENT.md`（如果存在）
6. `.planning/operations/MONITORING.md`（如果存在）
7. `.planning/operations/RUNBOOK.md`（如果存在）
8. `.planning/operations/BACKUP.md`（如果存在）
9. `.planning/operations/SECURITY-OPS.md`（如果存在）
10. `.planning/operations/CAPACITY.md`（如果存在）
</required_reading>

<process>

## 0. 解析参数

优先解析 `$ARGUMENTS`：

| 参数值 | 行为 |
|---|---|
| 空 / `"all"` | 审计所有已有运维文档 |
| `"deployment"` / `"runbook"` 等 | 只审计指定文档 |

保存为 `target_doc`，后续都用它过滤审计范围。

## 1. 初始化

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init ops-audit)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析：`project_name`、`project_stage`、`ops_dir`、`existing_docs`、`has_operations`、`planning_exists`、`ops_weights`。

如果 `planning_exists` 为 false：直接报错，提示先运行 `/gsd:new-project`。

如果设置了 `target_doc`：先过滤 `existing_docs`，然后再继续。

## 2. 评估项目上下文

读取 `PROJECT.md`，判断：
- 项目类型
- 当前规模
- 数据敏感性
- 合规要求
- 团队规模
- 部署目标

这会决定哪些运维文档是必需的，哪些是可选的。

## 3. 检查文档存在性

```bash
ls -la .planning/operations/ 2>/dev/null || echo "No operations directory"
```

输出一个文档状态矩阵：
- 是否存在
- 最近更新时间

## 4. 审计已有文档

对每份已有文档检查完整度：
- `OPERATIONS.md`：运维目标、环境、责任分工、升级路径等
- `DEPLOYMENT.md`：部署策略、发布步骤、回滚、迁移、发布后检查
- `MONITORING.md`：可观测栈、关键指标、阈值、告警路由、SLO/SLI
- `CAPACITY.md`：基线、峰值、瓶颈、扩容路径、触发条件、复查周期
- `RUNBOOK.md`：故障等级、联系人、常见问题、处理步骤、复盘模板
- `BACKUP.md`：备份策略、RTO/RPO、恢复流程、保留策略、演练计划
- `SECURITY-OPS.md`：鉴权方式、RBAC、密钥管理、漏洞扫描、事件响应、合规映射

## 5. 识别缺口

### 缺失文档

根据项目上下文，把缺失文档分成：
- Critical
- High
- Medium

### 不完整文档

列出每份文档中缺失的区块和影响等级。

### 过期信息

先基于 `mtime` 判断陈旧度：
- 超过 90 天 -> `STALE`
- 超过 60 天 -> `AGING`

再做交叉检查：
- 部署目标是否与真实部署配置一致
- 文档中的工具版本是否与依赖文件一致
- on-call 名单是否和 `PROJECT.md` 一致
- CI/CD 平台是否和仓库中的实际配置一致
- 监控工具是否与实际依赖一致
- 容量假设是否与当前基础设施 / 配额 / 仪表盘信息一致

只要发现任一不一致，就标记为“过期”。

## 6. 可选基础设施扫描

如果已有代码库映射，则可进一步核对：
- 部署配置
- 监控配置
- 备份配置

把扫描到的真实基础设施与运维文档进行比对。

## 7. 生成审计报告

向用户展示：
- 项目名、审计日期、项目阶段
- 文档覆盖矩阵
- 关键缺口
- 分层建议（立即处理 / 本迭代 / 长期）
- 总体审计分数

分数按以下类别加权：
- Deployment
- Monitoring
- Capacity Planning
- Incident Response
- Backup / Recovery
- Security

如果 `ops_weights` 存在，则使用配置权重；如权重和不为 100，给出警告。

## 8. 提供后续动作

使用 AskUserQuestion：
- 生成缺失文档
- 更新现有文档
- 保存 audit 报告
- 完成，不做修改

如果选“生成缺失文档”：
- 找出缺失项
- 调用 `/gsd:ops-runbook [doc-names]`

如果选“更新现有文档”：
- 列出不完整文档
- 让用户选择要更新的项

如果选“保存 audit 报告”：
```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "ops: audit report [date]" --files .planning/operations/AUDIT-[date].md
```

</process>

<output>
- 向用户直接展示 audit 结果
- 如用户选择保存，则写入 `.planning/operations/AUDIT-[date].md`
- 如用户选择修复，则更新对应运维文档
</output>

<success_criteria>
- [ ] 已评估项目上下文
- [ ] 已检查所有现有运维文档
- [ ] 已识别缺失文档
- [ ] 已识别不完整区块
- [ ] 已标记过期信息
- [ ] 已给出建议
- [ ] 已计算审计分数
- [ ] 已向用户提供后续动作
- [ ] 用户知道接下来怎么处理
</success_criteria>
