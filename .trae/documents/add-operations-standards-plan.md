# 添加运维标准方法计划

## 目标

为 GSD 项目添加一套运维（DevOps/Ops）标准方法，使其能够像现有的开发流程一样，为项目生成运维相关的标准化文档和流程。

---

## 背景分析

### 现有模板系统结构

GSD 的模板系统位于 `get-shit-done/templates/` 目录，包含：

| 模板类型 | 位置 | 用途 |
|---------|------|------|
| 项目核心模板 | `templates/*.md` | PROJECT.md、ROADMAP.md、STATE.md 等 |
| 代码库映射 | `templates/codebase/` | 7 个模板（stack、architecture、conventions 等） |
| 项目研究 | `templates/research-project/` | 5 个模板（SUMMARY、STACK、FEATURES 等） |
| 阶段验证 | `templates/VALIDATION.md`、`UI-SPEC.md` 等 | 测试、UI、验证相关 |

### 现有工作流集成方式

工作流通过以下方式集成模板：

1. **命令层** (`commands/gsd/*.md`) → 用户入口
2. **工作流层** (`workflows/*.md`) → 编排逻辑
3. **Agent 层** (`agents/*.md`) → 执行具体任务
4. **CLI 工具** (`bin/gsd-tools.cjs`) → 状态管理、模板填充

---

## 实施方案

### 方案一：在 codebase 模板目录中添加运维模板（推荐）

**优点**：
- 与现有代码库映射模板结构一致
- 用户可通过 `/gsd:map-codebase` 自动生成
- 复用现有的模板填充机制

**需要创建的文件**：

```
get-shit-done/templates/codebase/
├── operations.md          # 运维标准主模板
├── deployment.md          # 部署流程模板
├── monitoring.md          # 监控告警模板
└── runbook.md             # 故障排查手册模板
```

### 方案二：创建独立的 operations 模板目录

**优点**：
- 运维文档与代码库映射分离
- 可以独立于代码库映射生成

**需要创建的文件**：

```
get-shit-done/templates/
├── operations/
│   ├── OPERATIONS.md      # 运维概览
│   ├── DEPLOYMENT.md      # 部署指南
│   ├── MONITORING.md      # 监控配置
│   ├── RUNBOOK.md         # 运维手册
│   └── SECURITY.md        # 安全配置
```

---

## 推荐方案：混合方案

结合两种方案的优点：

### 1. 创建运维模板目录

```
get-shit-done/templates/operations/
├── OPERATIONS.md          # 运维标准总览
├── DEPLOYMENT.md          # 部署流程
├── MONITORING.md          # 监控告警
├── RUNBOOK.md             # 故障排查手册
├── BACKUP.md              # 备份恢复
└── SECURITY-OPS.md        # 运维安全
```

### 2. 创建运维工作流

```
get-shit-done/workflows/
├── ops-phase.md           # 运维阶段规划
├── ops-audit.md           # 运维审计
└── ops-runbook.md         # 运维手册生成
```

### 3. 创建运维命令

```
commands/gsd/
├── ops-phase.md           # 规划运维阶段
├── ops-audit.md           # 审计运维配置
└── ops-runbook.md         # 生成运维手册
```

### 4. 创建运维 Agent

```
agents/
├── gsd-ops-researcher.md  # 运维研究
├── gsd-ops-planner.md     # 运维规划
└── gsd-ops-auditor.md     # 运维审计
```

### 5. 更新 CLI 工具

修改 `get-shit-done/bin/lib/` 中的相关模块：
- `template.cjs` - 添加运维模板支持
- `init.cjs` - 添加运维工作流初始化

---

## 详细实施步骤

### 阶段 1：创建运维模板（核心）

1. **OPERATIONS.md** - 运维标准总览
   - 运维策略概述
   - 环境配置管理
   - CI/CD 流程概览
   - 运维团队职责

2. **DEPLOYMENT.md** - 部署流程
   - 部署策略（蓝绿、滚动、金丝雀）
   - 部署检查清单
   - 回滚流程
   - 环境变量管理

3. **MONITORING.md** - 监控告警
   - 监控指标定义
   - 告警规则配置
   - 日志聚合策略
   - 仪表板配置

4. **RUNBOOK.md** - 故障排查手册
   - 常见问题诊断
   - 故障响应流程
   - 升级路径
   - 事后复盘模板

5. **BACKUP.md** - 备份恢复
   - 备份策略
   - 恢复流程
   - 数据保留策略
   - 灾难恢复计划

6. **SECURITY-OPS.md** - 运维安全
   - 访问控制
   - 密钥管理
   - 安全审计
   - 合规检查

### 阶段 2：创建工作流和命令

1. **ops-phase.md** - 运维阶段规划工作流
2. **ops-audit.md** - 运维审计工作流
3. **ops-runbook.md** - 运维手册生成工作流

### 阶段 3：创建 Agent

1. **gsd-ops-researcher.md** - 研究运维最佳实践
2. **gsd-ops-planner.md** - 规划运维策略
3. **gsd-ops-auditor.md** - 审计运维配置

### 阶段 4：更新 CLI 工具

1. 更新 `template.cjs` 支持运维模板
2. 更新 `init.cjs` 支持运维工作流初始化
3. 添加运维相关命令到 `commands.cjs`

### 阶段 5：创建参考文档

```
get-shit-done/references/
├── ops-patterns.md        # 运维模式参考
├── deployment-strategies.md # 部署策略参考
└── monitoring-standards.md # 监控标准参考
```

---

## 输出文件位置

生成的运维文档将存放在项目的 `.planning/operations/` 目录：

```
.planning/
├── operations/
│   ├── OPERATIONS.md      # 运维总览
│   ├── DEPLOYMENT.md      # 部署指南
│   ├── MONITORING.md      # 监控配置
│   ├── RUNBOOK.md         # 运维手册
│   ├── BACKUP.md          # 备份恢复
│   └── SECURITY-OPS.md    # 安全配置
```

---

## 与现有流程的集成点

1. **新项目初始化** (`/gsd:new-project`)
   - 可选：同时生成运维规划

2. **里程碑完成** (`/gsd:complete-milestone`)
   - 更新运维文档
   - 审计运维配置

3. **阶段执行** (`/gsd:execute-phase`)
   - 部署相关阶段自动引用运维模板

4. **代码库映射** (`/gsd:map-codebase`)
   - 可选：同时生成运维映射

---

## 预期效果

用户可以通过以下命令使用运维功能：

```bash
/gsd:ops-phase 1          # 规划运维阶段
/gsd:ops-audit            # 审计运维配置
/gsd:ops-runbook          # 生成运维手册
```

生成的运维文档将：
- 与项目需求保持一致
- 自动跟踪运维决策
- 与里程碑流程集成
- 支持版本控制

---

## 优先级建议

| 优先级 | 任务 | 工作量 |
|--------|------|--------|
| P0 | 创建运维模板文件 | 中 |
| P1 | 创建 ops-runbook 工作流和命令 | 中 |
| P2 | 创建运维 Agent | 小 |
| P3 | 更新 CLI 工具 | 中 |
| P4 | 创建参考文档 | 小 |
| P5 | 集成到现有流程 | 中 |

---

## 下一步

确认方案后，我将按照以下顺序实施：

1. 创建 `templates/operations/` 目录和 6 个模板文件
2. 创建 `workflows/ops-runbook.md` 工作流
3. 创建 `commands/gsd/ops-runbook.md` 命令
4. 创建 `agents/gsd-ops-researcher.md` Agent
5. 更新 `bin/lib/template.cjs` 支持运维模板
