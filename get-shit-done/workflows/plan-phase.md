<purpose>
为一个运维阶段创建可执行计划，并在执行前验证计划质量。
</purpose>

<process>

1. 运行 init：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init plan-phase "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. 读取该阶段上下文：
- `PROJECT.md`
- `REQUIREMENTS.md`
- `ROADMAP.md`
- `STATE.md`
- 如果存在则读取 `CONTEXT.md`
- 如果存在也读取历史 research / verification 产物

3. 如果开启了 research，则拉起 phase researcher。
4. 执行 Clarification 子任务：
   - 读取并遵照 `@~/.claude/get-shit-done/references/clarification.md`
   - 以 `PROJECT.md`、`REQUIREMENTS.md`、`ROADMAP.md` 及已有 `CONTEXT.md` 为输入
   - 写入 `{phase}-CLARIFICATION.md`，作为 planner 的强制输入
5. 拉起 planner 创建该阶段的可执行计划，并把 `CONTEXT.md`、`CLARIFICATION.md` 和所有历史产物都作为输入。
6. 如果开启了 plan checking，则运行 checker 循环，直到 plans 通过检查，或 workflow 必须升级处理。
7. 确保 plans 写成具体、可落地的运维工作包，并且包含验证步骤。

</process>

<notes>
当前版本不使用 UI 设计合同，也不使用 UI 安全闸门。
</notes>
