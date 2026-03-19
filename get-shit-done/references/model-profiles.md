# 模型配置档

模型配置档决定 GSD 各 agent 默认使用哪种 Claude model。这样可以在质量与 token 开销之间做取舍，也可以直接继承当前 session 选中的 model。

## 配置定义

| Agent | `quality` | `balanced` | `budget` | `inherit` |
|-------|-----------|------------|----------|-----------|
| gsd-planner | opus | opus | sonnet | inherit |
| gsd-roadmapper | opus | sonnet | sonnet | inherit |
| gsd-executor | opus | sonnet | sonnet | inherit |
| gsd-phase-researcher | opus | sonnet | haiku | inherit |
| gsd-project-researcher | opus | sonnet | haiku | inherit |
| gsd-research-synthesizer | sonnet | sonnet | haiku | inherit |
| gsd-debugger | opus | sonnet | sonnet | inherit |
| gsd-codebase-mapper | sonnet | haiku | haiku | inherit |
| gsd-ops-researcher | opus | sonnet | haiku | inherit |
| gsd-verifier | sonnet | sonnet | haiku | inherit |
| gsd-plan-checker | sonnet | sonnet | haiku | inherit |
| gsd-integration-checker | sonnet | sonnet | haiku | inherit |
| gsd-nyquist-auditor | sonnet | sonnet | haiku | inherit |

## 配置理念

**quality** - 最高推理能力
- 所有决策型 agent 都使用 Opus
- 只读验证型工作使用 Sonnet
- 适用场景：配额充足、架构决策关键

**balanced**（默认）- 更聪明的资源分配
- 只有规划工作使用 Opus（主要架构决策发生在这里）
- 执行和研究用 Sonnet（主要按明确指令推进）
- 验证也用 Sonnet（需要推理，而不只是模式匹配）
- 适用场景：日常开发，希望质量和成本平衡

**budget** - 尽量少用 Opus
- 任何写代码的 agent 都使用 Sonnet
- 研究和验证使用 Haiku
- 适用场景：节省配额、高吞吐工作、风险较低阶段

**inherit** - 跟随当前 session model
- 所有 agent 都解析为 `inherit`
- 适合你在运行时频繁切换 model（例如 OpenCode `/model`）
- 适用场景：希望 GSD 跟随你当前 runtime 的实际 model

## 解析逻辑

编排器在启动 agent 前会先解析 model：

```
1. 读取 .planning/config.json
2. 检查 model_overrides 中是否有针对 agent 的覆盖
3. 如果没有覆盖，就从 profile 表查该 agent
4. 把最终 model 作为参数传给 Task
```

## 按 Agent 覆盖

无需改整个 profile，也可以单独覆盖某些 agent：

```json
{
  "model_profile": "balanced",
  "model_overrides": {
    "gsd-executor": "opus",
    "gsd-planner": "haiku"
  }
}
```

覆盖优先级高于 profile。合法值为：`opus`、`sonnet`、`haiku`、`inherit`。

## 切换配置

运行时：
`/gsd:set-profile <profile>`

项目级默认值：在 `.planning/config.json` 中设置：
```json
{
  "model_profile": "balanced"
}
```

## 设计理由

**为什么 `gsd-planner` 用 Opus？**
规划涉及架构决策、目标拆解和任务设计。这是 model 质量影响最大的地方。

**为什么 `gsd-executor` 用 Sonnet？**
执行器主要遵循明确的 `PLAN.md` 指令。推理已经被写进计划，执行的重点是实现。

**为什么 `balanced` 里的 verifier 仍然用 Sonnet，而不是 Haiku？**
验证需要从目标反推，确认代码是否真的兑现了阶段承诺，而不仅仅是做模式匹配。Sonnet 更稳，Haiku 可能漏掉细微缺口。

**为什么 `gsd-codebase-mapper` 用 Haiku？**
它主要做只读探索和模式提取，不需要复杂推理，更需要结构化输出。

**为什么用 `inherit`，而不是直接传 `opus`？**
Claude Code 中的 `"opus"` alias 会映射到某个具体版本。某些组织可能禁用旧版 opus，却允许新版。GSD 对 opus-tier agent 返回 `"inherit"`，让它直接使用用户当前 session 已配置的 opus 版本，从而避免版本冲突和静默降级到 Sonnet。

**为什么还需要 `inherit` profile？**
有些 runtime（包括 OpenCode）允许你在运行中切换 model（`/model`）。`inherit` profile 能让所有 GSD subagent 始终跟随这个实时选择。
