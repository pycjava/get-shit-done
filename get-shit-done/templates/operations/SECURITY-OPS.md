---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/SECURITY-OPS.md"
---

# Security Operations Template

Template for `.planning/operations/SECURITY-OPS.md` — security operations and compliance procedures.

<template>

```markdown
# Security Operations

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]
**Security Owner:** [Team/Person]

---

## Security Overview

### Security Philosophy

[One paragraph describing security approach:
- How security is balanced with usability
- Key principles (defense in depth, least privilege, etc.)
- Security vs velocity considerations]

### Security Posture

| Area | Current State | Target | Priority |
|------|--------------|--------|----------|
| Access Control | [State] | [Target] | [P1/P2/P3] |
| Data Protection | [State] | [Target] | [P1/P2/P3] |
| Network Security | [State] | [Target] | [P1/P2/P3] |
| Vulnerability Management | [State] | [Target] | [P1/P2/P3] |
| Incident Response | [State] | [Target] | [P1/P2/P3] |

---

## Access Control

### Authentication

| Method | Environment | Status | Notes |
|--------|-------------|--------|-------|
| Email/Password | [Env] | [Enabled/Disabled] | [Notes] |
| OAuth (Google) | [Env] | [Enabled/Disabled] | [Notes] |
| SSO (SAML/OIDC) | [Env] | [Enabled/Disabled] | [Notes] |
| API Keys | [Env] | [Enabled/Disabled] | [Notes] |
| Service-to-Service | [Env] | [Enabled/Disabled] | [Notes] |

### Password Policy

| Setting | Policy | Enforcement |
|---------|--------|-------------|
| Minimum Length | 12 characters | Yes |
| Complexity | Letters + numbers + symbols | Yes |
| MFA Required | [Roles] | [Yes/No] |
| Password Expiry | [e.g., 90 days] | [Yes/No] |
| Account Lockout | [e.g., 5 failed attempts] | Yes |

### Authorization

**RBAC Model:**

| Role | Permissions | Users |
|------|-------------|-------|
| Admin | Full access | [Count] |
| Editor | Create, edit, delete own | [Count] |
| Viewer | Read-only | [Count] |
| API Service | Limited service access | [Count] |

**Permission Model:**
- Principle of least privilege
- Role-based access control (RBAC)
- Regular access reviews (quarterly)

---

## Secrets Management

### Secrets Storage

| Secret Type | Storage | Access | Rotation |
|------------|--------|--------|----------|
| API Keys | [e.g., AWS Secrets Manager] | [Who] | [Schedule] |
| Database Credentials | [e.g., Vault] | [Who] | [Schedule] |
| OAuth Secrets | [e.g., AWS Secrets Manager] | [Who] | [Schedule] |
| Encryption Keys | [e.g., AWS KMS] | [Who] | [Schedule] |
| SSH Keys | [e.g., AWS Secrets Manager] | [Who] | [Schedule] |

### Secrets Rotation

| Secret | Rotation Frequency | Last Rotated | Automated? |
|--------|-------------------|--------------|------------|
| [Secret 1] | [Frequency] | [Date] | [Yes/No] |
| [Secret 2] | [Frequency] | [Date] | [Yes/No] |

### Secrets Management Checklist

- [ ] No secrets in code
- [ ] No secrets in config files
- [ ] No secrets in logs
- [ ] Secrets use environment-specific values
- [ ] Access logs enabled
- [ ] Rotation automated

---

## Network Security

### Network Architecture

```
[Internet]
    │
    ▼
