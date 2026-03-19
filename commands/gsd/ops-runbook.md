---
name: gsd:ops-runbook
description: 生成运维文档（部署、监控、容量、运维手册、备份、安全）
argument-hint: "[可选：要生成的具体文档，例如 deployment、capacity 或 all]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Task
  - Grep
---

<objective>
为项目生成运维文档，包括 `OPERATIONS.md`、`DEPLOYMENT.md`、`MONITORING.md`、`CAPACITY.md`、`RUNBOOK.md`、`BACKUP.md` 和 `SECURITY-OPS.md`。

每份文档都基于项目上下文与研究结果，直接写入 `.planning/operations/`。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/ops-runbook.md
</execution_context>

<context>
参数：`$ARGUMENTS`（可选，可指定单份文档或 `all`）

**如项目已初始化，则先读取项目状态：**
检查 `.planning/STATE.md`

**这个命令适合在这些时机运行：**
- `/gsd:new-project` 之后，做初始运维准备
- 重大部署、版本发布或基础设施变更前后，记录当前运维状态
- 基础设施发生变化后，刷新运维文档
</context>

<when_to_use>

**适合使用 ops-runbook 的场景：**
- 新项目需要建立运维基线
- 基础设施变更后需要刷新运维文档
- 准备生产部署
- 里程碑收尾，需要沉淀当前运维状态
- 安全 / 合规审计前

**不适合使用 ops-runbook 的场景：**
- 项目还很早期，尚未进入生产级运维
- 项目简单到几乎没有基础设施需求

</when_to_use>

<process>
1. 检查 `.planning/operations/` 是否已存在
2. 询问用户想生成哪些文档
3. 基于项目上下文研究运维需求
4. 用模板生成所选文档
5. 验证文档内容
6. 提交到版本控制
7. 向用户展示结果
</process>

<success_criteria>
- [ ] 已创建 `.planning/operations/`
- [ ] 至少生成 `OPERATIONS.md`
- [ ] 当项目涉及扩容或增长规划时，已生成 `CAPACITY.md`
- [ ] 文档内容与项目上下文一致
- [ ] 文档已提交
- [ ] 用户知道后续如何刷新这些文档
</success_criteria>
