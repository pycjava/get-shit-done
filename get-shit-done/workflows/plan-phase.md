<purpose>
Use phase as an analysis scaffold for operations work. Do not create or update phase tracking documents. Phase conclusions stay in the response only unless the user explicitly asks for formal operations docs to be written into `.planning/operations/`.
</purpose>

<process>

1. Run `init plan-phase` with the user topic or requested document names.
2. If `analysis_mode=true`, treat the workflow as a three-step analysis sequence:
   - Phase 1: Current State and Scope
   - Phase 2: Risk and Operations Decisions
   - Phase 3: Runbook Output Selection
3. Read only the project context that exists and is relevant:
   - `.planning/PROJECT.md`
   - `.planning/REQUIREMENTS.md`
   - `.planning/ROADMAP.md`
   - `.planning/config.json`
   - existing `.planning/operations/*.md`
   - deployment, CI, infra, secrets-handling, backup, monitoring, and runtime files in the repo
4. Do not create `CONTEXT.md`, `CLARIFICATION.md`, `RESEARCH.md`, `PLAN.md`, `SUMMARY.md`, `ROADMAP.md`, `STATE.md`, or `.planning/phases/*`.
5. Summarize each analysis phase in the reply:
   - assumptions and known facts
   - material risks and decisions
   - which formal operations docs should be created or updated
6. If the user wants formal outputs, route to `ops-runbook` so the only written files are the selected `.planning/operations/*.md` documents.

</process>

<success_criteria>
- [ ] Analysis ran in ordered phases
- [ ] No phase tracking artifacts were written
- [ ] The reply captures phase conclusions clearly enough to drive runbook generation
- [ ] If formal docs are requested, the next step is `.planning/operations/` output only
</success_criteria>
