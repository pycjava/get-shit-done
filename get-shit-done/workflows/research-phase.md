<purpose>
研究某个阶段应该如何落地实现，并拉起 `gsd-phase-researcher` 读取阶段上下文后生成 `RESEARCH.md`。

这是独立 research 命令。多数场景优先使用会自动集成 research 的 `/gsd:plan-phase`。
</purpose>

<process>

## 步骤 0：解析模型档位

@~/.claude/get-shit-done/references/model-profile-resolution.md

为以下 agent 解析模型：
- `gsd-phase-researcher`

## 步骤 1：标准化并校验阶段参数

@~/.claude/get-shit-done/references/phase-argument-parsing.md

```bash
PHASE_INFO=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "${PHASE}")
```

如果 `found` 为 `false`：报错并退出。

## 步骤 2：检查已有研究文档

```bash
ls .planning/phases/${PHASE}-*/RESEARCH.md 2>/dev/null
```

如果已存在：向用户提供更新 / 查看 / 跳过选项。

## 步骤 3：收集阶段上下文

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init phase-op "${PHASE}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
# 提取：phase_dir, padded_phase, phase_number, state_path, requirements_path, context_path
```

## 步骤 4：拉起 researcher

```
Task(
  prompt="<objective>
研究 Phase {phase}: {name} 的实现方案
</objective>

<files_to_read>
- {context_path}（来自 /gsd:discuss-phase 的用户决策）
- {requirements_path}（项目需求）
- {state_path}（项目历史决策与上下文）
</files_to_read>

<additional_context>
阶段描述：{description}
</additional_context>

<output>
Write to: .planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</output>",
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}"
)
```

## 步骤 5：处理返回结果

- `## RESEARCH COMPLETE（研究完成）`：展示总结，并提供“规划 / 深挖 / 查看 / 完成”选项
- `## CHECKPOINT REACHED（达到检查点）`：向用户展示当前结果，并继续下一轮
- `## RESEARCH INCONCLUSIVE（研究结论不足）`：展示尝试过程，并提供“补充上下文 / 更换模式 / 手动处理”选项

</process>
