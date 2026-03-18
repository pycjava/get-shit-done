<purpose>
Update `.planning/config.json` for the operations-focused workflow.
</purpose>

<process>

1. Ensure config exists:

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-ensure-section
```

2. Read current config and let the user choose values for:
- `model_profile`
- `workflow.research`
- `workflow.plan_check`
- `workflow.verifier`
- `workflow.nyquist_validation`
- `workflow.auto_advance`
- `git.branching_strategy`
- `hooks.context_warnings`

3. Write updated settings back to `.planning/config.json`.

4. Display a concise summary of the selected values.

</process>

<notes>
Do not offer removed UI or developer-profiling settings.
</notes>
