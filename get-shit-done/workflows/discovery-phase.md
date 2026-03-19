<purpose>
按合适的深度执行 discovery。
当深度为 Level 2 或 3 时，生成 `DISCOVERY.md`，供后续创建 `PLAN.md` 使用。

这个工作流由 `plan-phase.md` 的 `mandatory_discovery` 步骤调用，并带入 `depth` 参数。

注意：如果需要的是“这个领域通常怎么做”的完整生态研究，请改用会产出 `RESEARCH.md` 的 `/gsd:research-phase`。
</purpose>

<depth_levels>
**本工作流支持三档深度：**

| Level | 名称 | 耗时 | 输出 | 适用场景 |
| ----- | ---- | ---- | ---- | -------- |
| 1 | Quick Verify（快速校验） | 2-5 分钟 | 不落盘，直接继续 | 单个已知库，只需确认当前语法 / 版本 |
| 2 | Standard（标准调研） | 15-30 分钟 | `DISCOVERY.md` | 方案二选一、新集成接入 |
| 3 | Deep Dive（深度调研） | 1 小时以上 | 带验证关卡的详细 `DISCOVERY.md` | 架构决策、陌生领域、高风险选择 |

**具体深度由 `plan-phase.md` 预先决定后再路由到这里。**
</depth_levels>

<source_hierarchy>
**强制要求：先用 Context7，再用 WebSearch**

Claude 的训练数据通常滞后 6-18 个月，必须验证。

1. **优先 Context7 MCP**：当前文档，减少幻觉
2. **其次官方文档**：Context7 未覆盖时补充
3. **最后 WebSearch**：只用于对比、趋势和社区信息

完整协议见 `~/.claude/get-shit-done/templates/discovery.md` 的 `<discovery_protocol>`。
</source_hierarchy>

<process>

<step name="determine_depth">
读取 `plan-phase.md` 传入的深度参数：
- `depth=verify` → Level 1（Quick Verification）
- `depth=standard` → Level 2（Standard Discovery）
- `depth=deep` → Level 3（Deep Dive）

然后路由到对应流程。
</step>

<step name="level_1_quick_verify">
**Level 1：快速校验（2-5 分钟）**

适用：单个已知库，只需要确认语法 / 版本是否仍然正确。

**流程：**

1. 在 Context7 里解析库：

   ```
   mcp__context7__resolve-library-id with libraryName: "[library]"
   ```

2. 获取相关文档：

   ```
   mcp__context7__get-library-docs with:
   - context7CompatibleLibraryID: [from step 1]
   - topic: [specific concern]
   ```

3. 校验：

   - 当前版本是否符合预期
   - API 语法是否未变化
   - 最近版本是否有破坏性变更

4. **若确认无误：** 返回 `plan-phase.md` 并说明可以继续，不生成 `DISCOVERY.md`。

5. **若发现疑点：** 升级到 Level 2。

**输出：** 一段确认说明，或者升级到 Level 2。
</step>

<step name="level_2_standard">
**Level 2：标准调研（15-30 分钟）**

适用：在多个选项之间做选择，或接入新的外部能力。

**流程：**

1. **先明确 discovery 的问题：**

   - 有哪些可选方案？
   - 比较维度是什么？
   - 当前项目的具体使用场景是什么？

2. **对每个候选项使用 Context7：**

   ```
   For each library/framework:
   - mcp__context7__resolve-library-id
   - mcp__context7__get-library-docs (mode: "code" for API, "info" for concepts)
   ```

3. **Context7 不足的部分，用官方文档补齐。**

4. **再用 WebSearch 做比较：**

   - `"[option A] vs [option B] {current_year}"`
   - `"[option] known issues"`
   - `"[option] with [our stack]"`

5. **交叉验证：** 任何来自 WebSearch 的结论，都要用 Context7 / 官方文档确认。

6. **按照 `~/.claude/get-shit-done/templates/discovery.md` 生成 `DISCOVERY.md`：**

   - 摘要 + 推荐结论
   - 每个选项的关键发现
   - 来自 Context7 的代码示例
   - 置信度（Level 2 一般应达到 MEDIUM-HIGH）

7. 返回 `plan-phase.md`。

**输出：** `.planning/phases/XX-name/DISCOVERY.md`
</step>

<step name="level_3_deep_dive">
**Level 3：深度调研（1 小时以上）**

适用：架构决策、陌生问题、高风险选择。

**流程：**

1. **用 `~/.claude/get-shit-done/templates/discovery.md` 先定义范围：**

   - 明确 discovery 目标
   - 明确 include / exclude 边界
   - 列出必须回答的问题

