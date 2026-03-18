# Operations Output Patterns

Reference guide for consistent operations-focused workflow output.

## Stage Banners

Use concise uppercase banners for major workflow transitions.

```text
============================================================
 GSD > {STAGE NAME}
============================================================
```

Recommended stage names:
- `DISCOVERY`
- `PLANNING`
- `EXECUTION`
- `VALIDATION`
- `OPERATIONS AUDIT`
- `MILESTONE COMPLETE`

## Checkpoints

Use a compact checkpoint block when user input or approval is required.

```text
+----------------------------------------------------------+
| CHECKPOINT: {TYPE}                                       |
+----------------------------------------------------------+

{summary}

-> {action prompt}
```

Checkpoint types:
- `Decision Required`
- `Verification Required`
- `Action Required`

## Status Markers

Use plain markers consistently:
- `[done]`
- `[warn]`
- `[blocked]`
- `[in-progress]`
- `[pending]`

## Progress Summaries

Use short summaries that match the file-based workflow:

```text
Progress: 3/5 plans complete
Phase: 2/4 steps complete
Operations docs: 4/6 present
```

## Next Step Block

End major completions with one clear next action.

```text
Next:
- `{command}`
- reason: {why this is next}
```

## Anti-Patterns

Avoid:
- decorative formatting that obscures the next action
- multiple banner styles in the same workflow
- vague completion messages with no routing
- unrelated product or UI language in operations workflows
