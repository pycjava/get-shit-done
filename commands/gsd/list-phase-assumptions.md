---
name: gsd:list-phase-assumptions
description: 在规划前先展示 Claude 对阶段实现方式的假设
argument-hint: "[阶段号]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

<objective>
分析一个阶段，并把 Claude 当前对技术路线、实现顺序、范围边界、风险区域与依赖关系的假设先摊开给用户看。

目的：让用户在规划开始前就能看见 Claude 的默认判断，从而及早纠偏。
输出：只做对话式展示，不创建文件；结尾必须以“你怎么看？”收口。
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/list-phase-assumptions.md
</execution_context>

<context>
阶段号：`$ARGUMENTS`（必填）

项目状态与路线图在 workflow 内通过定向读取加载。
</context>

<process>
1. 校验阶段号参数（缺失或非法则报错）
2. 检查该阶段是否存在于 roadmap
3. 按 `list-phase-assumptions.md` workflow 执行：
   - 分析 roadmap 对该阶段的描述
   - 提炼技术路线、实现顺序、范围、风险、依赖上的关键假设
   - 用清晰可讨论的方式展示这些假设
   - 最后追问“你怎么看？”
4. 收集用户反馈，并给出下一步建议
</process>

<success_criteria>
- 阶段已根据 roadmap 校验
- 已从五个维度展示关键假设
- 已邀请用户反馈
- 用户知道下一步可以怎么做（讨论上下文、规划阶段、或修正假设）
</success_criteria>
