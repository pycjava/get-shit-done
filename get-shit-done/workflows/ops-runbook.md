<purpose>
Generate operations runbook for the project. Creates OPERATIONS.md, DEPLOYMENT.md, MONITORING.md, CAPACITY.md, RUNBOOK.md, BACKUP.md, and SECURITY-OPS.md based on project context.
</purpose>

<required_reading>

1. `.planning/PROJECT.md` — Project context and requirements
2. `.planning/ROADMAP.md` — Project roadmap
3. `.planning/config.json` — Project configuration
4. `get-shit-done/templates/operations/OPERATIONS.md` — Operations template
5. `get-shit-done/templates/operations/DEPLOYMENT.md` — Deployment template
6. `get-shit-done/templates/operations/MONITORING.md` — Monitoring template
7. `get-shit-done/templates/operations/RUNBOOK.md` — Runbook template
8. `get-shit-done/templates/operations/BACKUP.md` — Backup template
9. `get-shit-done/templates/operations/SECURITY-OPS.md` — Security template
10. `get-shit-done/templates/operations/CAPACITY.md` — Capacity planning template

</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP — Execute:**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init ops-runbook)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

Parse JSON for: `project_name`, `project_path`, `has_operations`, `ops_research_model`.

**If `has_operations` is true:** Offer to update existing or create new:
- "Update existing" — Edit existing operations docs
- "Create new" — Create new operations docs (backup first)

## 2. Check Existing Operations

Check if `.planning/operations/` exists:
```bash
ls -la .planning/operations/ 2>/dev/null || echo "No operations directory"
```

If exists, read existing docs to understand current state.

## 3. Determine Operations Scope

Based on project context, determine which operations documents are needed:

| Document | When Needed |
|----------|-------------|
| OPERATIONS.md | Always — core operations overview |
| DEPLOYMENT.md | If deploying to production |
| MONITORING.md | If production system |
| CAPACITY.md | If growth, peak load, cost ceilings, or scale planning matter |
| RUNBOOK.md | If production system |
| BACKUP.md | If persistent data storage |
| SECURITY-OPS.md | If handling user data or sensitive information |

Present to user:
```
Operations documents to generate:

[ ] OPERATIONS.md — Core operations overview (required)
[ ] DEPLOYMENT.md — Deployment procedures
[ ] MONITORING.md — Monitoring and alerting
[ ] CAPACITY.md — Capacity baselines and scaling plan
[ ] RUNBOOK.md — Incident response
[ ] BACKUP.md — Backup and recovery
[ ] SECURITY-OPS.md — Security operations
```

Use AskUserQuestion to select:
- header: "Ops Docs"
- question: "Which operations documents do you need?"
- multiSelect: true
- options based on project needs

## 4. Research Phase

**If any document selected:**

Display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► RESEARCHING OPERATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If Task tool is available:** Spawn gsd-ops-researcher agent to gather relevant information:

```
Task(prompt="
<task>
Operations Research — Gather information for operations documentation.
</task>

<files_to_read>
- .planning/PROJECT.md (Project context)
- .planning/ROADMAP.md (Project roadmap)
- .planning/config.json (Project configuration)
</files_to_read>

<research_questions>
Based on the project, identify:

1. **Deployment**: What deployment platform (Vercel, AWS, etc.)? What CI/CD? What environments?
2. **Infrastructure**: What cloud provider? What databases? What external services?
3. **Monitoring**: What metrics matter? What alerts needed?
4. **Capacity**: What baseline, peak load, bottlenecks, and scaling path should be planned?
5. **Security**: What data is sensitive? What compliance needed?
6. **Team**: Who is responsible for operations? What is on-call rotation?
</research_questions>

<output>
Provide structured notes for each operations document needed:
- Key decisions to document
- Specific configurations to include
- Relevant thresholds and SLAs
", subagent_type="gsd-ops-researcher", model="{ops_research_model}", description="Ops research")
```

**If Task tool is NOT available (fallback):** Research inline by reading project files directly:

```
1. Read .planning/PROJECT.md — extract tech stack, team, deployment target
2. Read .planning/ROADMAP.md — extract infrastructure decisions
3. Scan root for: Dockerfile, docker-compose.yml, vercel.json, netlify.toml,
   .github/workflows/, terraform/, k8s/, package.json, requirements.txt
4. Grep package.json/requirements.txt for monitoring deps
   (sentry, datadog, newrelic, prometheus, grafana)
5. Estimate capacity inputs: peak traffic, queue depth, storage growth, vendor quotas
6. Compile research notes inline and proceed to document generation
```

