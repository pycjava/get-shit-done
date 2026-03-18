---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/OPERATIONS.md"
---

# Operations Overview Template

Template for `.planning/operations/OPERATIONS.md` — the operations strategy overview document.

<template>

```markdown
# Operations Overview

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]
**Owner:** [Team/Person responsible]

---

## Operations Strategy

### Philosophy

[One paragraph describing the operations philosophy:
- How the team approaches reliability, availability, and maintainability
- Key principles that guide operational decisions
- Balance between speed and stability]

### Core Objectives

| Objective | Target | Current | Status |
|-----------|--------|---------|--------|
| Availability | [e.g., 99.9%] | [current %] | [✓/⚠/✗] |
| Response Time (P95) | [e.g., <200ms] | [current] | [✓/⚠/✗] |
| Deployment Frequency | [e.g., daily] | [current] | [✓/⚠/✗] |
| Mean Time to Recovery | [e.g., <1hr] | [current] | [✓/⚠/✗] |
| Change Failure Rate | [e.g., <5%] | [current] | [✓/⚠/✗] |

---

## Environment Configuration

### Environment Tiers

| Environment | Purpose | URL | Auto-Deploy |
|-------------|---------|-----|-------------|
| Development | Feature development | [URL] | On push to `develop` |
| Staging | Pre-production testing | [URL] | On merge to `main` |
| Production | Live users | [URL] | Manual approval |

### Configuration Management

| Config Type | Storage | Rotation | Access |
|-------------|---------|----------|--------|
| Environment Variables | [e.g., Vercel Dashboard] | [frequency] | [who can access] |
| Secrets | [e.g., Vault, AWS Secrets] | [frequency] | [who can access] |
| Feature Flags | [e.g., LaunchDarkly] | N/A | [who can access] |

---

## CI/CD Pipeline

### Pipeline Overview

```
[Diagram or description of CI/CD flow]
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Commit │ -> │  Build  │ -> │  Test   │ -> │ Deploy  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Pipeline Stages

| Stage | Trigger | Duration | Critical Checks |
|-------|---------|----------|-----------------|
| Build | Every push | ~[X]min | Compilation, lint |
| Test | After build | ~[X]min | Unit, integration |
| Security Scan | After test | ~[X]min | SAST, dependency |
| Deploy (Dev) | On develop | ~[X]min | Smoke tests |
| Deploy (Prod) | Manual | ~[X]min | Canary, rollback ready |

### Deployment Strategy

- **Strategy:** [Blue-Green / Rolling / Canary / Feature Flags]
- **Rollback:** [Automated / Manual] - [trigger conditions]
- **Maintenance Windows:** [When/None]

---

## Team Responsibilities

### On-Call Rotation

| Role | Primary | Backup | Schedule |
|------|---------|--------|----------|
| [Role 1] | [Person/Team] | [Person/Team] | [Rotation] |
| [Role 2] | [Person/Team] | [Person/Team] | [Rotation] |

### Escalation Path

```
Level 1: On-Call Engineer (Response: 5min)
    ↓ (15min no resolution)
Level 2: Senior Engineer (Response: 15min)
    ↓ (30min no resolution)
Level 3: Engineering Manager (Response: 30min)
    ↓ (1hr no resolution)
Level 4: VP Engineering (Response: 1hr)
```

---

## Key Operational Decisions

| Decision | Rationale | Date | Outcome |
|----------|-----------|------|---------|
| [Decision 1] | [Why] | [Date] | [✓/⚠/—] |
| [Decision 2] | [Why] | [Date] | [✓/⚠/—] |

---

## Related Documents

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment procedures
- [MONITORING.md](./MONITORING.md) — Monitoring and alerting
- [RUNBOOK.md](./RUNBOOK.md) — Incident response
- [BACKUP.md](./BACKUP.md) — Backup and recovery
- [SECURITY-OPS.md](./SECURITY-OPS.md) — Security operations

---

*Operations audit: [date]*
*Update when operational requirements change*
```

</template>

<guidelines>

**What This Is:**
- High-level operations strategy document
- Defines operational objectives and targets
- Documents environment configuration
- Outlines CI/CD pipeline
- Specifies team responsibilities

**Core Objectives:**
- Use DORA metrics where applicable
- Set realistic, measurable targets
- Track current status for visibility
- Update quarterly or when targets change

**Environment Configuration:**
- Document all environments
- Specify configuration storage
- Note rotation schedules for secrets
- Define access controls

**CI/CD Pipeline:**
- Visual diagram helps understanding
- Document stage durations
- Note critical checks at each stage
- Specify deployment strategy and rollback

**Team Responsibilities:**
- Clear on-call rotation
- Defined escalation path with timing
- Update when team changes

**Key Operational Decisions:**
- Track significant operational choices
- Include rationale for future reference
- Note outcomes for learning

**When to Update:**
- New environments added
- CI/CD pipeline changes
- Team structure changes
- Operational targets adjusted
- After major incidents

</guidelines>
