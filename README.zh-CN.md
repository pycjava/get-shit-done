# Get Shit Done

面向运维工作的上下文工程与分阶段自动化工作流。

这个仓库保留了原始 GSD 的骨架：

- 分层结构：`commands -> workflows -> agents -> templates -> .planning`
- 工作方式：文件化状态、薄编排器、专用 agent、显式验证
- 工作流程：发现 -> 讨论 -> 规划 -> 执行 -> 验证 -> 审计 -> 归档

变化点在于产品定位。现在它聚焦运维：部署、监控、告警、故障响应、备份恢复、安全运维和运维验收。

## 安装

```bash
npx get-shit-done-cc@latest
```

### 本地构建安装

```bash
# 构建 hooks
npm run build:hooks

# 打包成 .tgz
npm pack

# 全局安装
npm install -g ./get-shit-done-cc-<version>.tgz
```

安装后：

- Claude Code / Gemini / Copilot / Antigravity：`/gsd:help`
- OpenCode：`/gsd-help`
- Codex：`$gsd-help`

## 核心流程

建议按下面顺序工作：

1. `/gsd:map-codebase`
   先理解已有系统、服务边界、依赖和运行形态。
2. `/gsd:new-project`
   初始化运维规划空间，记录环境、约束、目标和职责。
3. `/gsd:discuss-phase 1`
   锁定当前阶段的运维决策：发布方式、回滚、告警、恢复、值班。
4. `/gsd:plan-phase 1`
   生成可执行计划和验证要求。
5. `/gsd:execute-phase 1`
   按波次执行阶段计划。
6. `/gsd:verify-work 1`
   做运维验收、演练和缺口闭环。
7. `/gsd:ops-runbook`
   生成或更新运维文档。
8. `/gsd:ops-audit`
   审计运维文档与覆盖情况。

里程碑结束时：

1. `/gsd:audit-milestone`
2. `/gsd:complete-milestone`
3. `/gsd:new-milestone`

## 主要命令

| 命令 | 作用 |
|---|---|
| `/gsd:new-project` | 初始化运维项目规划空间 |
| `/gsd:map-codebase` | 在 brownfield 场景先做系统映射 |
| `/gsd:discuss-phase` | 收敛阶段级运维决策 |
| `/gsd:plan-phase` | 生成可执行阶段计划 |
| `/gsd:execute-phase` | 执行阶段计划 |
| `/gsd:verify-work` | 做运维验收和缺口闭环 |
| `/gsd:ops-runbook` | 生成 `.planning/operations/` 运维文档 |
| `/gsd:ops-audit` | 审计运维文档是否过期或缺失 |
| `/gsd:audit-milestone` | 审计里程碑级运维准备度 |
| `/gsd:complete-milestone` | 归档当前里程碑 |
| `/gsd:new-milestone` | 开启下一个运维里程碑 |

## 输出物

虽然仍然写入 `.planning/`，但默认内容已经改成运维语义：

- `PROJECT.md`：服务目标、环境、约束、职责
- `REQUIREMENTS.md`：运维要求与覆盖
- `ROADMAP.md`：分阶段运维路线图
- `STATE.md`：当前状态、决策、阻塞
- `phases/*`：上下文、研究、计划、总结、验证、UAT
- `operations/*`：部署、监控、runbook、备份、安全运维

## 已移除内容

- UI 设计契约与 UI 审查
- 开发者画像
- 社区宣传命令
- 专门的补测命令入口

## 文档

- [docs/README.md](docs/README.md)
- [docs/COMMANDS.md](docs/COMMANDS.md)
- [docs/USER-GUIDE.md](docs/USER-GUIDE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
