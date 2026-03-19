<purpose>
收集一个阶段中 planner 和 executor 不能靠猜来决定的关键决策。
</purpose>

<process>

1. 通过 `init phase-op` 加载阶段上下文。
2. 读取 `PROJECT.md`、`REQUIREMENTS.md`、`ROADMAP.md`、`STATE.md`，以及之前阶段的 `CONTEXT.md`。
3. 找出仍未确定的灰区决策，例如：
- 发布路径
- 回滚条件
- 告警阈值
- 容量上限与扩容触发条件
- 备份与恢复策略
- 负责人和升级路径
- 依赖准备情况

4. 只提出那些为锁定决策所必需的问题。
5. 写入 `{phase}-CONTEXT.md`。
6. 默认给出 `/gsd:plan-phase {phase}` 作为下一步。

</process>
