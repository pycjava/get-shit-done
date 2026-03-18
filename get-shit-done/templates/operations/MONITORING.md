---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/MONITORING.md"
---

# Monitoring Template

Template for `.planning/operations/MONITORING.md` — monitoring, alerting, and observability configuration.

<template>

```markdown
# Monitoring & Alerting

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]

---

## Observability Stack

### Tools Overview

| Layer | Tool | Purpose | Retention |
|-------|------|---------|-----------|
| Metrics | [e.g., Prometheus, Datadog] | Time-series data | [e.g., 30 days] |
| Logs | [e.g., CloudWatch, ELK] | Log aggregation | [e.g., 14 days] |
| Traces | [e.g., Jaeger, X-Ray] | Distributed tracing | [e.g., 7 days] |
| Dashboards | [e.g., Grafana, Datadog] | Visualization | N/A |
| Alerts | [e.g., PagerDuty, Opsgenie] | Alert routing | N/A |

### Architecture

```
Application
    │
    ├── Metrics ──► [Metrics Store] ──► [Dashboards]
    │                                      │
    ├── Logs ────► [Log Store] ────────────┤
    │                                      │
    └── Traces ──► [Trace Store] ──────────┤
                                           │
                                      [Alert Manager]
                                           │
                                      [On-Call Team]
