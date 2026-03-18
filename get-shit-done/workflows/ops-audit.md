<purpose>
Audit existing operations documentation and infrastructure for a project. Identifies gaps, outdated information, and provides recommendations for improvement.
</purpose>

<required_reading>

1. `.planning/PROJECT.md` — Project context
2. `.planning/ROADMAP.md` — Project roadmap
3. `.planning/config.json` — Project configuration
4. `.planning/operations/OPERATIONS.md` — Operations overview (if exists)
5. `.planning/operations/DEPLOYMENT.md` — Deployment procedures (if exists)
6. `.planning/operations/MONITORING.md` — Monitoring configuration (if exists)
7. `.planning/operations/RUNBOOK.md` — Incident response (if exists)
8. `.planning/operations/BACKUP.md` — Backup procedures (if exists)
9. `.planning/operations/SECURITY-OPS.md` — Security operations (if exists)

</required_reading>

<process>

## 0. Parse Arguments

**Parse `$ARGUMENTS` before anything else:**

```
argument = trim($ARGUMENTS)
```

| Argument value | Behavior |
|---|---|
| empty / `"all"` | Audit all existing operations documents |
| `"deployment"` / `"runbook"` / etc. | Audit only the named document (case-insensitive filename match) |

Store as `target_doc` (null = all). Use throughout the workflow to filter which document(s) to audit.

## 1. Setup

**MANDATORY FIRST STEP — Execute:**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init ops-audit)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `project_name`, `project_stage`, `ops_dir`, `existing_docs` (array of `{name, mtime}`), `has_operations`, `planning_exists`, `ops_weights`.

**If `planning_exists` is false:** Error — No .planning directory found. Run `/gsd:new-project` first.

**If `target_doc` is set:** Filter `existing_docs` to only the matching document before proceeding.

## 2. Assess Project Context

Read PROJECT.md to understand:

| Aspect | What to Look For |
|--------|-----------------|
| Project Type | Web app, API, CLI, mobile, etc. |
| Scale | MVP, growth, enterprise |
| Data Sensitivity | None, user data, financial, health |
| Compliance | None, GDPR, SOC2, HIPAA, PCI-DSS |
| Team Size | Solo, small team, large team |
| Deployment Target | Local, cloud, hybrid |

This context determines which operations docs are essential vs optional.

## 3. Check Document Existence

```bash
ls -la .planning/operations/ 2>/dev/null || echo "No operations directory"
```

Document status matrix:

| Document | Status | Last Updated |
|----------|--------|--------------|
| OPERATIONS.md | Exists/Missing | [date if exists] |
| DEPLOYMENT.md | Exists/Missing | [date if exists] |
| MONITORING.md | Exists/Missing | [date if exists] |
| RUNBOOK.md | Exists/Missing | [date if exists] |
| BACKUP.md | Exists/Missing | [date if exists] |
| SECURITY-OPS.md | Exists/Missing | [date if exists] |

## 4. Audit Existing Documents

For each existing document, check completeness:

### OPERATIONS.md Audit Checklist

- [ ] Operations strategy defined
- [ ] Core objectives with measurable targets
- [ ] Environment configuration documented
- [ ] CI/CD pipeline overview
- [ ] Team responsibilities clear
- [ ] On-call rotation defined
- [ ] Escalation path documented
- [ ] Key decisions tracked

### DEPLOYMENT.md Audit Checklist

- [ ] Deployment strategy specified (blue-green, rolling, etc.)
- [ ] Pre-deployment checklist complete
- [ ] Step-by-step deployment procedure
- [ ] Rollback procedures documented
- [ ] Environment variables listed (not values)
- [ ] Database migration strategy
- [ ] Post-deployment verification steps
- [ ] Deployment log maintained

### MONITORING.md Audit Checklist

- [ ] Observability stack documented
- [ ] Key metrics defined (RED: Rate, Errors, Duration)
- [ ] Resource metrics defined (USE: Utilization, Saturation, Errors)
- [ ] Alert rules with thresholds
- [ ] Alert routing and escalation
- [ ] Dashboard descriptions
- [ ] SLOs/SLIs defined
- [ ] On-call procedures

### RUNBOOK.md Audit Checklist

- [ ] Severity levels defined
- [ ] Emergency contacts current
- [ ] Common issues documented
- [ ] Troubleshooting steps provided
- [ ] Communication templates ready
- [ ] Post-mortem template available
- [ ] Knowledge base started

### BACKUP.md Audit Checklist

- [ ] Backup strategy defined
- [ ] RTO/RPO targets set
- [ ] Backup schedule documented
- [ ] Recovery procedures step-by-step
- [ ] DR scenarios covered
- [ ] Testing schedule defined
- [ ] Retention policy documented

### SECURITY-OPS.md Audit Checklist

- [ ] Authentication methods documented
- [ ] Authorization model (RBAC) defined
- [ ] Secrets management documented
- [ ] Network architecture diagram
- [ ] Data classification complete
- [ ] Vulnerability scanning configured
- [ ] Security incident response
- [ ] Compliance controls mapped

## 5. Identify Gaps

### Missing Documents

Based on project context, identify which documents are:

| Priority | Document | When Required |
|----------|----------|---------------|
| **Critical** | DEPLOYMENT.md | Any production deployment |
| **Critical** | RUNBOOK.md | Any production system |
| **High** | MONITORING.md | Production or user-facing |
| **High** | BACKUP.md | Persistent data storage |
| **High** | SECURITY-OPS.md | User data or compliance |
| **Medium** | OPERATIONS.md | Team > 1 or multiple environments |

