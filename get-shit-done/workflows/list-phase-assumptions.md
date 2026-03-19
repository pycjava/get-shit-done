<purpose>
在开始规划前，把 Claude 对某个阶段的假设显式摊出来，让用户能尽早纠正误解。

与 `discuss-phase` 的区别：
这里是在分析 Claude 自己“以为”这个阶段是什么，而不是收集用户已有知识。
不输出文件，只做对话分析，用来触发讨论。
</purpose>

<process>

<step name="validate_phase" priority="first">
阶段号：`$ARGUMENTS`（必填）

**如果缺少参数：**

```
Error: 缺少阶段号。

用法：/gsd:list-phase-assumptions [phase-number]
示例：/gsd:list-phase-assumptions 3
```

退出 workflow。

**如果提供了参数：**
先验证该阶段是否存在于路线图中：

```bash
cat .planning/ROADMAP.md | grep -i "Phase ${PHASE}"
```

**如果找不到该阶段：**

```
Error: 在 roadmap 中找不到阶段 ${PHASE}。

可用阶段：
[list phases from roadmap]
```

退出 workflow。

**如果找到了阶段：**
从 roadmap 中解析：

- 阶段号
- 阶段名称
- 阶段描述 / 目标
- 所有已写明的范围细节

然后继续到 `analyze_phase`。
</step>

<step name="analyze_phase">
基于 roadmap 描述和项目上下文，从五个方面列出假设：

**1. 技术路径：**
Claude 会倾向于使用哪些库、框架、模式或工具？
- “我会用 X 库，因为……”
- “我会采用 Y 模式，因为……”
- “我会把结构做成 Z，因为……”

**2. 实现顺序：**
Claude 会优先做什么、其次做什么、最后做什么？
- “我会先做 X，因为它是基础”
- “然后做 Y，因为它依赖 X”
- “最后做 Z，因为……”

**3. 范围边界：**
Claude 认为哪些内容属于本阶段，哪些不属于？
- “我认为这个阶段包含：A、B、C”
- “我认为这个阶段不包含：D、E、F”
- “边界模糊项：G 可能两边都说得通”

**4. 风险区域：**
Claude 预计哪里会复杂、容易出问题？
- “最棘手的是 X，因为……”
- “潜在问题有：Y、Z”
- “我会特别注意……”

**5. 依赖关系：**
Claude 假设哪些东西已经存在，或者必须先具备？
- “我假设前面阶段已经提供了 X”
- “外部依赖有：Y、Z”
- “这个阶段的结果会被……消费”

必须诚实标记不确定性：
- `比较确定：...`（roadmap 已写得很清楚）
- `我的假设：...`（合理推断）
- `不明确：...`（存在多种解释）
</step>

<step name="present_assumptions">
用清晰、易扫读的格式展示：

```
## 我对阶段 ${PHASE}: ${PHASE_NAME} 的假设

### 技术路径
[列出实现方式上的假设]

### 实现顺序
[列出顺序上的假设]

### 范围边界
**包含：** [what's included]
**不包含：** [what's excluded]
**模糊项：** [what could go either way]

### 风险区域
[列出预期难点]

### 依赖关系
**前置阶段：** [what's needed]
**外部依赖：** [third-party needs]
**输出给后续：** [what future phases need from this]

---

**你怎么看？**

请告诉我：
- 哪些判断是对的
- 哪些判断是错的
- 我遗漏了什么
```

等待用户回应。
</step>

<step name="gather_feedback">
**如果用户给出纠正：**

确认这些修正：

```
关键纠正点：
- [correction 1]
- [correction 2]

这些修正明显改变了我的理解。现在我的理解是：[Summarize new understanding]
```

**如果用户确认这些假设基本正确：**

```
这些假设已得到确认。
```

然后继续 `offer_next`。
</step>

<step name="offer_next">
展示后续选项：

```
接下来做什么？
1. 讨论上下文（/gsd:discuss-phase ${PHASE}）- 让我继续提问，构建完整上下文
2. 规划这个阶段（/gsd:plan-phase ${PHASE}）- 创建详细执行计划
3. 重新审视假设 - 基于你的纠正再分析一次
4. 先到这里
```

等待用户选择。

如果选“讨论上下文”：说明后续 `CONTEXT.md` 会吸收这里的纠正结果。
如果选“规划这个阶段”：基于已澄清的假设继续。
如果选“重新审视假设”：带着更新后的理解回到 `analyze_phase`。
</step>

</process>

<success_criteria>
- 已根据 roadmap 验证阶段号
- 已从五个方面摊出假设：技术路径、实现顺序、范围、风险、依赖
- 已在需要处标注置信度 / 不确定性
- 已明确抛出“你怎么看？”的讨论入口
- 已对用户反馈做出确认
- 已给出清晰的下一步
</success_criteria>
