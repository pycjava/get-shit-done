# Command Reference

## Core Flow

| Command | Purpose | Produces |
|---|---|---|
| `/gsd:new-project` | Initialize an operations planning workspace | `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md` |
| `/gsd:map-codebase` | Map an existing service or codebase before planning | `.planning/codebase/*.md` |
| `/gsd:discuss-phase [N]` | Capture operational decisions for a phase | `{phase}-CONTEXT.md` |
| `/gsd:plan-phase [N]` | Research and plan the phase | `{phase}-RESEARCH.md`, `PLAN.md`, `VALIDATION.md` |
| `/gsd:execute-phase <N>` | Execute all plans in the phase | `SUMMARY.md`, `VERIFICATION.md` |
| `/gsd:verify-work [N]` | Validate drills, checks, and acceptance criteria | `{phase}-UAT.md` |

## Operations Docs

| Command | Purpose | Produces |
|---|---|---|
| `/gsd:ops-runbook` | Generate or refresh operational documentation | `.planning/operations/*.md` |
| `/gsd:ops-audit` | Audit operational documentation and coverage | Ops audit report |

## Milestones

| Command | Purpose |
|---|---|
| `/gsd:audit-milestone` | Verify milestone readiness and coverage |
| `/gsd:complete-milestone` | Archive the milestone |
| `/gsd:new-milestone` | Start the next milestone |
| `/gsd:plan-milestone-gaps` | Add phases for unresolved audit gaps |

## Phase Utilities

| Command | Purpose |
|---|---|
| `/gsd:add-phase` | Append a new phase |
| `/gsd:insert-phase` | Insert an urgent phase with decimal numbering |
| `/gsd:remove-phase` | Remove a future phase and renumber |
| `/gsd:list-phase-assumptions` | Preview planning assumptions |

## Runtime Utilities

| Command | Purpose |
|---|---|
| `/gsd:progress` | Show current project state |
| `/gsd:resume-work` | Restore working context |
| `/gsd:pause-work` | Save a handoff point |
| `/gsd:health` | Validate `.planning/` integrity |
| `/gsd:settings` | Edit workflow settings |
| `/gsd:set-profile` | Switch model profile quickly |
| `/gsd:update` | Update the installed package |
| `/gsd:help` | Show the concise command reference |

## Optional Support Commands

These remain because they support the framework, but they are secondary to the main operations workflow:

- `/gsd:debug`
- `/gsd:quick`
- `/gsd:do`
- `/gsd:stats`
- `/gsd:validate-phase`
- `/gsd:cleanup`
- `/gsd:reapply-patches`
- `/gsd:autonomous`
