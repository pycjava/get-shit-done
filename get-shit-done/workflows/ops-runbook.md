<purpose>
为项目生成运维文档。基于项目上下文创建 `OPERATIONS.md`、`DEPLOYMENT.md`、`MONITORING.md`、`CAPACITY.md`、`RUNBOOK.md`、`BACKUP.md`、`SECURITY-OPS.md`。
</purpose>

<required_reading>
1. `.planning/PROJECT.md`
2. `.planning/ROADMAP.md`
3. `.planning/config.json`
4. `get-shit-done/templates/operations/OPERATIONS.md`
5. `get-shit-done/templates/operations/DEPLOYMENT.md`
6. `get-shit-done/templates/operations/MONITORING.md`
7. `get-shit-done/templates/operations/RUNBOOK.md`
8. `get-shit-done/templates/operations/BACKUP.md`
9. `get-shit-done/templates/operations/SECURITY-OPS.md`
10. `get-shit-done/templates/operations/CAPACITY.md`
</required_reading>

<process>

## 1. 初始化

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init ops-runbook)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

解析：`project_name`、`project_path`、`has_operations`、`ops_research_model`。

如果 `has_operations` 为 true，询问用户是：
- 更新现有文档
- 重新生成新文档（先做备份）

## 2. 检查现有运维文档

```bash
ls -la .planning/operations/ 2>/dev/null || echo "No operations directory"
```

如果目录存在，先读取现有文档，了解当前状态。

## 3. 决定需要哪些运维文档

根据项目上下文决定需要生成哪些文档：

| 文档 | 何时需要 |
|------|----------|
| `OPERATIONS.md` | 总是需要 |
| `DEPLOYMENT.md` | 需要部署到生产时 |
| `MONITORING.md` | 有生产系统时 |
| `CAPACITY.md` | 需要增长、峰值负载、成本上限或扩容规划时 |
| `RUNBOOK.md` | 有生产系统时 |
| `BACKUP.md` | 有持久化数据时 |
| `SECURITY-OPS.md` | 有用户数据或敏感信息时 |

向用户展示待生成列表，并用 AskUserQuestion 让用户选择需要哪些文档。

## 4. 研究阶段

如果用户选择了任意文档：

显示：
```
GSD > 正在研究运维上下文
```

如果可以使用 `Task`，拉起 `gsd-ops-researcher` 收集：
- 部署平台 / CI/CD / 环境
- 基础设施 / 数据库 / 外部服务
- 监控指标 / 告警规则
- 容量基线 / 峰值负载 / 扩容策略
- 安全要求 / 合规要求
- 团队职责 / on-call 安排

如果没有 `Task`，则内联研究：
- 读取 `.planning/PROJECT.md`
- 读取 `.planning/ROADMAP.md`
- 扫描根目录中的部署 / infra / CI 文件
- 扫描监控相关依赖
- 汇总为各运维文档所需的结构化输入

## 5. 生成运维文档

对每个选中的文档：
- 读取对应模板
- 结合项目上下文和研究结果填充
- 写入 `.planning/operations/`

## 6. 校验文档

对每份生成文档检查：
- [ ] 各区块都已填充
- [ ] 模板占位符已替换
- [ ] 文档间交叉引用正确
- [ ] 命令和路径都是本项目的真实值
- [ ] 只提到 secrets，不把 secrets 本体写进去

### 6a. 交叉引用检查

验证每份生成文档中的内部链接都指向实际存在的 `.planning/operations/` 文件。

如发现断链，提示：
- 哪份文档中的哪个链接有问题
- 是否现在补生成缺失文档

## 7. 提交

```bash
mkdir -p .planning/operations
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: add operations documentation" --files .planning/operations/
```

## 8. 展示结果

```
GSD > 运维文档已生成

已生成：
- OPERATIONS.md - 运维总览
- DEPLOYMENT.md - 部署流程
- MONITORING.md - 监控与告警
- CAPACITY.md - 容量基线与扩容策略
- RUNBOOK.md - 事故响应
- BACKUP.md - 备份与恢复
- SECURITY-OPS.md - 安全运维

位置：.planning/operations/
```

### 下一步

```
## 下一步

**持续维护运维文档：**
- 用 /gsd:ops-audit 定期审计
- 基础设施有重大变更后及时更新
- 按季度复查

**与开发流程联动：**
- 在阶段规划中引用运维文档
- 发布或流量变化后回看 CAPACITY.md
- 事故发生时使用 RUNBOOK.md
- 新部署方式落地后更新 DEPLOYMENT.md
```

</process>

<output>
- `.planning/operations/OPERATIONS.md`
- `.planning/operations/DEPLOYMENT.md`
- `.planning/operations/MONITORING.md`
- `.planning/operations/CAPACITY.md`
- `.planning/operations/RUNBOOK.md`
- `.planning/operations/BACKUP.md`
- `.planning/operations/SECURITY-OPS.md`
</output>

<success_criteria>
- [ ] 已创建 `.planning/operations/`
- [ ] 至少已生成 `OPERATIONS.md`
- [ ] 当存在增长 / 扩容规划需求时已生成 `CAPACITY.md`
- [ ] 所有选中文档都符合项目上下文
- [ ] 模板占位符已替换为真实值
- [ ] 文档已提交到版本控制
- [ ] 用户知道如何后续更新运维文档
</success_criteria>
