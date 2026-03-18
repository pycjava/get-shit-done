<purpose>
Initialize a project for operations planning while preserving the standard GSD artifact chain.
</purpose>

<process>

1. Run init:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-project)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. If existing code is present and no codebase map exists, recommend `/gsd:map-codebase` first.

3. Gather project context focused on operations:
- system purpose
- environments
- deployment model
- dependencies
- observability expectations
- backup and recovery expectations
- security and ownership boundaries

4. Write:
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/config.json`

5. Present the next step:
- `/gsd:discuss-phase 1` if phase discussion is needed
- `/gsd:plan-phase 1` if the phase is already well defined

</process>