┌─────────────────┐
│   WAF/CDN      │  (CloudFlare, AWS CloudFront)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Load Balancer │  (ALB, Nginx)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│  App  │ │  App  │  (Private subnet)
│Server │ │Server │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│  Database      │  (Private subnet)
│  (RDS/CloudSQL)│
└─────────────────┘
```

### Firewall Rules

| Source | Destination | Port | Protocol | Purpose |
|--------|-------------|------|----------|---------|
| WAF/Load Balancer | App Servers | 443 | HTTPS | Web traffic |
| App Servers | Database | 5432 | PostgreSQL | Database access |
| CI/CD | App Servers | 22 | SSH | Deployment |
| Monitoring | App Servers | 443 | HTTPS | Health checks |

### VPN/Bastion

| Component | Purpose | Access |
|-----------|---------|--------|
| [Bastion/Jump Host] | SSH access to private network | [Who has access] |
| [VPN] | Remote access to internal network | [Who has access] |

---

## Data Protection

### Data Classification

| Classification | Description | Examples | Handling |
|----------------|-------------|----------|----------|
| Public | Can be freely shared | Marketing content | No restrictions |
| Internal | Company-only | Internal docs | Access control |
| Confidential | Restricted access | User data, financials | Encryption required |
| Secret | Highly sensitive | Credentials, keys | Strict access, audit |

### Encryption

| Data State | Method | Key Management | Standard |
|------------|--------|----------------|----------|
| At Rest | [AES-256] | [KMS] | FIPS 140-2 |
| In Transit | TLS 1.3 | [Certificate Manager] | - |
| Backups | [AES-256] | [Separate key] | - |

### PII Handling

| Data | Collection | Storage | Access | Retention |
|------|------------|---------|--------|-----------|
| Email | User input | Encrypted | Admin only | Account deletion |
| Name | User input | Encrypted | Admin only | Account deletion |
| [Other PII] | [Method] | [Storage] | [Access] | [Retention] |

---

## Vulnerability Management

### Scanning Schedule

| Scan Type | Frequency | Tool | Responsible |
|-----------|-----------|------|--------------|
| SAST (Static) | Every commit | [e.g., SonarQube] | Automated |
| DAST (Dynamic) | Weekly | [e.g., OWASP ZAP] | [Team] |
| Dependency | Every PR | [e.g., Snyk] | Automated |
| Container | Every build | [e.g., Trivy] | Automated |
| Infrastructure | Monthly | [e.g., Prowler] | [Team] |

### Vulnerability Response

| Severity | Response Time | Example |
|----------|--------------|---------|
| Critical (9.0-10.0) | 24 hours | Remote code execution |
| High (7.0-8.9) | 7 days | SQL injection |
| Medium (4.0-6.9) | 30 days | Information disclosure |
| Low (0.1-3.9) | 90 days | Minor issues |

### Known Vulnerabilities

| CVE/ID | Severity | Description | Status | Remediation |
|--------|----------|-------------|--------|-------------|
| [CVE-XXXX-XXXX] | [Critical] | [Description] | [Open/Fixed] | [Fix/Workaround] |

---

## Security Monitoring

### Security Logging

| Log Type | Retention | Storage | Alert |
|----------|-----------|---------|-------|
| Authentication | 1 year | [Storage] | Failed login > 5 |
| Authorization | 90 days | [Storage] | Unauthorized access |
| API Requests | 30 days | [Storage] | Suspicious patterns |
| Infrastructure | 1 year | [Storage] | Configuration changes |
| Database | 1 year | [Storage] | Schema changes |

### SIEM/SOAR

| Tool | Purpose | Integration |
|------|---------|-------------|
| [e.g., Datadog] | Log aggregation | [Sources] |
| [e.g., PagerDuty] | Alert management | [Sources] |
| [e.g., Slack] | Team notification | [Channels] |

### Alert Rules

| Alert | Condition | Response |
|-------|-----------|----------|
| Multiple failed logins | > 5 in 10 min | Alert on-call |
| Suspicious API activity | Anomaly detected | Alert security team |
| New admin account | Account created | Alert immediately |
| Database export | Large export detected | Alert security team |

---

## Incident Response

### Security Incident Levels

| Level | Definition | Example | Response Team |
|-------|------------|---------|---------------|
| P1 - Critical | Active breach, data exposed | Ransomware | Full incident response |
| P2 - High | Potential breach | Suspicious access | Security team |
| P3 - Medium | Security policy violation | Minor exposure | Team lead |
| P4 - Low | Policy advisory | Configuration drift | Notify only |

### Incident Response Process

```
1. DETECT
   ├── Automated alerts
   ├── Manual discovery
   └── User reports

