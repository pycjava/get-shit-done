<purpose>
Validate operational outcomes after a phase completes and create fix plans when gaps remain.
</purpose>

<process>

1. Run init:

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init verify-work "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. Read summaries and verification output for the phase.
3. Walk through operational acceptance checks such as:
- deployment path works
- rollback path is understood
- alert coverage exists
- monitoring signals are meaningful
- backup or restore behavior is verified
- runbook instructions are usable

4. Record results in `{phase}-UAT.md`.
5. If issues are found, route them through diagnosis and create focused fix plans for later execution.

</process>
