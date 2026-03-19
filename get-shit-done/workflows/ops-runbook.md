<purpose>
Generate formal operations documentation in `.planning/operations/` after in-memory phased analysis. Phase tracking stays out of the repository; the only written outputs are the final operations documents.
</purpose>

<required_reading>
1. `.planning/PROJECT.md` if present
2. `.planning/REQUIREMENTS.md` if present
3. `.planning/ROADMAP.md` if present
4. `.planning/config.json` if present
5. existing `.planning/operations/*.md` if present
6. `get-shit-done/templates/operations/OPERATIONS.md`
7. `get-shit-done/templates/operations/DEPLOYMENT.md`
8. `get-shit-done/templates/operations/MONITORING.md`
9. `get-shit-done/templates/operations/CAPACITY.md`
10. `get-shit-done/templates/operations/RUNBOOK.md`
11. `get-shit-done/templates/operations/BACKUP.md`
12. `get-shit-done/templates/operations/SECURITY-OPS.md`
</required_reading>

<process>

## 1. Initialize analysis context
Run `init ops-runbook [selection]` and extract:
- `analysis_mode`
- `analysis_phases`
- `requested_docs`
- `project_path`
- `requirements_path`
- `roadmap_path`
- `config_path`
- `ops_dir`
- `existing_docs`

If `analysis_mode=true`, do not look for phase tracking files. Existing `.planning/operations/*.md` files are update targets only.

## 2. Analyze in three phases
Keep the phase conclusions in working memory and in the user-facing reply only.

### Phase 1: Current State and Scope
- inspect deployment, infra, CI, runtime, data, backup, monitoring, and security-relevant files
- determine which operations docs are actually needed
- default to generating `OPERATIONS.md`

### Phase 2: Risk and Operations Decisions
- identify environment model, deploy flow, rollback rules, observability coverage, backup expectations, incident paths, capacity constraints, and security operations responsibilities
- note any gaps or assumptions that should be explicit in the final docs

### Phase 3: Runbook Output Selection
- decide which formal docs to create or update in `.planning/operations/`
- prefer updating existing docs over inventing duplicate files
- do not create phase summaries or analysis files

## 3. Generate formal operations docs
For each selected output:
- read the matching template
- fill it with repository facts and clearly labeled assumptions
- write the final file to `.planning/operations/`

Allowed formal outputs:
- `.planning/operations/OPERATIONS.md`
- `.planning/operations/DEPLOYMENT.md`
- `.planning/operations/MONITORING.md`
- `.planning/operations/CAPACITY.md`
- `.planning/operations/RUNBOOK.md`
- `.planning/operations/BACKUP.md`
- `.planning/operations/SECURITY-OPS.md`

## 4. Validate outputs
Check that each generated file:
- has no unreplaced placeholders
- matches the repository context
- references only real files or commands
- does not include raw secrets
- links only to operations docs that exist

## 5. Commit only operations outputs when appropriate
If `commit_docs=true`, commit `.planning/operations/` using the standard docs commit flow.

</process>

<success_criteria>
- [ ] Analysis ran in ordered phases without writing phase tracking docs
- [ ] `.planning/operations/` exists
- [ ] At least `OPERATIONS.md` was created or updated
- [ ] Additional runbooks were created only when justified by the project context
- [ ] Generated docs were validated against the repository
</success_criteria>
