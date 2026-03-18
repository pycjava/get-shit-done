---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/RUNBOOK.md"
---

# Runbook Template

Template for `.planning/operations/RUNBOOK.md` — incident response and troubleshooting procedures.

<template>

```markdown
# Operations Runbook

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]
**On-Call:** [Current on-call rotation link]

---

## Quick Reference

### Emergency Contacts

| Role | Primary | Backup | Contact |
|------|---------|--------|---------|
| On-Call Engineer | [Name] | [Name] | [Phone/Slack] |
| Engineering Manager | [Name] | — | [Phone/Slack] |
| VP Engineering | [Name] | — | [Phone/Slack] |

### Critical Commands

| Action | Command |
|--------|---------|
| Check service status | `[command]` |
| Restart service | `[command]` |
| Rollback deployment | `[command]` |
| Scale up | `[command]` |
| View recent logs | `[command]` |

### Service Endpoints

| Service | Health Check | Dashboard |
|---------|--------------|-----------|
| API | `/health` | [Link] |
| Database | `/db-health` | [Link] |
| Cache | `/cache-health` | [Link] |

### Capacity Escalation Reference

- Check current utilization against `CAPACITY.md` thresholds before improvising manual scaling.
- Prefer documented scale actions before increasing limits or changing instance classes.
- Record emergency scaling decisions in the capacity decision log after the incident.

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time | Example |
|-------|------------|---------------|---------|
| **SEV1** | Complete service outage | 5 min | All users affected |
| **SEV2** | Major functionality broken | 15 min | Core feature down |
| **SEV3** | Degraded performance | 30 min | Slow response times |
| **SEV4** | Minor issue | 4 hr | Non-critical bug |

### Response Process

```
┌─────────────────────────────────────────────────────────────┐
│                     INCIDENT LIFECYCLE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DETECT ──► 2. TRIAGE ──► 3. RESPOND ──► 4. RESOLVE     │
│       │              │              │              │         │
│       ▼              ▼              ▼              ▼         │
│   Alert fires    Assess      Investigate     Fix issue     │
│   User reports   severity    Mitigate        Verify fix    │
│                              Communicate      Document      │
│                                                              │
│  5. POST-MORTEM ──► Review, learn, improve                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Communication Templates

**Incident Start:**
```
🚨 INCIDENT: [Brief description]
Severity: [SEV1/2/3/4]
Impact: [User impact]
Status: Investigating
Incident Commander: [Name]
```

**Status Update:**
```
📊 UPDATE: [Brief description]
Status: [Investigating/Identified/Monitoring/Resolved]
Progress: [What's been done]
Next Steps: [What's next]
ETA: [If known]
```

**Resolution:**
```
✅ RESOLVED: [Brief description]
Duration: [Total time]
Root Cause: [If known]
Fix: [What was done]
Post-mortem: [Date/Time]
```

---

## Common Issues

### Issue: Service Not Responding

**Symptoms:**
- Health checks failing
- 502/503 errors
- No response from endpoints

**Diagnosis:**
```bash
# Check service status
[status command]

# Check logs
[log command]

# Check resource usage
[resource command]
```

**Resolution Steps:**
1. Check if service is running
2. Check resource limits (CPU, memory)
3. Check for recent deployments
4. Review error logs
5. Restart service if needed
6. Rollback if caused by recent deploy

**Escalation:** If not resolved in 15 min, escalate to SEV1

---

### Issue: High Error Rate

**Symptoms:**
- Error rate > 1% (warning) or > 5% (critical)
- Increased 4xx/5xx responses
- User reports of failures

**Diagnosis:**
```bash
# Check error logs
[error log command]

# Check by error type
[group errors command]

# Check recent changes
[deployment history]
```

**Resolution Steps:**
1. Identify error patterns
2. Check for recent deployments
3. Check external dependencies
4. Check database connectivity
5. Apply hotfix or rollback
6. Monitor error rate

**Escalation:** If error rate > 5% for > 5 min, escalate to SEV2

---

### Issue: Slow Response Times

**Symptoms:**
- P95 latency > threshold
- User complaints about slowness
- Timeout errors

**Diagnosis:**
```bash
# Check response time distribution
[latency command]

# Check database query times
[db query time command]

# Check cache hit rates
[cache stats command]
```

**Resolution Steps:**
1. Identify slow endpoints
2. Check database query performance
3. Check cache effectiveness
4. Check for resource contention
5. Scale up if needed
6. Optimize slow queries

**Escalation:** If P95 > 2s for > 10 min, escalate to SEV2

---

### Issue: Database Connection Issues

**Symptoms:**
- Connection timeout errors
- "Too many connections" errors
- Query failures

