<discipline>

Every atomic task follows a three-step discipline: **DEFINE → IMPLEMENT → VERIFY + SELF-CHECK**.

This is not full TDD (no failing tests required). It is *test-driven discipline*: you must know what "done" looks like — in verifiable, runnable terms — BEFORE you start implementing.

</discipline>

<step name="DEFINE — before writing a single line">

Before implementing, state aloud (in your reasoning):

1. **What is the observable outcome?** Not "create the file" but "file exists at path X, contains Y, command Z returns exit 0"
2. **What is the exact verification command?** Write it now. If you can't write it now, you don't understand the task yet.
3. **What are the failure modes?** What would make this task wrong even if it "completes"?

**Gate:** If you cannot answer all three, do NOT start. Re-read the task and plan until you can.

**Format — write this mentally or inline before coding:**
```
BEFORE:
  outcome: [file/API/state that proves done]
  verify:  [exact command(s) to confirm]
  risks:   [what could be wrong even if it "works"]
```

</step>

<step name="IMPLEMENT — minimal, focused">

- Implement ONLY what the task requires. No scope creep.
- If you discover unplanned work: apply deviation rules (Rule 1-4), don't silently expand scope.
- Track every file touched.

</step>

<step name="VERIFY — run the verification you defined in DEFINE">

Run the exact command(s) you specified in DEFINE. No substitutions.

- **Pass:** proceed to SELF-CHECK
- **Fail:** debug and fix. Do NOT mark task done until verification passes.
- **Cannot verify:** STOP. Surface to user as a checkpoint. Do not pretend.

</step>

<step name="SELF-CHECK — mandatory before commit">

After verification passes, do a 30-second self-review:

| Question | Check |
|---|---|
| Does the output match the plan's `done-criteria` exactly? | ✓ / ✗ |
| Did I touch files not listed in the task? | ✓ explain / ✗ ok |
| Would this break anything downstream? | ✓ investigate / ✗ ok |
| Is the commit message honest (not aspirational)? | ✓ / ✗ |

**If any check is ✗:** fix before committing. Never commit a known gap.

Record the self-check result in the commit body or SUMMARY.md. If SUMMARY has `## Self-Check: FAILED`, the orchestrator will catch it.

</step>

<tdd_code_plans>

For `type: tdd` plans — full RED-GREEN-REFACTOR cycle applies in addition to the above:

1. **RED:** Write failing test describing behavior → commit `test(...)` → MUST fail
2. **GREEN:** Minimal implementation → commit `feat(...)` → MUST pass
3. **REFACTOR:** Clean up if needed → commit `refactor(...)` → tests MUST still pass

Reference: `@~/.claude/get-shit-done/references/tdd.md`

This is on top of, not instead of, DEFINE → IMPLEMENT → VERIFY + SELF-CHECK.

</tdd_code_plans>

<when_to_apply>

**Always (every task):** DEFINE → IMPLEMENT → VERIFY + SELF-CHECK

**Additionally for `type: tdd` tasks:** RED → GREEN → REFACTOR cycle (tdd.md)

**Verification shortcut:** If a task's `<acceptance_criteria>` already lists exact verification commands, use those as your DEFINE output — you don't need to re-derive them. But you MUST still run them.

</when_to_apply>

<anti_patterns>

- **Implement then verify** — violates DEFINE. You're guessing, not engineering.
- **"It should work"** — without running the verification command, this is wishful thinking.
- **Silent scope expansion** — applying deviation rules means documenting, not ignoring.
- **Aspirational commits** — commit messages describe what actually happened, not what was intended.
- **Skipping self-check** — the 30 seconds save hours of debugging in later waves.

</anti_patterns>
