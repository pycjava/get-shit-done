<purpose>
Capture the phase decisions that planners and executors must not guess.
</purpose>

<process>

1. Load phase context through `init phase-op`.
2. Read `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, and prior `CONTEXT.md` files.
3. Identify unresolved operational gray areas such as:
- rollout path
- rollback conditions
- alert thresholds
- capacity limits and scale triggers
- backup and restore behavior
- ownership and escalation
- dependency readiness

4. Ask only the questions needed to lock those decisions.
5. Write `{phase}-CONTEXT.md`.
6. Offer `/gsd:plan-phase {phase}` as the default next step.

</process>