```

---

## Key Metrics

### Golden Signals (RED Method)

| Metric | Description | Warning | Critical |
|--------|-------------|---------|----------|
| **Rate** | Requests per second | [threshold] | [threshold] |
| **Errors** | Error rate (%) | [threshold] | [threshold] |
| **Duration** | Response time (P95) | [threshold] | [threshold] |

### USE Method (Resources)

| Resource | Utilization | Saturation | Errors |
|----------|-------------|------------|--------|
| CPU | [threshold] | [threshold] | N/A |
| Memory | [threshold] | [threshold] | N/A |
| Disk I/O | [threshold] | [threshold] | [threshold] |
| Network | [threshold] | [threshold] | [threshold] |

### Application Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `[metric_name]` | Counter/Gauge/Histogram | [description] | [threshold] |
| `[metric_name]` | Counter/Gauge/Histogram | [description] | [threshold] |

### Business Metrics

| Metric | Description | Target | Current |
|--------|-------------|--------|---------|
| Active Users | Daily active users | [target] | [current] |
| Conversion Rate | Sign-ups / visits | [target] | [current] |
| Revenue | Daily revenue | [target] | [current] |

---

## Alerting Rules

### Critical Alerts (Page Immediately)

| Alert | Condition | Response Time | Runbook |
|-------|-----------|---------------|---------|
| Service Down | Health check fails > 2min | 5min | [Link] |
| Error Rate High | Error rate > 5% for 5min | 5min | [Link] |
| Response Time Critical | P95 > 2s for 5min | 10min | [Link] |
| Database Connection Failed | DB unreachable | 5min | [Link] |

### Warning Alerts (Notify, No Page)

| Alert | Condition | Response Time | Runbook |
|-------|-----------|---------------|---------|
| Error Rate Elevated | Error rate > 1% for 10min | 30min | [Link] |
| Response Time Degraded | P95 > 500ms for 10min | 30min | [Link] |
| Memory Usage High | Memory > 80% for 15min | 1hr | [Link] |
| Disk Space Low | Disk > 85% used | 4hr | [Link] |

### Alert Routing

| Severity | Channel | Recipients |
|----------|---------|------------|
| Critical | PagerDuty + Slack | On-call + Team channel |
| Warning | Slack | Team channel |
| Info | Email | Team mailing list |

---

## Dashboards

### Main Dashboard

**Purpose:** High-level system health overview

| Panel | Metric | Visualization |
|-------|--------|---------------|
| Request Rate | Requests/sec | Line graph |
| Error Rate | Errors/sec, % | Line graph + Stat |
| Response Time | P50, P95, P99 | Line graph |
| Active Users | Current users | Stat |
| System Health | Up/Down status | Status panel |

### Application Dashboard

**Purpose:** Detailed application metrics

| Panel | Metric | Visualization |
|-------|--------|---------------|
| Endpoint Performance | Latency by endpoint | Heatmap |
| Database Queries | Query time distribution | Histogram |
| Cache Hit Rate | Hit/Miss ratio | Pie chart |
| Background Jobs | Queue depth, processing time | Line graph |

### Infrastructure Dashboard

**Purpose:** Resource utilization

| Panel | Metric | Visualization |
|-------|--------|---------------|
| CPU Usage | By service | Line graph |
| Memory Usage | By service | Line graph |
| Disk I/O | Read/Write | Line graph |
| Network Traffic | In/Out | Line graph |

---

## Logging Strategy

### Log Levels

| Level | Usage | Examples |
|-------|-------|----------|
| ERROR | Failures requiring attention | Unhandled exceptions, service failures |
| WARN | Potential issues | Deprecated API use, retry attempts |
| INFO | Significant events | Request start/end, state changes |
| DEBUG | Detailed diagnostics | Variable values, flow tracing |

### Log Format

```json
{
  "timestamp": "ISO8601",
  "level": "ERROR|WARN|INFO|DEBUG",
  "service": "service-name",
  "trace_id": "correlation-id",
  "message": "Human readable message",
  "context": {
    "key": "value"
  }
}
```

### Log Retention

| Environment | Retention | Reason |
|-------------|-----------|--------|
| Development | 7 days | Debugging |
| Staging | 14 days | Testing, debugging |
| Production | 30 days | Compliance, debugging |

---

## Distributed Tracing

### Trace Configuration

| Setting | Value |
|---------|-------|
| Sampling Rate | [e.g., 10% of requests] |
| Max Spans per Trace | [e.g., 1000] |
| Propagation Format | [e.g., W3C Trace Context] |

### Key Spans

| Span Name | Service | Purpose |
|-----------|---------|---------|
| `http.request` | API Gateway | Incoming requests |
| `db.query` | Database | Database operations |
| `cache.get/set` | Cache | Cache operations |
| `external.api` | External | Third-party calls |

---

## SLO/SLI Definitions

### Service Level Objectives

| SLO | Target | Measurement Window | Current |
|-----|--------|-------------------|---------|
| Availability | 99.9% | Monthly | [current] |
| Latency (P95) | < 200ms | Monthly | [current] |
| Error Rate | < 0.1% | Monthly | [current] |

### Error Budget

| Metric | Value |
|--------|-------|
| Monthly Budget | [e.g., 43.2 min downtime] |
| Remaining | [current remaining] |
| Last Reset | [date] |

---

## On-Call Procedures

### Alert Response

```
1. Acknowledge alert (within 5 min)
2. Assess severity
3. Check runbook for known issues
4. Investigate using dashboards/logs
5. Communicate status to team
6. Resolve or escalate
7. Document incident
```

### Escalation Triggers

- Alert not acknowledged within 10 min
- Issue not identified within 30 min
- Resolution not progressing within 1 hour
- Customer-facing impact confirmed

---

## Monitoring Maintenance

### Regular Tasks

| Task | Frequency | Owner |
|------|-----------|-------|
| Review alert thresholds | Monthly | On-call lead |
| Update dashboards | As needed | Team |
| Audit log retention | Quarterly | Ops team |
| Test alert routing | Monthly | On-call |

### Alert Tuning

| Metric | Last Tuned | Reason |
|--------|------------|--------|
| [Alert name] | [Date] | [Reason for change] |

---

## Related Documents

- [OPERATIONS.md](./OPERATIONS.md) — Operations overview
- [RUNBOOK.md](./RUNBOOK.md) — Incident response
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment procedures

---

*Monitoring audit: [date]*
*Update when monitoring requirements change*
```

</template>

<guidelines>

**What This Is:**
- Monitoring and alerting configuration
- Key metrics and thresholds
- Dashboard definitions
- SLO/SLI tracking

**Observability Stack:**
- Document all monitoring tools
- Note retention periods
- Include architecture diagram

**Key Metrics:**
- Use RED method for services (Rate, Errors, Duration)
- Use USE method for resources (Utilization, Saturation, Errors)
- Include business metrics for context

**Alerting Rules:**
- Separate critical vs warning alerts
- Define clear response times
- Link to runbooks
- Document routing

**Dashboards:**
- Create purpose-driven dashboards
- Include key visualizations
- Update as system evolves

**Logging:**
- Standardize log format
- Define log levels clearly
- Set appropriate retention

**SLO/SLI:**
- Set realistic targets
- Track error budgets
- Review regularly

**On-Call:**
- Define response procedures
- Set escalation triggers
- Document responsibilities

</guidelines>
