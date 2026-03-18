# Features

## Operations Planning Backbone

- File-based state under `.planning/`
- Phase and milestone driven workflow
- Thin workflow orchestrators that delegate to specialized agents
- Verified execution with summaries and verification artifacts

## Operations-Specific Capabilities

- Service and environment initialization through `PROJECT.md`
- Requirements and roadmap artifacts oriented around operational readiness
- Phase discussion focused on rollout, alerting, recovery, ownership, security, and dependencies
- Runbook generation for deployment, monitoring, backup, incident response, and security ops
- Operations auditing for stale or missing documents

## Brownfield Support

- Codebase and service mapping via `/gsd:map-codebase`
- Existing systems can be brought under the same phased workflow without changing the framework

## Validation and Control

- Plan checking before execution
- Post-execution verification against phase goals
- UAT-style operational validation for drills and acceptance checks
- Health validation for `.planning/` structure and config

## Utilities Retained

- Progress, pause/resume, cleanup, update, and settings commands
- Debugging and validation helpers
- Wave-based parallel execution model
