---
name: gsd:ops-runbook
description: Generate operations documentation (deployment, monitoring, capacity, runbook, backup, security)
argument-hint: "[optional: specific doc to generate, e.g., 'deployment', 'capacity', or 'all']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Task
  - Grep
---

<objective>
Generate operations documentation for the project including OPERATIONS.md, DEPLOYMENT.md, MONITORING.md, CAPACITY.md, RUNBOOK.md, BACKUP.md, and SECURITY-OPS.md.

Each document is based on project context and research, written directly to `.planning/operations/`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/ops-runbook.md
</execution_context>

<context>
Argument: $ARGUMENTS (optional - specific doc or "all")

**Load project state if exists:**
Check for .planning/STATE.md - loads context if project already initialized

**This command can run:**
- After /gsd:new-project (initial operations setup)
- Before /gsd:complete-milestone (document current state)
- Anytime to refresh operations documentation
</context>

<when_to_use>

**Use ops-runbook for:**
- Setting up operations for a new project
- Refreshing operations docs after infrastructure changes
- Before production deployment
- During milestone completion (capture current state)
- Security/compliance audits

**Skip ops-runbook for:**
- Early stage projects (no production yet)
- Simple projects without infrastructure needs

</when_to_use>

<process>
1. Check if .planning/operations/ already exists
2. Ask user which documents to generate
3. Research operations requirements based on project
4. Generate selected documents using templates
5. Verify all documents
6. Commit to version control
7. Present results
</process>

<success_criteria>
- [ ] .planning/operations/ directory created
- [ ] At least OPERATIONS.md generated
- [ ] CAPACITY.md generated when scaling or growth planning is needed
- [ ] Documents match project context
- [ ] Documents committed
- [ ] User knows how to update
</success_criteria>
