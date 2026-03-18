<purpose>
Create executable plans for an operations phase and verify the plan quality before execution.
</purpose>

<process>

1. Run init:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init plan-phase "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. Read the phase context:
- `PROJECT.md`
- `REQUIREMENTS.md`
- `ROADMAP.md`
- `STATE.md`
- `CONTEXT.md` if present
- prior research and verification artifacts if present

3. If research is enabled, spawn the phase researcher.
4. Spawn the planner to create executable phase plans.
5. If plan checking is enabled, run the checker loop until plans pass or the workflow must escalate.
6. Ensure plans are written as concrete operational work packages and include verification steps.

</process>

<notes>
This edition does not use UI design contracts or UI safety gates.
</notes>
