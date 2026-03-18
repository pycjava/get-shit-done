<purpose>
Create the next milestone for operations work using the same artifact flow as project initialization.
</purpose>

<process>

1. Run init:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-milestone)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. Capture what changed operationally since the last milestone:
- service scope
- environments
- operational gaps
- reliability targets
- rollout or compliance pressure

3. Update milestone-level requirements and roadmap.

4. Route to the first unplanned phase.

</process>
