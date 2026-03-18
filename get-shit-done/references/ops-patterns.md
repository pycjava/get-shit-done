# Operations Patterns

Reference guide for operations documentation and procedures in GSD projects.

---

## When to Use Operations Documentation

| Project Stage | Operations Docs Needed |
|---------------|----------------------|
| Greenfield, early MVP | Minimal - DEPLOYMENT.md only |
| Greenfield, pre-production | All 6 docs recommended |
| Brownfield, taking over | All 6 docs recommended |
| Scaling / production | All 6 docs + regular audits |

---

## Document Purposes

### OPERATIONS.md

**Purpose:** Central hub for all operations information

**When to create:** Always - this is the entry point

**Key sections:**
- Operations strategy and objectives
- Environment configuration
- CI/CD pipeline overview
- Team responsibilities and on-call

### DEPLOYMENT.md

**Purpose:** Step-by-step deployment procedures

**When to create:** When deploying to any environment beyond local development

**Key sections:**
- Deployment strategy
- Pre-deployment checklist
- Step-by-step procedure
- Rollback procedures
- Post-deployment verification

### MONITORING.md

**Purpose:** Observability configuration and thresholds

**When to create:** When system goes to production or has user-facing components

**Key sections:**
- Observability stack
- Key metrics (RED/USE methods)
- Alert rules and routing
- Dashboard definitions

### RUNBOOK.md

**Purpose:** Incident response procedures

**When to create:** When system is operational

**Key sections:**
- Severity levels
- Common issue troubleshooting
- Communication templates
- Post-mortem template

### BACKUP.md

**Purpose:** Backup and disaster recovery

**When to create:** When persistent data storage exists

**Key sections:**
- Backup strategy and schedule
- Recovery procedures
- Disaster recovery scenarios
- Testing schedule

### SECURITY-OPS.md

**Purpose:** Security operations and compliance

**When to create:** When handling user data or sensitive information

**Key sections:**
- Access control
- Secrets management
- Vulnerability management
- Incident response

---

## Integration Points

### With /gsd:new-project

After initial project setup, offer to create basic operations docs:

```
After /gsd:new-project, consider running:
/gsd:ops-runbook

To generate:
- OPERATIONS.md (required)
- DEPLOYMENT.md (recommended)
```

### With /gsd:complete-milestone

During milestone completion, prompt to review/update operations docs:

```
As part of milestone completion:
- Review OPERATIONS.md for accuracy
- Update DEPLOYMENT.md with any new procedures
- Audit MONITORING.md thresholds
- Update RUNBOOK.md with any new issues encountered
```

### With /gsd:execute-phase

Reference operations docs in phase planning:

- Check DEPLOYMENT.md for deployment-related phases
- Reference MONITORING.md when adding new metrics
- Use RUNBOOK.md for incident-prone features

---

## Document Relationships

```
OPERATIONS.md
    │
    ├── DEPLOYMENT.md
    │       └── References: MONITORING.md (post-deploy checks)
    │
    ├── MONITORING.md
    │       └── References: RUNBOOK.md (alert response)
    │
    ├── RUNBOOK.md
    │       └── References: BACKUP.md (disaster scenarios)
    │                SECURITY-OPS.md (security incidents)
    │
    ├── BACKUP.md
    │       └── References: SECURITY-OPS.md (data protection)
    │
    └── SECURITY-OPS.md
            └── References: MONITORING.md (security logging)
```

---

## Maintenance Schedule

| Document | Review Frequency | Trigger Events |
|----------|-----------------|-----------------|
| OPERATIONS.md | Quarterly | Team changes, new environments |
| DEPLOYMENT.md | Per-release | New deployment procedures |
| MONITORING.md | Quarterly | New features, scale changes |
| RUNBOOK.md | After incidents | Any new issue patterns |
| BACKUP.md | Quarterly | New data types, compliance changes |
| SECURITY-OPS.md | Quarterly | Compliance audits, new threats |

---

## Quick Reference Commands

### Generate Operations Docs

```bash
/gsd:ops-runbook
```

### Check Operations Status

```bash
ls -la .planning/operations/
```

### Update Specific Document

```bash
# Edit directly
nano .planning/operations/DEPLOYMENT.md
```

### Commit Operations Changes

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "ops: update [document]" --files .planning/operations/
```

---

## Common Patterns

### Minimal Operations (MVP)

```
.planning/operations/
└── DEPLOYMENT.md    # Basic deployment steps only
```

### Standard Operations (Production)

```
.planning/operations/
├── OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── RUNBOOK.md
└── BACKUP.md
```

### Full Operations (Enterprise)

```
.planning/operations/
├── OPERATIONS.md
├── DEPLOYMENT.md
├── MONITORING.md
├── RUNBOOK.md
├── BACKUP.md
└── SECURITY-OPS.md
```

---

## Anti-Patterns

**Don't:**
- Create all 6 docs for a simple CLI tool
- Skip operations docs for production systems
- Copy-paste without customizing to project
- Leave placeholders unfilled
- Forget to update after incidents

**Do:**
- Match documentation to project complexity
- Fill in actual values, not placeholders
- Reference specific commands and tools
- Review and update regularly
- Test rollback procedures

---

*Last updated: 2025*
*Part of GSD Operations Suite*
