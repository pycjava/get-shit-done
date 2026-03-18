---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/DEPLOYMENT.md"
---

# Deployment Template

Template for `.planning/operations/DEPLOYMENT.md` — deployment procedures and strategies.

<template>

```markdown
# Deployment Procedures

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]

---

## Deployment Strategy

### Strategy Overview

**Type:** [Blue-Green / Rolling / Canary / Feature Flags]

| Aspect | Configuration |
|--------|---------------|
| Strategy | [Type] |
| Rollback | [Automated/Manual] |
| Rollback Time | [e.g., <5min] |
| Zero-Downtime | [Yes/No] |

### Strategy Details

[Detailed explanation of chosen deployment strategy:
- How it works for this project
- Why this strategy was chosen
- Trade-offs and considerations]

---

## Pre-Deployment Checklist

### Code Review

- [ ] All PRs approved by at least one reviewer
- [ ] No unresolved review comments
- [ ] Branch up to date with target branch

### Testing

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing (if applicable)
- [ ] Performance tests passing (if applicable)
- [ ] Security scan completed

### Configuration

- [ ] Environment variables verified
- [ ] Secrets rotated (if scheduled)
- [ ] Feature flags configured
- [ ] Capacity headroom verified for expected rollout traffic
- [ ] Database migrations tested

### Communication

- [ ] Deployment announced to team
- [ ] Stakeholders notified (if maintenance window)
- [ ] Rollback plan documented

---

## Deployment Process

### Step-by-Step Procedure

```
1. Pre-deployment
   ├── Verify all checks passed
   ├── Confirm deployment target
   └── Notify team

2. Deployment
   ├── [Step 1: e.g., Create new release tag]
   ├── [Step 2: e.g., Build production image]
   ├── [Step 3: e.g., Deploy to canary]
   ├── [Step 4: e.g., Monitor canary for 10min]
   └── [Step 5: e.g., Promote to full deployment]

3. Post-deployment
   ├── Verify health checks
   ├── Run smoke tests
   ├── Monitor error rates
   └── Confirm deployment success
```

### Deployment Commands

| Environment | Command | Duration |
|-------------|---------|----------|
| Development | `[command]` | ~[X]min |
| Staging | `[command]` | ~[X]min |
| Production | `[command]` | ~[X]min |

### Automated Checks

| Check | Threshold | Action on Failure |
|-------|-----------|-------------------|
| Health Check | 200 OK | Auto-rollback |
| Error Rate | <1% | Alert, manual review |
| Response Time | P95 <500ms | Alert, manual review |
| Capacity Headroom | >20% remaining at expected peak | Scale first or hold deploy |
| Memory Usage | <80% | Alert, scale up |

---

## Rollback Procedures

### Automatic Rollback Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Health check failure | >3 consecutive failures | Immediate rollback |
| Error rate spike | >5% errors | Immediate rollback |
| Response time degradation | >2x baseline | Alert + manual decision |

### Manual Rollback

```bash
# Rollback command
[rollback command]

# Verify rollback
[verification command]
```

### Rollback Decision Tree

```
Issue Detected
    │
    ├── Critical (service down)?
    │   └── Yes → Immediate rollback, investigate later
    │
    ├── Degraded (partial functionality)?
    │   └── Yes → Assess impact
    │       ├── User-facing? → Rollback
    │       └── Internal only? → Monitor, decide in 15min
    │
    └── Minor (cosmetic, non-blocking)?
        └── Monitor, fix in next deploy
```

---

## Environment Variables

### Required Variables

| Variable | Environment | Description | Secret? |
|----------|-------------|-------------|---------|
| `DATABASE_URL` | All | Database connection | Yes |
| `API_KEY` | All | External API key | Yes |
| `NODE_ENV` | All | Environment mode | No |
| `LOG_LEVEL` | All | Logging verbosity | No |

### Environment-Specific Variables

**Development:**
```
NODE_ENV=development
LOG_LEVEL=debug
[Other dev-specific vars]
```

**Staging:**
```
NODE_ENV=staging
LOG_LEVEL=info
[Other staging-specific vars]
```

**Production:**
```
NODE_ENV=production
LOG_LEVEL=warn
[Other prod-specific vars]
```

### Secrets Management

| Secret | Storage | Rotation | Last Rotated |
|--------|---------|----------|--------------|
| [Secret 1] | [e.g., AWS Secrets Manager] | [e.g., 90 days] | [Date] |
| [Secret 2] | [e.g., Vault] | [e.g., 30 days] | [Date] |

---

## Database Migrations

### Migration Strategy

- **Approach:** [Forward-only / Reversible]
- **Execution:** [Pre-deploy / During deploy / Post-deploy]
- **Backup:** [Automatic / Manual]

### Migration Checklist

- [ ] Migration tested on staging
- [ ] Rollback migration prepared
- [ ] Database backup taken
- [ ] Migration timing estimated
- [ ] Application compatible with old and new schema

### Migration Commands

```bash
# Run migrations
[migration command]

# Check migration status
[status command]

# Rollback migration (if reversible)
[rollback command]
```

---

## Post-Deployment Verification

### Smoke Tests

| Test | Endpoint | Expected | Automated? |
|------|----------|----------|------------|
| Health check | `/health` | 200 OK | Yes |
| API status | `/api/status` | 200 OK | Yes |
| Database connection | `/api/db-check` | 200 OK | Yes |
| Authentication | `/api/auth/verify` | 200/401 | Yes |

### Monitoring Period

| Timeframe | Actions |
|-----------|---------|
| 0-15 min | Watch error rates, response times |
| 15-60 min | Monitor user-facing metrics |
| 1-24 hr | Track business metrics, user reports |

### Success Criteria

- [ ] All smoke tests passing
- [ ] Error rate within normal bounds
- [ ] Response times within SLA
- [ ] Capacity headroom acceptable after deploy
- [ ] No user-reported issues
- [ ] Monitoring dashboards green

---

## Deployment Log

| Date | Version | Environment | Deployer | Status | Notes |
|------|---------|-------------|----------|--------|-------|
| [Date] | [v1.2.3] | Production | [Name] | ✓/✗ | [Notes] |

---

## Related Documents

- [CAPACITY.md](./CAPACITY.md) - Capacity baselines and scaling plan

- [OPERATIONS.md](./OPERATIONS.md) — Operations overview
- [RUNBOOK.md](./RUNBOOK.md) — Incident response
- [BACKUP.md](./BACKUP.md) — Backup procedures

---

*Last deployment: [date]*
*Update when deployment procedures change*
```

</template>

<guidelines>

**What This Is:**
- Detailed deployment procedures
- Step-by-step instructions
- Rollback procedures
- Environment configuration

**Deployment Strategy:**
- Choose strategy based on:
  - Service criticality
  - Team experience
  - Infrastructure capabilities
  - Rollback requirements

**Pre-Deployment Checklist:**
- Customize for project needs
- Include all critical checks
- Update as process evolves

**Rollback Procedures:**
- Define clear triggers
- Document decision tree
- Practice rollback regularly

**Environment Variables:**
- Never include actual values
- Document rotation schedules
- Note storage location for secrets

**Database Migrations:**
- Plan for backward compatibility
- Test on staging first
- Always have rollback plan

**Post-Deployment:**
- Define smoke tests
- Set monitoring periods
- Document success criteria

</guidelines>
