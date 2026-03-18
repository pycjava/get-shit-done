# User Guide

## Recommended Flow

### 1. Brownfield discovery

Run `/gsd:map-codebase` when you are onboarding an existing system.

### 2. Project initialization

Run `/gsd:new-project` and capture:

- service purpose
- environment layout
- critical dependencies
- ownership boundaries
- operational constraints

### 3. Phase discussion

Run `/gsd:discuss-phase N` to lock decisions such as:

- deployment path
- rollback approach
- monitoring and alerting
- backup and recovery
- incident workflow

### 4. Planning and execution

Run:

1. `/gsd:plan-phase N`
2. `/gsd:execute-phase N`
3. `/gsd:verify-work N`

### 5. Operations documentation

Run:

1. `/gsd:ops-runbook`
2. `/gsd:ops-audit`

### 6. Milestone closeout

Run:

1. `/gsd:audit-milestone`
2. `/gsd:complete-milestone`

## Typical Outputs

- Phase plans for specific operational work packages
- Summaries and verification reports after execution
- Runbooks covering deployment, monitoring, backup, security ops, and incident response

## Recovery Utilities

- `/gsd:progress`
- `/gsd:resume-work`
- `/gsd:pause-work`
- `/gsd:health`
- `/gsd:debug`
