---
name: gsd:bootstrap
description: ops-only bootstrap with requirements analysis + plan preview + runbook generation + optional audit
argument-hint: "[all|deployment|monitoring|capacity|runbook|backup|security|operations] [--skip-audit]"
allowed-tools:
  - Read
  - Bash
  - Task
  - Skill
---

<objective>
Keep bootstrap on the ops-only route with strict execution order:
1. operations requirements analysis
2. plan analysis and display
3. formal operations docs generation
</objective>

<process>

<step name="parse_args" priority="first">

## 1. Parse arguments

Extract from `$ARGUMENTS`:
- doc selection: `all|deployment|monitoring|capacity|runbook|backup|security|operations` (default: `all`)
- `--skip-audit`

```bash
DOC_SELECTION="all"
SKIP_AUDIT=false

for token in $ARGUMENTS; do
  case "$token" in
    all|deployment|monitoring|capacity|runbook|backup|security|operations)
      DOC_SELECTION="$token"
      ;;
    --skip-audit)
      SKIP_AUDIT=true
      ;;
  esac
done
```

</step>

<step name="requirements_analysis">

## 2. Analyze operations requirements first

Show startup message:

```markdown
## GSD Bootstrap - Ops Requirements Analysis

Selection: {DOC_SELECTION}
```

Initialize analysis context:

```bash
OPS_INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init ops-runbook "{DOC_SELECTION}")
if [[ "$OPS_INIT" == @file:* ]]; then OPS_INIT=$(cat "${OPS_INIT#@file:}"); fi
```

Extract:
- `ops_research_model`
- `project_path`
- `requirements_path`
- `roadmap_path`
- `config_path`
- `ops_dir`
- `existing_docs`

Run dedicated requirements analysis:

```
Task(
  subagent_type="gsd-ops-researcher",
  model="{ops_research_model}",
  prompt="
<objective>
Analyze operations requirements for the requested scope and return structured notes for planning.
</objective>

<files_to_read>
- {project_path} (if exists)
- {requirements_path} (if exists)
- {roadmap_path} (if exists)
- {config_path} (if exists)
- {ops_dir}/*.md (if exists)
- deployment, CI, runtime, monitoring, backup, and security files in repo
</files_to_read>

<constraints>
- Response-only output.
- Do not write or update any file.
</constraints>

<success_criteria>
- Return structured requirements notes grouped by deployment/monitoring/capacity/runbook/backup/security.
- Mark assumptions explicitly where facts are missing.
</success_criteria>
  "
)
```

Capture returned notes as `OPS_RESEARCH_NOTES`.
If this step fails, continue with lower confidence and state that in the plan step.

</step>

<step name="plan_preview">

## 3. Plan preview (response-only)

Show startup message:

```markdown
## GSD Bootstrap - Ops Plan Preview

Selection: {DOC_SELECTION}
Mode: plan-phase direct display (no local planning docs)
```

Build planning input:
- Base scope: `{DOC_SELECTION}`
- Include upstream `OPS_RESEARCH_NOTES` as planning context when available

Run:

```
Skill(skill="gsd:plan-phase", args="{DOC_SELECTION}")
```

Expectation:
- The plan is shown in reply.
- Plan aligns with requirements analysis above.
- No local planning artifacts are written.

</step>

<step name="generate_ops_docs">

## 4. Generate/update operations docs

Show startup message:

```markdown
## GSD Bootstrap - Ops Docs Generation

Selection: {DOC_SELECTION}
Output dir: .planning/operations/
```

Run:

```
Skill(skill="gsd:ops-runbook", args="{DOC_SELECTION}")
```

</step>

<step name="audit_ops_docs">

## 5. Optional ops audit

If `SKIP_AUDIT=true`, show skipped message.

Else run:

```
Skill(skill="gsd:ops-audit", args="all")
```

</step>

<step name="summary">

## 6. Summary

Show completion report:

```markdown
## GSD Bootstrap Completed (Ops-Only)

| Step | Status |
|---|---|
| ops-researcher {DOC_SELECTION} | completed |
| plan-phase {DOC_SELECTION} | completed |
| ops-runbook {DOC_SELECTION} | completed |
| ops-audit | {skipped/completed} |

Write scope: .planning/operations/
```

Optional next steps:
- `/gsd:ops-runbook all` (full refresh)
- `/gsd:ops-audit` (re-audit)

</step>

</process>

<success_criteria>
- [ ] Bootstrap stays on ops-only route
- [ ] `gsd-ops-researcher` runs before planning
- [ ] `plan-phase` runs before `ops-runbook`
- [ ] Formal writes happen only in `.planning/operations/`
- [ ] `ops-audit` remains optional
- [ ] No codebase-phase execution chain is triggered
</success_criteria>
