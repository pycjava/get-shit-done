<purpose>
这是任务验证失败时的自主修复操作符。由 `execute-plan` 在任务未满足 done-criteria 时调用，在升级给用户之前先尝试结构化修复。
</purpose>

<inputs>
- FAILED_TASK: 计划中的任务编号、名称和 done-criteria
- ERROR: 验证阶段得到的实际结果与预期差异
- PLAN_CONTEXT: 相邻任务和阶段目标，用于感知约束
- REPAIR_BUDGET: 剩余最大修复次数（默认 2）
</inputs>

<repair_directive>
分析失败原因，并且**只选择一种**修复策略：

**RETRY** - 方向没错，但执行失败。带着具体调整重试。
- 使用时机：命令报错、依赖缺失、路径错误、环境问题、瞬时失败
- 输出：`RETRY: [重试前要做的具体调整]`

**DECOMPOSE** - 任务太粗，拆成更小且可验证的子步骤。
- 使用时机：done-criteria 同时覆盖多个关注点，或者实现缺口具有结构性
- 输出：`DECOMPOSE: [sub-task 1] | [sub-task 2] | ...`（最多 3 个）
- 每个子任务都必须只有一个可验证结果

**PRUNE** - 在当前约束下该任务不可行，给出理由后跳过。
- 使用时机：前置条件缺失且当前范围内无法修，超出范围，或与更早决策冲突
- 输出：`PRUNE: [一句话说明理由]`

**ESCALATE** - 修复预算耗尽，或者已经涉及架构决策（Rule 4）。
- 使用时机：同一任务已经用不同方式 RETRY 超过一次仍失败，或修复需要结构性改动
- 输出：`ESCALATE: [已尝试内容] | [需要用户决定什么]`
</repair_directive>

<process>

<step name="diagnose">
认真阅读错误信息和 done-criteria。依次判断：
1. 这是瞬时 / 环境问题吗？-> `RETRY`
2. 任务本身是否过宽且可验证性差？-> `DECOMPOSE`
3. 是否确实缺少前置条件，且当前范围内无法修？-> `PRUNE`
4. 这个任务之前是否已经 RETRY 过？检查 `REPAIR_BUDGET`。如果为 0 -> `ESCALATE`
</step>

<step name="execute_retry">
如果选择 `RETRY`：
1. 应用指令中写明的具体调整
2. 重新执行任务实现
3. 重新执行验证
4. 如果通过 -> 正常继续，并记录 `[Node Repair - RETRY] Task [X]: [adjustment made]`
5. 如果再次失败 -> `REPAIR_BUDGET - 1`，并带更新后的上下文再次调用 `node-repair`
</step>

<step name="execute_decompose">
如果选择 `DECOMPOSE`：
1. 在内存中把失败任务替换为子任务，不修改磁盘上的 `PLAN.md`
2. 顺序执行这些子任务，并为每个子任务独立验证
3. 如果所有子任务都通过 -> 视为原任务成功，并记录 `[Node Repair - DECOMPOSE] Task [X] -> [N] sub-tasks`
4. 如果某个子任务失败 -> 对该子任务重新调用 `node-repair`（每个子任务各自消耗 `REPAIR_BUDGET`）
</step>

<step name="execute_prune">
如果选择 `PRUNE`：
1. 将任务标记为跳过，并附上理由
2. 在 SUMMARY 的 “Issues Encountered” 中记录：`[Node Repair - PRUNE] Task [X]: [justification]`
3. 继续下一个任务
</step>

<step name="execute_escalate">
如果选择 `ESCALATE`：
1. 通过 `verification_failure_gate` 将完整修复历史上抛给用户
2. 展示：已尝试的每一步、当前阻塞点、可选路径
3. 等待用户指令后再继续
</step>

</process>

<logging>
所有修复动作都必须写入 `SUMMARY.md` 的 “## Deviations from Plan”：

| 类型 | 格式 |
|------|------|
| RETRY 成功 | `[Node Repair - RETRY] Task X: [adjustment] -> resolved` |
| RETRY 失败后升级 | `[Node Repair - RETRY] Task X: [N] attempts exhausted -> escalated to user` |
| DECOMPOSE | `[Node Repair - DECOMPOSE] Task X split into [N] sub-tasks -> all passed` |
| PRUNE | `[Node Repair - PRUNE] Task X skipped: [justification]` |
</logging>

<constraints>
- `REPAIR_BUDGET` 默认为每个任务 2 次，可通过 `config.json` 的 `workflow.node_repair_budget` 配置
- 不要修改磁盘上的 `PLAN.md`，拆出来的子任务只存在于内存
- `DECOMPOSE` 的子任务必须比原任务更具体，不能只是同义改写
- 如果 `config.json` 中 `workflow.node_repair` 为 `false`，则直接跳到 `verification_failure_gate`，保持用户原有行为
</constraints>