## 5. Generate Operations Documents

**For each selected document:**

### OPERATIONS.md
- Read template
- Fill based on project context and research
- Create `.planning/operations/OPERATIONS.md`

### DEPLOYMENT.md
- Read template
- Fill based on deployment platform and CI/CD
- Create `.planning/operations/DEPLOYMENT.md`

### MONITORING.md
- Read template
- Fill based on monitoring tools and metrics
- Create `.planning/operations/MONITORING.md`

### CAPACITY.md
- Read template
- Fill based on expected load, bottlenecks, and scaling strategy
- Create `.planning/operations/CAPACITY.md`

### RUNBOOK.md
- Read template
- Fill with common issues based on project stack
- Create `.planning/operations/RUNBOOK.md`

### BACKUP.md
- Read template
- Fill based on data storage and backup solutions
- Create `.planning/operations/BACKUP.md`

### SECURITY-OPS.md
- Read template
- Fill based on security requirements
- Create `.planning/operations/SECURITY-OPS.md`

## 6. Verify Documents

**For each created document:**

Checklist:
- [ ] All sections populated
- [ ] Placeholders replaced with actual values
- [ ] Cross-references between documents correct
- [ ] Commands and paths are project-specific
- [ ] Secrets referenced but not included

## 6a. Cross-Reference Check

For each generated document, verify all internal links point to files that actually exist in `.planning/operations/`:

```
for each generated doc:
  extract all markdown links matching [text](./FILENAME.md)
  for each link target:
    if target NOT in generated_docs AND NOT in existing_docs:
      warn: "Broken link in {doc}: {target} not generated"
      offer: "Generate {target} now?" (run /gsd:ops-runbook {target})
```

**Common cross-references to check:**

| Source doc | Links to check |
|---|---|
| OPERATIONS.md | DEPLOYMENT.md, MONITORING.md, CAPACITY.md, RUNBOOK.md, BACKUP.md, SECURITY-OPS.md |
| MONITORING.md | OPERATIONS.md, DEPLOYMENT.md, CAPACITY.md, RUNBOOK.md |
| CAPACITY.md | OPERATIONS.md, DEPLOYMENT.md, MONITORING.md, RUNBOOK.md, BACKUP.md |
| RUNBOOK.md | MONITORING.md, DEPLOYMENT.md, CAPACITY.md |
| DEPLOYMENT.md | OPERATIONS.md, RUNBOOK.md, CAPACITY.md, BACKUP.md |
| BACKUP.md | OPERATIONS.md, DEPLOYMENT.md, CAPACITY.md |
| SECURITY-OPS.md | OPERATIONS.md, DEPLOYMENT.md |

## 7. Commit

```bash
mkdir -p .planning/operations
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: add operations documentation" --files .planning/operations/
```

## 8. Present Results

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► OPERATIONS DOCUMENTATION ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated:
- OPERATIONS.md — Core operations overview
- DEPLOYMENT.md — Deployment procedures
- MONITORING.md — Monitoring and alerting
- CAPACITY.md — Capacity baselines and scaling strategy
- RUNBOOK.md — Incident response
- BACKUP.md — Backup and recovery
- SECURITY-OPS.md — Security operations

Location: .planning/operations/
```

---

## Next Steps

```
## ▶ Next Up

**Keep operations docs updated:**
- Run /gsd:ops-audit to review and update
- Update after major infrastructure changes
- Review quarterly

**Integrate with development:**
- Reference operations docs in phase planning
- Revisit CAPACITY.md after launches and forecast changes
- Use RUNBOOK.md during incident response
- Update DEPLOYMENT.md after new deployments
```

</process>

<output>

- `.planning/operations/OPERATIONS.md` — Operations overview
- `.planning/operations/DEPLOYMENT.md` — Deployment procedures
- `.planning/operations/MONITORING.md` — Monitoring configuration
- `.planning/operations/CAPACITY.md` — Capacity planning and scaling
- `.planning/operations/RUNBOOK.md` — Incident response
- `.planning/operations/BACKUP.md` — Backup procedures
- `.planning/operations/SECURITY-OPS.md` — Security operations

</output>

<success_criteria>

- [ ] Operations directory created at `.planning/operations/`
- [ ] At least OPERATIONS.md created
- [ ] CAPACITY.md created when scale or growth planning applies
- [ ] All selected documents match project context
- [ ] Placeholders replaced with actual values
- [ ] Documents committed to version control
- [ ] User knows how to update operations docs

</success_criteria>