### Incomplete Documents

For each existing document, list missing sections:

| Document | Missing Sections | Impact |
|----------|-----------------|--------|
| [Doc] | [Section] | [High/Medium/Low] |

### Outdated Information

**Primary check — staleness by file age:**

Use `mtime` from `existing_docs` (provided by init — no extra shell call needed):

```
for each doc in existing_docs:
  days_old = (now - parse(doc.mtime)) / 86400000
  if days_old > 90 → mark STALE
  elif days_old > 60 → mark AGING
```

**Cross-reference checks (deeper validation):**

| Check | How to verify |
|---|---|
| Deployment target | Doc mentions Vercel/AWS/GCP → check if `vercel.json` / `Dockerfile` / `*.tf` exists |
| Dependency versions | Doc references specific tool versions → compare against `package.json` / `requirements.txt` |
| Team members | Names in on-call table → compare against PROJECT.md team section |
| CI/CD platform | Doc references GitHub Actions → verify `.github/workflows/` exists |
| Monitoring tools | Doc references Sentry/Datadog → check `package.json` for those deps |

**Flag as outdated if ANY cross-reference mismatch found**, even if file age < 90 days.

## 6. Infrastructure Scan (Optional)

If codebase map exists, cross-reference:

```bash
# Check for deployment configs
ls -la .github/workflows/ 2>/dev/null
ls -la Dockerfile docker-compose.yml 2>/dev/null
ls -la vercel.json netlify.toml 2>/dev/null

# Check for monitoring configs
ls -la prometheus.yml grafana/ 2>/dev/null
grep -r "sentry\|datadog\|newrelic" package.json 2>/dev/null

# Check for backup configs
grep -r "backup\|snapshot" . --include="*.yml" 2>/dev/null
```

Compare found infrastructure with documented infrastructure.

## 7. Generate Audit Report

Present findings:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► OPERATIONS AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Project:** [Name]
**Audit Date:** [Date]
**Project Stage:** [MVP/Production/Enterprise]

## Document Coverage

| Document | Status | Completeness |
|----------|--------|--------------|
| OPERATIONS.md | ✓/✗ | [X]% |
| DEPLOYMENT.md | ✓/✗ | [X]% |
| MONITORING.md | ✓/✗ | [X]% |
| RUNBOOK.md | ✓/✗ | [X]% |
| BACKUP.md | ✓/✗ | [X]% |
| SECURITY-OPS.md | ✓/✗ | [X]% |

## Critical Gaps

1. [Gap 1] — [Impact]
2. [Gap 2] — [Impact]

## Recommendations

### Immediate (Do Now)
- [ ] [Action 1]
- [ ] [Action 2]

### Short-term (This Sprint)
- [ ] [Action 3]
- [ ] [Action 4]

### Long-term (Next Quarter)
- [ ] [Action 5]

## Audit Score

**Overall:** [X]/100

**Weights:** [default / custom from config.json `ops_weights`]

| Category | Score | Weight | Config key |
|---|---|---|---|
| Deployment | [X]/100 | 25% | `ops_weights.deployment` |
| Monitoring | [X]/100 | 20% | `ops_weights.monitoring` |
| Incident Response | [X]/100 | 20% | `ops_weights.incident_response` |
| Backup/Recovery | [X]/100 | 15% | `ops_weights.backup_recovery` |
| Security | [X]/100 | 20% | `ops_weights.security` |

**If `ops_weights` provided by init:** use each key's value as the percentage weight. Warn if weights don't sum to 100. Fall back to defaults for any missing key.

**Recommended presets by project type:**

| Project Type | Deployment | Monitoring | Incident | Backup | Security |
|---|---|---|---|---|---|
| Frontend-only SPA | 30% | 15% | 15% | 5% | 35% |
| API / Backend | 25% | 25% | 20% | 15% | 15% |
| Data platform | 20% | 20% | 15% | 30% | 15% |
| Compliance-heavy | 20% | 15% | 15% | 15% | 35% |
```

## 8. Offer Actions

Use AskUserQuestion:

- header: "Next Step"
- question: "What would you like to do?"
- options:
  - "Generate missing docs" — Run /gsd:ops-runbook for missing documents
  - "Update existing docs" — Edit specific documents to fill gaps
  - "Save audit report" — Create .planning/operations/AUDIT-[date].md
  - "Done" — Exit without changes

**If "Generate missing docs":**
- Identify which documents to generate
- Run `/gsd:ops-runbook [doc-names]`

**If "Update existing docs":**
- List incomplete documents
- User selects which to edit
- Open for editing

**If "Save audit report":**
```bash
# Write audit report
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "ops: audit report [date]" --files .planning/operations/AUDIT-[date].md
```

</process>

<output>

- Audit report displayed to user
- Optional: `.planning/operations/AUDIT-[date].md` if saved
- Optional: Updated operations documents if user chooses to fix gaps

</output>

<success_criteria>

- [ ] Project context assessed
- [ ] All existing operations docs reviewed
- [ ] Missing documents identified
- [ ] Incomplete sections identified
- [ ] Outdated information flagged
- [ ] Recommendations provided
- [ ] Audit score calculated
- [ ] User offered action options
- [ ] User knows next steps

</success_criteria>