2. CONTAIN
   ├── Isolate affected systems
   ├── Preserve evidence
   └── Prevent spread

3. ERADICATE
   ├── Remove threat
   ├── Patch vulnerabilities
   └── Secure systems

4. RECOVER
   ├── Restore services
   ├── Verify integrity
   └── Monitor for recurrence

5. POST-INCIDENT
   ├── Document findings
   ├── Root cause analysis
   └── Implement improvements
```

### Security Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Security Lead | [Name] | [Email/Phone] | 24/7 |
| On-Call | [Name] | [Email/Phone] | 24/7 |
| Engineering Lead | [Name] | [Email/Phone] | Business hours |
| Legal/Compliance | [Name] | [Email/Phone] | Business hours |

---

## Compliance

### Compliance Frameworks

| Framework | Status | Last Audit | Next Audit |
|-----------|--------|-----------|------------|
| SOC 2 | [Compliant/In Progress] | [Date] | [Date] |
| GDPR | [Compliant/In Progress] | [Date] | [Date] |
| [Other] | [Status] | [Date] | [Date] |

### Compliance Controls

| Control | Framework | Implementation | Evidence |
|---------|-----------|----------------|----------|
| Access logging | SOC 2 | [Method] | [Location] |
| Encryption | GDPR | [Method] | [Location] |
| [Other] | [Framework] | [Method] | [Location] |

### Security Audits

| Audit Type | Frequency | Last | Next | Owner |
|------------|-----------|------|------|-------|
| Penetration Testing | Annual | [Date] | [Date] | [Team] |
| Security Review | Quarterly | [Date] | [Date] | [Team] |
| Access Review | Quarterly | [Date] | [Date] | [Team] |

---

## Security Training

| Training | Frequency | Audience | Completion |
|----------|-----------|----------|------------|
| Security Awareness | Annual | All employees | [X]% |
| Phishing Simulation | Quarterly | All employees | [X]% |
| Developer Security | Onboarding | Engineers | [X]% |
| Incident Response | Annual | On-call | [X]% |

---

## Related Documents

- [OPERATIONS.md](./OPERATIONS.md) — Operations overview
- [MONITORING.md](./MONITORING.md) — Monitoring configuration
- [RUNBOOK.md](./RUNBOOK.md) — Incident response
- [BACKUP.md](./BACKUP.md) — Backup procedures

---

*Security review: [date]*
*Update quarterly or after security incidents*
```

</template>

<guidelines>

**What This Is:**
- Security operations procedures
- Access control and authorization
- Secrets management
- Incident response

**Security Overview:**
- Document security philosophy
- Track security posture
- Set priorities for improvements

**Access Control:**
- Document authentication methods
- Define password policies
- Map roles and permissions

**Secrets Management:**
- Never include actual secrets
- Document storage solutions
- Track rotation schedules

**Network Security:**
- Document network architecture
- Define firewall rules
- Control access to internal resources

**Data Protection:**
- Classify data by sensitivity
- Document encryption methods
- Track PII handling

**Vulnerability Management:**
- Define scanning schedule
- Set response SLAs
- Track known vulnerabilities

**Security Monitoring:**
- Enable comprehensive logging
- Set up alert rules
- Document SIEM integration

**Incident Response:**
- Define incident levels
- Document response process
- Keep contacts current

**Compliance:**
- Track compliance frameworks
- Document controls
- Schedule regular audits

**Training:**
- Document training requirements
- Track completion rates
- Update content regularly

</guidelines>
