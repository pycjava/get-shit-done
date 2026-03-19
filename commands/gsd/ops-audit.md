---
name: gsd:ops-audit
description: 审计现有运维文档与基础设施，找出缺口和改进项
argument-hint: "[可选：要审计的具体文档，例如 deployment 或 all]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Grep
---

<objective>
审计项目现有的运维文档，识别缺失文档、不完整区块、过期信息、容量规划缺口，并给出可执行建议。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/ops-audit.md
</execution_context>

<context>
参数：`$ARGUMENTS`（可选，可指定单份文档或 `all`）

**如项目已初始化，则先读取项目状态：**
检查 `.planning/STATE.md`

**这个命令适合在这些时机运行：**
- `/gsd:ops-runbook` 之后，审计刚生成的运维文档
- 重大部署、版本发布或季度复盘前，检查运维就绪度
- 季度运维回顾
- 基础设施变更后
</context>

<when_to_use>

**适合使用 ops-audit 的场景：**
- 上生产前复核运维准备度
- 做季度运维维护
- 基础设施或团队变化后复盘
- 合规审计前检查
- 接手一个已有项目时快速摸底

**不适合使用 ops-audit 的场景：**
- 项目仍处于很早期，几乎没有运维内容
- 项目还没有 `.planning` 目录

</when_to_use>

<process>
1. 检查 `.planning` 是否存在
2. 评估项目上下文（类型、规模、合规要求）
3. 检查现有运维文档有哪些
4. 审计每份文档的完整性
5. 找出缺口（缺文档、不完整区块等）
6. 标记过期信息
7. 计算审计得分
8. 给出建议
9. 提供下一步动作（生成缺失文档、更新现有文档、保存报告）
</process>

<success_criteria>
- [ ] 已评估项目上下文
- [ ] 已检查文档存在性
- [ ] 已审计现有文档完整性
- [ ] 已识别缺失文档
- [ ] 已标记过期信息
- [ ] 已给出建议
- [ ] 用户已获得明确下一步
</success_criteria>
