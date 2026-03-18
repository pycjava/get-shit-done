# Operations Patterns

Reference guide for operations documentation and procedures in GSD projects.

---

## When To Use Operations Documentation

| Project Stage | Operations Docs Needed |
|---------------|------------------------|
| Greenfield, early MVP | Minimal - DEPLOYMENT.md only |
| Greenfield, pre-production | All 7 docs recommended |
| Brownfield, taking over | All 7 docs recommended |
| Scaling / production | All 7 docs plus regular audits |

---

## Document Purposes

### OPERATIONS.md

**Purpose:** Central hub for operations strategy, ownership, and environment posture.

**When to create:** Always.

### DEPLOYMENT.md

**Purpose:** Step-by-step deployment and rollback procedures.

**When to create:** Any environment beyond local development.

### MONITORING.md

**Purpose:** Observability stack, alerts, dashboards, and SLOs.

**When to create:** Any production or user-facing system.

### CAPACITY.md

**Purpose:** Capacity baselines, forecasts, scaling breakpoints, and headroom targets.

**When to create:** When growth, peak load, or fixed infrastructure limits matter.

### RUNBOOK.md

**Purpose:** Incident response procedures and known operational failure modes.

**When to create:** When the system is operational.

### BACKUP.md

**Purpose:** Backup, restore, and disaster recovery procedures.

**When to create:** When persistent data storage exists.

### SECURITY-OPS.md

**Purpose:** Security operations, secrets handling, access control, and compliance procedures.

**When to create:** When handling user data, sensitive systems, or regulated workloads.

---

## Key Sections By Document

| Document | Key Sections |
|----------|--------------|
| OPERATIONS.md | Objectives, environments, CI/CD, ownership, escalation |
| DEPLOYMENT.md | Strategy, checklists, procedure, rollback, verification |
| MONITORING.md | Stack, metrics, alerts, dashboards, SLOs |
| CAPACITY.md | Baseline load, peak assumptions, forecasts, bottlenecks, scaling plan |
| RUNBOOK.md | Severity levels, troubleshooting, communications, postmortems |
| BACKUP.md | RTO/RPO, schedules, restore procedure, DR testing |
| SECURITY-OPS.md | Auth, secrets, scanning, incidents, controls |

---

## Integration Points

### With `/gsd:new-project`

After initial project setup, offer:

```text
/gsd:ops-runbook
```

Start with:
- OPERATIONS.md
- DEPLOYMENT.md
- CAPACITY.md when the project expects growth or constrained infrastructure

### With `/gsd:complete-milestone`

Review:
- OPERATIONS.md for ownership and environment drift
- DEPLOYMENT.md for rollout changes
- MONITORING.md for thresholds and dashboards
- CAPACITY.md for forecast and headroom changes
- RUNBOOK.md for new incidents

### With `/gsd:execute-phase`

Reference:
- DEPLOYMENT.md for release-related work
- MONITORING.md for metrics and alerts
- CAPACITY.md for scaling changes or load-sensitive work
- RUNBOOK.md for risky operational changes

---

## Document Relationships

```text
OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── CAPACITY.md
├── RUNBOOK.md
├── BACKUP.md
└── SECURITY-OPS.md

CAPACITY.md links back to:
- DEPLOYMENT.md for scale changes
- MONITORING.md for trigger signals
- RUNBOOK.md for saturation incidents
- BACKUP.md for storage growth impacts
```

---

## Maintenance Schedule

| Document | Review Frequency | Trigger Events |
|----------|------------------|----------------|
| OPERATIONS.md | Quarterly | Team changes, new environments |
| DEPLOYMENT.md | Per-release | New deployment procedures |
| MONITORING.md | Quarterly | New features, scale changes |
| CAPACITY.md | Monthly or per-release | Launches, growth changes, storage growth, new limits |
| RUNBOOK.md | After incidents | New issue patterns |
| BACKUP.md | Quarterly | New data types, compliance changes |
| SECURITY-OPS.md | Quarterly | Audits, incidents, new threats |

---

## Quick Reference Commands

### Generate Operations Docs

```bash
/gsd:ops-runbook
```

### Audit Operations Coverage

```bash
/gsd:ops-audit
```

### Check Operations Status

```bash
ls -la .planning/operations/
```

### Commit Operations Changes

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "ops: update [document]" --files .planning/operations/
```

---

## Common Patterns

### Minimal Operations (MVP)

```text
.planning/operations/
└── DEPLOYMENT.md
```

### Standard Operations (Production)

```text
.planning/operations/
├── OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── CAPACITY.md
├── RUNBOOK.md
└── BACKUP.md
```

### Full Operations (Enterprise)

```text
.planning/operations/
├── OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── CAPACITY.md
├── RUNBOOK.md
├── BACKUP.md
└── SECURITY-OPS.md
```

---

## Anti-Patterns

**Don't:**
- Create all 7 docs for a simple CLI tool with no operational surface
- Skip CAPACITY.md when traffic, storage, or queue growth is already a concern
- Copy templates without replacing placeholders
- Leave thresholds, owners, or review dates empty

**Do:**
- Match documentation depth to project complexity
- Keep thresholds and headroom assumptions explicit
- Cross-link scaling plans with monitoring and deployment docs
- Review capacity after launches, migrations, and major growth changes

---

*Last updated: 2026*
*Part of GSD Operations Suite*