**Diagnosis:**
```bash
# Check connection count
[connection count command]

# Check database health
[db health command]

# Check for locks
[lock check command]
```

**Resolution Steps:**
1. Check connection pool settings
2. Kill long-running queries
3. Check for table locks
4. Restart connection pool
5. Scale database if needed

**Escalation:** If database unreachable > 5 min, escalate to SEV1

---

### Issue: Memory/CPU Exhaustion

**Symptoms:**
- OOM errors
- Service restarts
- Slow performance

**Diagnosis:**
```bash
# Check memory usage
[memory command]

# Check CPU usage
[cpu command]

# Check process list
[process command]
```

**Resolution Steps:**
1. Identify resource-heavy processes
2. Check for memory leaks
3. Scale up resources
4. Restart affected services
5. Investigate root cause

**Escalation:** If service crashed, escalate to SEV2

---

### Issue: External Service Failure

**Symptoms:**
- Third-party API errors
- Payment processing failures
- Authentication failures

**Diagnosis:**
```bash
# Check external service status
[status check command]

# Check error responses
[error log command]

# Test connectivity
[connectivity test]
```

**Resolution Steps:**
1. Check service status page
2. Enable fallback/circuit breaker
3. Switch to backup provider if available
4. Communicate to users
5. Monitor for recovery

**Escalation:** If business-critical service down, escalate to SEV2

---

## Maintenance Procedures

### Planned Maintenance

**Pre-Maintenance:**
- [ ] Notify stakeholders 24h in advance
- [ ] Prepare rollback plan
- [ ] Verify backup integrity
- [ ] Set up monitoring alerts

**During Maintenance:**
- [ ] Enable maintenance mode
- [ ] Perform maintenance tasks
- [ ] Verify all services healthy
- [ ] Disable maintenance mode

**Post-Maintenance:**
- [ ] Run smoke tests
- [ ] Monitor for 1 hour
- [ ] Document changes
- [ ] Notify stakeholders of completion

### Emergency Maintenance

1. Announce maintenance immediately
2. Enable maintenance mode
3. Perform necessary fixes
4. Verify and restore service
5. Post-incident review

---

## Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** [Date]
**Duration:** [Start time] - [End time] ([Total duration])
**Severity:** [SEV1/2/3/4]
**Author:** [Name]

## Summary
[2-3 sentence summary of the incident]

## Impact
- **Users affected:** [Number/percentage]
- **Duration:** [Time]
- **Business impact:** [Revenue, reputation, etc.]

## Timeline
| Time | Event |
|------|-------|
| [Time] | [What happened] |
| [Time] | [What happened] |

## Root Cause
[Detailed explanation of what caused the incident]

## Contributing Factors
- [Factor 1]
- [Factor 2]

## Resolution
[How the incident was resolved]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Name] | [Date] | [ ] |
| [Action 2] | [Name] | [Date] | [ ] |

## Lessons Learned
- [Lesson 1]
- [Lesson 2]

## Appendix
- [Links to logs, dashboards, etc.]
```

---

## Knowledge Base

### Recent Incidents

| Date | Issue | Resolution | Runbook Updated? |
|------|-------|------------|------------------|
| [Date] | [Brief description] | [How resolved] | [Yes/No] |

### Known Workarounds

| Issue | Workaround | Permanent Fix Status |
|-------|------------|---------------------|
| [Issue] | [Workaround] | [Planned/In Progress/None] |

---

## Related Documents

- [CAPACITY.md](./CAPACITY.md) - Capacity baselines and scaling plan

- [OPERATIONS.md](./OPERATIONS.md) — Operations overview
- [MONITORING.md](./MONITORING.md) — Monitoring configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment procedures

---

*Runbook review: [date]*
*Update after each incident or quarterly*
```

</template>

<guidelines>

**What This Is:**
- Incident response procedures
- Common issue troubleshooting
- Communication templates
- Post-mortem process

**Quick Reference:**
- Critical info at top
- Emergency contacts
- Key commands
- Service endpoints

**Incident Response:**
- Define severity levels clearly
- Document response process
- Provide communication templates
- Set escalation triggers

**Common Issues:**
- Document symptoms
- Provide diagnosis commands
- List resolution steps
- Define escalation criteria

**Maintenance:**
- Planned vs emergency procedures
- Checklists for each phase
- Communication requirements

**Post-Mortem:**
- Standardized template
- Focus on learning
- Track action items
- Update runbook based on findings

**Knowledge Base:**
- Track recent incidents
- Document workarounds
- Link to permanent fixes

**Maintenance:**
- Review after each incident
- Update quarterly minimum
- Keep commands current
- Verify contacts

</guidelines>
