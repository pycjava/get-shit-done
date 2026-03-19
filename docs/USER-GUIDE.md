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

### 3. Phase planning and execution

Run:

1. `/gsd:plan-phase N`
2. `/gsd:execute-phase N`
3. `/gsd:verify-work N`

During planning, classify each plan by its primary operational signal when helpful:

- `Latency`
- `Traffic`
- `Errors`
- `Saturation`

### 4. Optional discussion and automation
This trimmed edition keeps the flow manual and explicit. Plan, execute, verify, then refresh ops docs.

### 5. Operations documentation

Run:

1. `/gsd:ops-runbook`
2. `/gsd:ops-audit`

### 6. Release and doc refresh model

- Weekly deployments can still be manual.
- The framework does not assume CI/CD auto-promotion.
- Refresh ops docs on deployment checkpoints, major operational changes, or incidents.
- Do not treat every code commit as a required doc update event.

## Typical Outputs

- Phase plans for signal-focused operational work packages
- Summaries that capture monitoring coverage, alert candidates, business watchpoints, and runbook impact
- Runbooks covering deployment, monitoring, capacity, backup, security ops, and incident response

## Command Surface

Only the core operations commands remain in this trimmed edition:

- `/gsd:map-codebase`
- `/gsd:new-project`
- `/gsd:plan-phase`
- `/gsd:execute-phase`
- `/gsd:verify-work`
- `/gsd:ops-runbook`
- `/gsd:ops-audit`
