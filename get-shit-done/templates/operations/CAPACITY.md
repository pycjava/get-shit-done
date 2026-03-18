---
version: "1.0"
compatible_with: "gsd >= 2.0"
last_reviewed: "2026-03"
template_for: ".planning/operations/CAPACITY.md"
---

# Capacity Planning Template

Template for `.planning/operations/CAPACITY.md` - capacity baselines, forecasts, and scaling strategy.

<template>

```markdown
# Capacity Planning

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD]
**Owner:** [Team/Person responsible]

---

## Capacity Objectives

| Objective | Target | Current | Status |
|-----------|--------|---------|--------|
| Peak CPU Headroom | [e.g., >30%] | [current] | [On Track / Risk / Blocked] |
| Peak Memory Headroom | [e.g., >25%] | [current] | [On Track / Risk / Blocked] |
| Queue Backlog Recovery | [e.g., <15 min] | [current] | [On Track / Risk / Blocked] |
| Storage Growth Budget | [e.g., <10% per month] | [current] | [On Track / Risk / Blocked] |
| Cost Ceiling | [e.g., <$X/month] | [current] | [On Track / Risk / Blocked] |

---

## Workload Profile

### Traffic Characteristics

| Workload | Normal | Peak | Burst Pattern | Notes |
|----------|--------|------|---------------|-------|
| API Requests | [baseline] | [peak] | [daily/weekly/event-driven] | [notes] |
| Background Jobs | [baseline] | [peak] | [pattern] | [notes] |
| Scheduled Tasks | [baseline] | [peak] | [pattern] | [notes] |
| External Integrations | [baseline] | [peak] | [pattern] | [notes] |

### Data Growth

| Data Domain | Current Size | Monthly Growth | Peak Growth Trigger | Retention |
|-------------|--------------|----------------|---------------------|-----------|
| Primary Database | [size] | [growth] | [trigger] | [retention] |
| Object Storage | [size] | [growth] | [trigger] | [retention] |
| Logs | [size] | [growth] | [trigger] | [retention] |
| Backups | [size] | [growth] | [trigger] | [retention] |

### Dependency Limits

| Dependency | Limit Type | Current Usage | Limit | Notes |
|------------|------------|---------------|-------|-------|
| Database | Connections / throughput | [usage] | [limit] | [notes] |
| Cache | Memory / ops | [usage] | [limit] | [notes] |
| Queue | Throughput / depth | [usage] | [limit] | [notes] |
| Third-Party API | Rate limit | [usage] | [limit] | [notes] |

---

## Current Baseline

### Service Baseline

| Service | Replicas / Size | CPU Peak | Memory Peak | Latency P95 | Error Rate |
|---------|------------------|----------|-------------|-------------|------------|
| [service-name] | [count/size] | [value] | [value] | [value] | [value] |
| [service-name] | [count/size] | [value] | [value] | [value] | [value] |

### Infrastructure Baseline

| Resource | Current Capacity | Average Utilization | Peak Utilization | Headroom |
|----------|------------------|---------------------|------------------|----------|
| Compute | [value] | [value] | [value] | [value] |
| Database | [value] | [value] | [value] | [value] |
| Cache | [value] | [value] | [value] | [value] |
| Storage | [value] | [value] | [value] | [value] |
| Network | [value] | [value] | [value] | [value] |

### Cost Baseline

| Area | Current Monthly Cost | Cost Driver | Forecast Sensitivity |
|------|----------------------|-------------|----------------------|
| Compute | [cost] | [driver] | [high/medium/low] |
| Database | [cost] | [driver] | [high/medium/low] |
| Storage | [cost] | [driver] | [high/medium/low] |
| Observability | [cost] | [driver] | [high/medium/low] |

---

## Forecast

### Demand Forecast

| Horizon | Requests / Jobs | Storage Growth | Peak Concurrency | Cost Estimate |
|---------|------------------|----------------|------------------|---------------|
| Next 30 Days | [forecast] | [forecast] | [forecast] | [estimate] |
| Next 90 Days | [forecast] | [forecast] | [forecast] | [estimate] |
| Next 12 Months | [forecast] | [forecast] | [forecast] | [estimate] |

### Planning Assumptions

- [Assumption about user or traffic growth]
- [Assumption about launches, regions, or new customers]
- [Assumption about retention or data expansion]
- [Assumption about vendor or infrastructure limits]

### Scenario Planning

| Scenario | Trigger | Expected Impact | Mitigation |
|----------|---------|-----------------|------------|
| Planned Launch | [date/event] | [impact] | [mitigation] |
| Traffic Spike | [condition] | [impact] | [mitigation] |
| Dependency Slowdown | [condition] | [impact] | [mitigation] |
| Storage Growth Surprise | [condition] | [impact] | [mitigation] |

---

## Scaling Strategy

### Scaling Actions

| Constraint | Trigger | Action | Owner | Lead Time |
|------------|---------|--------|-------|-----------|
| Compute Saturation | [threshold] | [scale out/up action] | [owner] | [lead time] |
| Database Saturation | [threshold] | [action] | [owner] | [lead time] |
| Queue Backlog | [threshold] | [action] | [owner] | [lead time] |
| Storage Utilization | [threshold] | [action] | [owner] | [lead time] |

### Deployment Coupling

- [How deployment strategy changes at higher load]
- [What must be verified before traffic increases]
- [What rollback looks like during saturation]

### Cost Controls

- [Reserved capacity / autoscaling / limits]
- [Spend alerts and approval path]
- [Low-priority workload shedding plan]

---

## Validation

### Load and Stress Testing

| Test | Goal | Environment | Last Run | Result |
|------|------|-------------|----------|--------|
| Baseline Load Test | Confirm steady-state limits | [env] | [date] | [result] |
| Peak Load Test | Validate expected peak | [env] | [date] | [result] |
| Stress Test | Find breaking point | [env] | [date] | [result] |
| Recovery Test | Validate recovery after saturation | [env] | [date] | [result] |

### Review Cadence

| Review | Frequency | Owner |
|--------|-----------|-------|
| Headroom Review | Weekly | [owner] |
| Forecast Refresh | Monthly | [owner] |
| Cost Review | Monthly | [owner] |
| Scaling Drill | Quarterly | [owner] |

---

## Alerts and Triggers

| Signal | Warning | Critical | Action |
|--------|---------|----------|--------|
| CPU Headroom | [threshold] | [threshold] | [action] |
| Memory Headroom | [threshold] | [threshold] | [action] |
| Queue Depth | [threshold] | [threshold] | [action] |
| Database Connections | [threshold] | [threshold] | [action] |
| Storage Utilization | [threshold] | [threshold] | [action] |
| Cost Burn Rate | [threshold] | [threshold] | [action] |

---

## Risks and Bottlenecks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| [risk] | [L/M/H] | [L/M/H] | [mitigation] | [owner] |
| [risk] | [L/M/H] | [L/M/H] | [mitigation] | [owner] |

---

## Decision Log

| Date | Decision | Rationale | Review Date |
|------|----------|-----------|-------------|
| [date] | [decision] | [why] | [date] |
| [date] | [decision] | [why] | [date] |

---

## Related Documents

- [OPERATIONS.md](./OPERATIONS.md) - Operations overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [MONITORING.md](./MONITORING.md) - Monitoring and alerting
- [RUNBOOK.md](./RUNBOOK.md) - Incident response
- [BACKUP.md](./BACKUP.md) - Backup and recovery

---

*Capacity review: [date]*
*Update after launches, sustained growth changes, or infrastructure limit changes*
```

</template>

<guidelines>

**What This Is:**
- Capacity baseline and forecast document
- Scaling strategy and trigger reference
- Load validation and headroom planning
- Cost and dependency limit visibility

**Workload Profile:**
- Capture normal, peak, and burst behavior
- Include data growth and retention assumptions
- Note third-party or platform limits

**Current Baseline:**
- Record real measured baselines, not guesses
- Track headroom for each critical resource
- Include cost drivers when scale has budget impact

**Forecasting:**
- Keep assumptions explicit
- Review after launches, migrations, and customer growth
- Use multiple horizons to avoid reactive scaling

**Scaling Strategy:**
- Define exact triggers and owners
- Note lead times for manual capacity changes
- Connect scaling plans to deployment and rollback procedures

**Validation:**
- Use load, stress, and recovery testing
- Refresh thresholds when baseline changes
- Review on a regular cadence

**When to Update:**
- Before launches or migrations
- After significant traffic or storage changes
- When vendor limits or pricing changes
- After incidents caused by saturation

</guidelines>
