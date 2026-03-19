<iron_law>
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.

If you haven't completed Phase 1, you cannot propose fixes. "Quick fix" is not a phase.

**Red flags — STOP and follow this process:**
- "Just try changing X and see if it works"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)
- Adding multiple changes and running tests
- Proposing solutions before tracing data flow
</iron_law>

<phase name="1-root-cause">
## Phase 1: Root Cause Investigation

BEFORE any fix attempt:

1. **Read error messages completely** — stack traces, line numbers, error codes. They often contain the exact solution.
2. **Reproduce consistently** — can you trigger it reliably? If not, gather more data. Don't guess.
3. **Check recent changes** — what changed that could cause this? `git diff`, recent commits, new deps or config.
4. **Add diagnostic instrumentation** (multi-component systems) — add logging at each component boundary to locate WHERE the failure is before attempting to fix WHAT:
   ```
   For each component boundary:
     - Log what enters
     - Log what exits
     - Verify config/env at each layer
   Run once → identify failing layer → investigate that layer
   ```
5. **Trace data flow** — where does the bad value originate? Trace backward up the call stack until you find the source. Fix at source, not at symptom.

**Exit condition:** You can state clearly "The root cause is X happening in Y because Z."
</phase>

<phase name="2-pattern">
## Phase 2: Pattern Analysis

1. Find working examples of similar code in the same codebase
2. Read any reference implementation completely — don't skim
3. List every difference between working and broken, however small
4. Identify all environment/config/dependency assumptions
</phase>

<phase name="3-hypothesis">
## Phase 3: Hypothesis and Testing

1. State one hypothesis: "I think X is the root cause because Y"
2. Make the SMALLEST possible change to test it — one variable at a time
3. Verify: Did it work? Yes → Phase 4. No → form new hypothesis. Do NOT stack more fixes.
4. If you don't understand: say so. Don't pretend.
</phase>

<phase name="4-implementation">
## Phase 4: Implementation

1. Create a failing test case (or explicit verify command) first
2. Implement ONE fix targeting the root cause — no "while I'm here" additions
3. Verify: test passes, other tests unbroken, issue resolved

**If fix doesn't work:**
- Attempts < 3: Return to Phase 1, re-analyze with new information
- Attempts ≥ 3: **STOP. Question the architecture.** Do not attempt Fix #4 without discussion.

**Architecture problem signals:**
- Each fix reveals new coupling/shared state in a different place
- Fixes require massive refactoring to implement
- Each fix creates new symptoms elsewhere

**When architecture is the problem:** Surface to user before continuing.
</phase>

<apply_in_gsd>
## When to Apply in GSD Execution

Trigger this process when:
- **Rule 1 (Bug):** Before "fixing" — first complete Phase 1-3, then implement the fix
- **Rule 2 (Missing Critical):** Same — understand WHY it's missing before adding
- **Rule 3 (Blocking):** Trace the blocker to its source before resolving
- **Verification failure in DEFINE→VERIFY step:** Trigger Phase 1 before retrying
- **node-repair is invoked:** node-repair attempts RETRY/DECOMPOSE — these must be informed by Phase 1-3 analysis, not guessing

**Do NOT bypass this process because:**
- The fix seems obvious (obvious fixes have root causes too)
- You're under time pressure (systematic is faster than thrashing)
- The issue seems simple (simple bugs still have root causes)
</apply_in_gsd>
