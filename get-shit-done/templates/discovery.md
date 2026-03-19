# Discovery 模板

用于生成 `.planning/phases/XX-name/DISCOVERY.md`，适合做库选型、方案对比这一类浅层调研。

**目的：** 回答 `plan-phase` 强制 discovery 阶段里的“我们应该选哪个库 / 哪种方案”。

如果需要的是更深的生态研究，比如“这个领域里成熟团队通常怎么做”，应该改用 `/gsd:research-phase`，它会产出 `RESEARCH.md`。

---

## 文件模板

```markdown
---
phase: XX-name
type: discovery
topic: [discovery-topic]
---

<session_initialization>
开始 discovery 之前，先确认今天的日期：
!`date +%Y-%m-%d`

在搜索“当前 / 最新”信息时，必须使用今天所在的年份。
例如：如果今天是 2025-11-22，搜索词就应该写 2025，而不是 2024。
</session_initialization>

<discovery_objective>
围绕 [topic] 做调研，为 [phase name] 的实现提供依据。
Purpose: [这次决策或实现要解决什么]
Scope: [边界]
Output: DISCOVERY.md with recommendation
</discovery_objective>

<discovery_scope>
<include>
- [要回答的问题]
- [要调查的范围]
- [如有需要，要做的具体对比]
</include>

<exclude>
- [不属于本次 discovery 的内容]
- [留到执行阶段再处理的内容]
</exclude>
</discovery_scope>

<discovery_protocol>

**信息源优先级：**
1. **Context7 MCP**：库 / 框架文档，当前且权威
2. **官方文档**：Context7 未覆盖的平台或库
3. **WebSearch**：比较、趋势、社区经验，但所有结论都要再次验证

**质量检查清单：**
完成 discovery 前确认：
- [ ] 所有关键结论都有权威来源（Context7 或官方文档）
- [ ] 否定性结论（如“X 不支持”）已经由官方文档验证
- [ ] API 语法 / 配置来自 Context7 或官方文档，不能只靠 WebSearch
- [ ] WebSearch 发现已与权威来源交叉验证
- [ ] 检查过近期更新 / changelog，避免遗漏破坏性变化
- [ ] 比较过可行替代方案，而不是停在第一个答案

**置信度定义：**
- HIGH：Context7 或官方文档直接确认
- MEDIUM：WebSearch 发现 + Context7 / 官方文档共同确认
- LOW：仅来自 WebSearch 或训练知识，必须标记待验证
</discovery_protocol>

<output_structure>
创建 `.planning/phases/XX-name/DISCOVERY.md`：
```markdown
# [主题] 调研结论

## Summary（总结）
[2-3 段执行摘要：研究了什么、发现了什么、建议怎么做]

## Primary Recommendation（主要建议）
[明确写出推荐方案和原因，要求具体、可执行]

## Alternatives Considered（备选方案）
[还评估了哪些选择，以及为什么没有采用]

## Key Findings（关键发现）

### [类别 1]
- [结论 + 来源 URL + 与当前场景的关联]

### [类别 2]
- [结论 + 来源 URL + 关联]

## Code Examples（代码示例）
[如果适用，给出相关实现模式]

## Metadata（元信息）
<metadata>
<confidence level="high|medium|low">
[为什么给出这个置信度，基于哪些来源和验证]
</confidence>

<sources>
- [本次使用的主要权威来源]
</sources>

<open_questions>
[哪些点还没有确认，或需要在实现阶段继续验证]
</open_questions>

<validation_checkpoints>
[如果置信度是 LOW 或 MEDIUM，列出实现时必须补验的事项]
</validation_checkpoints>
</metadata>
```
</output_structure>

<success_criteria>
- discovery 范围内的问题都有权威来源支撑
- 质量检查清单已完成
- 给出清晰明确的主建议
- 低置信度结论带有后续验证点
- 可以直接指导 `PLAN.md` 生成
</success_criteria>

<guidelines>
**适合使用 discovery 的场景：**
- 技术选型不明确（如库 A vs 库 B）
- 接入陌生能力，需要先确认最佳实践
- 需要先调查 API / 库的可用性
- 当前只卡在一个关键决策上

**不适合使用 discovery 的场景：**
- 已经成熟稳定的常见模式（如 CRUD、已知库的 auth）
- 纯实现细节，应留到执行阶段
- 现有项目上下文已经能直接回答的问题

**以下场景应改用 RESEARCH.md：**
- 细分或复杂领域（3D、游戏、音频、shader 等）
- 需要生态知识，而不只是简单选型
- 问题是“这个方向通常怎么做？”
- 使用 `/gsd:research-phase`
</guidelines>
```
