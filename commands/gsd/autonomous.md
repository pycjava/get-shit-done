---
name: gsd:autonomous
description: Run all remaining phases autonomously through one unified master plan
argument-hint: "[--from N]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Task
---
<objective>
Build one unified master plan across all remaining milestone phases, display it, then execute it autonomously. Each phase still runs through discuss -> plan -> execute, but the user sees one top-level plan first. TDD plans must be surfaced explicitly as RED -> GREEN -> REFACTOR.

Uses ROADMAP.md phase discovery and Skill() flat invocations for each phase command. After all phases complete: milestone audit -> complete -> cleanup.

**Creates/Updates:**
- `.planning/STATE.md` - updated after each phase
- `.planning/ROADMAP.md` - progress updated after each phase
- Phase artifacts - CONTEXT.md, PLANs, SUMMARYs per phase

**After:** Milestone is complete and cleaned up.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/autonomous.md
@~/.claude/get-shit-done/references/ops-output.md
</execution_context>

<context>
Optional flag: `--from N` - start from phase N instead of the first incomplete phase.

Project context, phase list, and state are resolved inside the workflow using init commands plus `gsd-tools.cjs roadmap execution-plan`. No upfront context loading needed.
</context>

<process>
Execute the autonomous workflow from @~/.claude/get-shit-done/workflows/autonomous.md end-to-end.
Preserve all workflow gates (master-plan display, per-phase execution, blocker handling, progress display).
</process>
