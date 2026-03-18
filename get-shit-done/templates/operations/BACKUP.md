---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/BACKUP.md"
---

# Backup & Recovery Template

Template for `.planning/operations/BACKUP.md` — backup strategies and disaster recovery procedures.

<template>

```markdown
# Backup & Recovery

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]
**Recovery Owner:** [Team/Person]

---

## Backup Strategy

### Overview

| Aspect | Configuration |
|--------|---------------|
| Backup Type | [Full/Incremental/Differential] |
| Primary Storage | [e.g., AWS S3, GCS] |
| Secondary Storage | [e.g., Cross-region replication] |
| Encryption | [e.g., AES-256] |
| Retention Period | [e.g., 90 days] |

### Backup Schedule

| Data Type | Frequency | Retention | Storage Location |
|-----------|-----------|-----------|------------------|
| Database | [e.g., Hourly] | [e.g., 30 days] | [Location] |
| File Storage | [e.g., Daily] | [e.g., 90 days] | [Location] |
| Configuration | [e.g., On change] | [e.g., 1 year] | [Location] |
| Logs | [e.g., Daily] | [e.g., 14 days] | [Location] |

---

## Data Categories

### Critical Data (RPO < 1hr)

| Data | Backup Method | Frequency | Location |
|------|---------------|-----------|----------|
| User Database | [Method] | [Frequency] | [Location] |
| Transaction Logs | [Method] | [Frequency] | [Location] |
| [Other critical data] | [Method] | [Frequency] | [Location] |

### Important Data (RPO < 24hr)

| Data | Backup Method | Frequency | Location |
|------|---------------|-----------|----------|
| User Uploads | [Method] | [Frequency] | [Location] |
| Configuration | [Method] | [Frequency] | [Location] |
| [Other important data] | [Method] | [Frequency] | [Location] |

### Archive Data (RPO > 24hr)

| Data | Backup Method | Frequency | Location |
|------|---------------|-----------|----------|
| Historical Logs | [Method] | [Frequency] | [Location] |
| Analytics Data | [Method] | [Frequency] | [Location] |
| [Other archive data] | [Method] | [Frequency] | [Location] |

---

## Recovery Objectives

### RTO/RPO Targets

| System | RTO (Recovery Time) | RPO (Recovery Point) | Priority |
|--------|---------------------|----------------------|----------|
| Database | [e.g., 1 hour] | [e.g., 1 hour] | P1 |
| API Services | [e.g., 30 min] | [e.g., N/A] | P1 |
| File Storage | [e.g., 4 hours] | [e.g., 24 hours] | P2 |
| Analytics | [e.g., 24 hours] | [e.g., 24 hours] | P3 |

### Recovery Priority Order

```
1. Database (P1)
   └── Core data, user accounts, transactions

2. API Services (P1)
   └── Application functionality

3. Authentication (P1)
   └── User access

4. File Storage (P2)
   └── User uploads, assets

5. Monitoring (P3)
   └── Observability stack

6. Analytics (P3)
   └── Reporting, metrics
```

---

## Backup Procedures

### Database Backups

**Automated Backups:**
```bash
# Backup command (automated)
[backup command]

# Verify backup
[verify command]
```

**Manual Backups:**
```bash
# Create manual backup
[manual backup command]

# Verify backup integrity
[integrity check command]
```

**Backup Verification:**
- [ ] Automated daily backup verification
- [ ] Weekly restore test to staging
- [ ] Monthly full recovery drill

### File Storage Backups

**Backup Command:**
```bash
[file backup command]
```

**Verification:**
```bash
[verification command]
```

### Configuration Backups

**What's Backed Up:**
- Environment variables (encrypted)
- Infrastructure as Code (Terraform/CloudFormation)
- CI/CD pipeline configurations
- Monitoring/alerting rules

**Storage:**
```bash
[config backup location]
```

---

## Recovery Procedures

### Database Recovery

**Point-in-Time Recovery:**
```bash
# 1. Stop application services
[stop command]

# 2. Restore from backup
[restore command --timestamp "YYYY-MM-DD HH:MM:SS"]

# 3. Verify data integrity
[integrity check command]

# 4. Restart services
[start command]
```

**Full Database Restore:**
```bash
# 1. Stop application services
[stop command]

# 2. Drop existing database (if needed)
[drop command]

# 3. Restore from latest backup
[restore command --latest]

# 4. Run migrations (if needed)
[migration command]

# 5. Verify data integrity
[integrity check command]

# 6. Restart services
[start command]
```

### File Storage Recovery

```bash
# 1. Identify files to restore
[list command]

# 2. Restore files
[restore command]

# 3. Verify file integrity
[verify command]

# 4. Update permissions if needed
[permissions command]
```

### Configuration Recovery

```bash
# 1. Restore infrastructure config
[infra restore command]

# 2. Restore environment variables
[env restore command]

# 3. Apply configurations
[apply command]