2. **做更完整的 Context7 调研：**

   - 覆盖所有相关库
   - 补充相关模式和概念
   - 必要时对单个库查询多个 topic

3. **深入阅读官方文档：**

   - 架构指南
   - 最佳实践章节
   - 迁移 / 升级指南
   - 已知限制

4. **用 WebSearch 补生态背景：**

   - 其他团队如何解决类似问题
   - 生产经验
   - 坑点与反模式
   - 近期更新 / 公告

5. **对所有结论做交叉验证：**

   - 每条 WebSearch 结论都要有权威来源支撑
   - 标明哪些已验证、哪些只是推测
   - 发现矛盾时明确写出

6. **生成完整的 `DISCOVERY.md`：**

   - 使用完整模板结构
   - 标注来源和质量
   - 为每条发现标注置信度
   - 如果关键结论仍是 LOW，加入验证检查点

7. **置信度闸门：** 如果整体置信度 LOW，先给出选项，不要直接往下走。

8. 返回 `plan-phase.md`。

**输出：** `.planning/phases/XX-name/DISCOVERY.md`（完整版本）
</step>

<step name="identify_unknowns">
**Level 2-3 共用：** 明确在规划前必须搞清楚什么。

要问自己：在能规划这个阶段之前，我们还需要知道什么？

- 技术选型？
- 最佳实践？
- API 模式？
- 架构路径？
</step>

<step name="create_discovery_scope">
使用 `~/.claude/get-shit-done/templates/discovery.md`。

至少要包含：

- 明确的调研目标
- 有边界的 include / exclude 列表
- 来源偏好（官方文档、Context7、当年资料）
- `DISCOVERY.md` 的输出结构
</step>

<step name="execute_discovery">
执行调研：
- 用 web search 获取当前信息
- 用 Context7 MCP 获取库文档
- 优先采用当年的资料
- 按模板组织发现
</step>

<step name="create_discovery_output">
写入 `.planning/phases/XX-name/DISCOVERY.md`：
- 摘要与建议
- 带来源的关键发现
- 如适用，附上代码示例
- 元信息（confidence、dependencies、open questions、assumptions）
</step>

<step name="confidence_gate">
生成 `DISCOVERY.md` 后，检查整体置信度。

如果置信度是 LOW：
向用户展示：

- 标题：`Low Confidence（低置信度）`
- 问题：`Discovery 置信度为 LOW：[原因]。下一步怎么做？`
- 选项：
  - `Dig deeper（继续深挖）`：继续研究后再规划
  - `Proceed anyway（继续规划）`：接受不确定性，带 caveat 往下走
  - `Pause（暂停）`：先停下来思考

如果置信度是 MEDIUM：
行内说明：`Discovery 完成（中等置信度）。[简要原因]。是否继续规划？`

如果置信度是 HIGH：
直接继续，并说明：`Discovery 完成（高置信度）。`
</step>

<step name="open_questions_gate">
如果 `DISCOVERY.md` 中存在 `open_questions`：

向用户直接展示：
`Discovery 中还有这些开放问题：

- [Question 1]
- [Question 2]

这些问题可能影响实现。是否确认继续？（yes / 先处理）`

如果用户选择“先处理”：收集补充输入并更新 discovery。
</step>

<step name="offer_next">
```
Discovery 完成：.planning/phases/XX-name/DISCOVERY.md
Recommendation（建议）：[one-liner]
Confidence（置信度）：[level]

接下来可继续：

1. 讨论阶段上下文（/gsd:discuss-phase [current-phase]）
2. 创建阶段计划（/gsd:plan-phase [current-phase]）
3. 继续细化 discovery（深挖）
4. 查看 discovery 文档

```

注意：`DISCOVERY.md` 不单独提交，会在阶段完成时一起提交。
</step>

</process>

<success_criteria>
**Level 1（快速校验）：**
- 已在 Context7 中核对库 / topic
- 已确认当前状态，或已升级处理疑点
- 给出可以继续的明确说明（不生成文件）

**Level 2（标准调研）：**
- 对所有候选方案都使用了 Context7
- WebSearch 发现完成交叉验证
- 已生成带推荐结论的 `DISCOVERY.md`
- 置信度达到 MEDIUM 或更高
- 足以指导后续创建 `PLAN.md`

**Level 3（深度调研）：**
- 已定义 discovery 范围
- 已充分使用 Context7
- 所有 WebSearch 发现都已与权威来源核对
- 已生成完整分析版 `DISCOVERY.md`
- 结果含来源标注与质量说明
- 若存在 LOW 置信度关键点，已定义验证检查点
- 已通过置信度闸门
- 足以指导后续创建 `PLAN.md`
</success_criteria>
