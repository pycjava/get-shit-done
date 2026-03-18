# User Guide

## Recommended Flow

### 1. Brownfield discovery

Run `/gsd:map-codebase` when you are onboarding an existing system.

### 2. Project initialization

Run `/gsd:new-project` and capture:

- service purpose
- environment layout
- critical dependencies
- capacity assumptions and limits
- ownership boundaries
- operational constraints

### 3. Phase discussion

Run `/gsd:discuss-phase N` to lock decisions such as:

- deployment path
- capacity thresholds and scale triggers
- rollback approach
- monitoring and alerting
- backup and recovery
- incident workflow

### 4. One-command execution

Run `/gsd:autonomous` when you want the system to:

- build one unified master plan across all remaining phases
- show that plan before execution starts
- execute phase-by-phase automatically
- surface any TDD plans as `RED -> GREEN -> REFACTOR`

Use `--from N` if you want to start from a later phase.

### 5. Manual planning and execution

Run:

1. `/gsd:plan-phase N`
2. `/gsd:execute-phase N`
3. `/gsd:verify-work N`

### 6. Operations documentation

Run:

1. `/gsd:ops-runbook`
2. `/gsd:ops-audit`

### 7. Milestone closeout

Run:

1. `/gsd:audit-milestone`
2. `/gsd:complete-milestone`

## Typical Outputs

- Phase plans for specific operational work packages
- Summaries and verification reports after execution
- Runbooks covering deployment, monitoring, capacity, backup, security ops, and incident response

## Recovery Utilities

- `/gsd:progress`
- `/gsd:resume-work`
- `/gsd:pause-work`
- `/gsd:health`
- `/gsd:debug`