# 4. Verify services
[verify command]
```

---

## Disaster Recovery

### DR Scenarios

| Scenario | Response | RTO | Procedure |
|----------|----------|-----|-----------|
| Single server failure | Failover to replica | 15 min | [Link] |
| Database corruption | Restore from backup | 1 hr | [Link] |
| Region outage | Failover to DR region | 4 hr | [Link] |
| Ransomware attack | Isolate and restore | 8 hr | [Link] |
| Total data center loss | Full DR activation | 24 hr | [Link] |

### DR Site Configuration

| Aspect | Primary | DR Site |
|--------|---------|---------|
| Region | [e.g., us-east-1] | [e.g., us-west-2] |
| Database | [Type] | [Replica type] |
| Storage | [Type] | [Replication] |
| DNS | [Provider] | [Failover config] |

### DR Activation Procedure

```
1. ASSESS
   ├── Confirm disaster scope
   ├── Notify stakeholders
   └── Activate incident response

2. PREPARE
   ├── Verify DR site readiness
   ├── Prepare DNS failover
   └── Notify users (if needed)

3. ACTIVATE
   ├── Promote DR database
   ├── Update DNS to DR site
   └── Verify services operational

4. MONITOR
   ├── Watch for issues
   ├── Communicate status
   └── Document timeline

5. RECOVER
   ├── Restore primary site
   ├── Sync data back
   └── Failback when ready
```

---

## Backup Testing

### Test Schedule

| Test Type | Frequency | Scope | Last Run |
|-----------|-----------|-------|----------|
| Backup Verification | Daily | Automated integrity check | [Date] |
| Restore Test | Weekly | Single table/collection | [Date] |
| Full Recovery Drill | Monthly | Complete system | [Date] |
| DR Drill | Quarterly | Full DR activation | [Date] |

### Test Procedure

**Weekly Restore Test:**
```bash
# 1. Create test environment
[create test env command]

# 2. Restore backup to test
[restore to test command]

# 3. Run verification tests
[test command]

# 4. Document results
[document command]

# 5. Clean up test environment
[cleanup command]
```

### Test Checklist

- [ ] Backup completed successfully
- [ ] Restore completed without errors
- [ ] Data integrity verified
- [ ] Application functions correctly with restored data
- [ ] Performance acceptable
- [ ] Results documented

---

## Retention Policy

### Retention Schedule

| Backup Type | Retention Period | Reason |
|-------------|------------------|--------|
| Hourly | 7 days | Quick recovery |
| Daily | 30 days | Standard recovery |
| Weekly | 90 days | Extended recovery |
| Monthly | 1 year | Compliance |
| Yearly | 7 years | Legal requirements |

### Purge Policy

```bash
# Automated purge command (runs daily)
[purge command --older-than 90d]
```

### Legal Hold

When legal hold is required:
1. Identify relevant backups
2. Copy to legal hold storage
3. Document chain of custody
4. Exclude from purge policies

---

## Monitoring & Alerts

### Backup Monitoring

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Backup Duration | > 2x normal | Warning |
| Backup Size | > 20% change | Warning |
| Backup Failure | Any failure | Critical |
| Storage Usage | > 80% capacity | Warning |

### Alert Configuration

```yaml
# Backup failure alert
- alert: BackupFailed
  expr: backup_status == 0
  for: 5m
  severity: critical
  annotations:
    summary: "Backup failed for {{ $labels.job }}"
```

---

## Compliance & Auditing

### Compliance Requirements

| Requirement | How Met | Evidence |
|-------------|---------|----------|
| Data retention | [Policy] | [Location] |
| Encryption at rest | [Method] | [Config] |
| Encryption in transit | [Method] | [Config] |
| Access logging | [Method] | [Location] |
| Recovery testing | [Schedule] | [Records] |

### Audit Trail

| Date | Action | Performed By | Result |
|------|--------|--------------|--------|
| [Date] | [Action] | [Name] | [Result] |

---

## Related Documents

- [OPERATIONS.md](./OPERATIONS.md) — Operations overview
- [RUNBOOK.md](./RUNBOOK.md) — Incident response
- [SECURITY-OPS.md](./SECURITY-OPS.md) — Security operations

---

*Backup review: [date]*
*Update when backup requirements change*
```

</template>

<guidelines>

**What This Is:**
- Backup strategy and procedures
- Recovery objectives (RTO/RPO)
- Disaster recovery procedures
- Testing and compliance

**Backup Strategy:**
- Define backup types and schedules
- Document storage locations
- Specify encryption requirements
- Set retention periods

**Data Categories:**
- Classify by criticality
- Set appropriate RPO for each
- Document backup methods

**Recovery Objectives:**
- Define RTO/RPO for each system
- Prioritize recovery order
- Document dependencies

**Recovery Procedures:**
- Step-by-step instructions
- Include verification steps
- Document rollback if recovery fails

**Disaster Recovery:**
- Define DR scenarios
- Document DR site configuration
- Create activation procedure

**Testing:**
- Regular restore tests
- Document results
- Update procedures based on findings

**Retention:**
- Balance cost vs recovery needs
- Consider compliance requirements
- Document legal hold process

**Compliance:**
- Map requirements to controls
- Maintain audit trail
- Regular compliance reviews

</guidelines>
