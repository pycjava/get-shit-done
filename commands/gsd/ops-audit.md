---
name: gsd:ops-audit
description: Audit existing operations documentation and infrastructure for gaps and improvements
argument-hint: "[optional: specific doc to audit, e.g., 'deployment' or 'all']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Grep
---

<objective>
Audit existing operations documentation for a project. Identifies missing documents, incomplete sections, outdated information, capacity planning gaps, and provides actionable recommendations.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/ops-audit.md
</execution_context>

<context>
Argument: $ARGUMENTS (optional - specific doc or "all")

**Load project state if exists:**
Check for .planning/STATE.md - loads context if project already initialized

**This command can run:**
- After /gsd:ops-runbook (audit generated docs)
- Before /gsd:complete-milestone (ensure ops readiness)
- Quarterly for maintenance
- After infrastructure changes
</context>

<when_to_use>

**Use ops-audit for:**
- Reviewing operations readiness before production
- Quarterly operations maintenance
- After infrastructure or team changes
- Before compliance audits
- Taking over an existing project

**Skip ops-audit for:**
- Early stage projects with no operations yet
- Projects without .planning directory

</when_to_use>

<process>
1. Check for .planning directory existence
2. Assess project context (type, scale, compliance)
3. Check which operations documents exist
4. Audit each existing document for completeness
5. Identify gaps (missing docs, incomplete sections)
6. Check for outdated information
7. Calculate audit score
8. Provide recommendations
9. Offer actions (generate missing, update existing, save report)
</process>

<success_criteria>
- [ ] Project context assessed
- [ ] Document existence checked
- [ ] Existing docs audited for completeness
- [ ] Missing docs identified
- [ ] Outdated info flagged
- [ ] Recommendations provided
- [ ] User offered next steps
</success_criteria>
