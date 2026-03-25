<purpose>
Run `plan-phase` in planner mode: invoke planning agents and return a directly usable operations plan in the response. Do not write local planning documents.
</purpose>

<process>

1. Run `init plan-phase [topic or doc selection]` and extract:
   - `analysis_mode`
   - `analysis_topic`
   - `analysis_phases`
   - `requested_docs`
   - `researcher_model`
   - `planner_model`
   - `checker_model`
   - `research_enabled`
   - `plan_checker_enabled`
   - `project_path`
   - `requirements_path`
   - `roadmap_path`
   - `config_path`
   - `ops_dir`
   - `existing_docs`

2. Enforce ops planner mode:
   - If `analysis_mode=true`, continue normally.
   - If `analysis_mode!=true`, still continue in response-only ops planner mode using the user input as planning topic.
   - Do not switch to legacy phase-file planning behavior.

3. Read only relevant existing context:
   - `{project_path}` if exists
   - `{requirements_path}` if exists
   - `{roadmap_path}` if exists
   - `{config_path}` if exists
   - `{ops_dir}/*.md` if exists
   - deployment, CI, runtime, infra, monitoring, backup, and security-related repo files

4. Optional research pass (`research_enabled=true`):

```
Task(
  subagent_type="gsd-phase-researcher",
  model="{researcher_model}",
  prompt="
<objective>
Provide operations-focused planning research notes for the requested topic and doc scope.
</objective>

<files_to_read>
- {project_path} (if exists)
- {requirements_path} (if exists)
- {roadmap_path} (if exists)
- {config_path} (if exists)
- {ops_dir}/*.md (if exists)
- deployment/CI/runtime/infra/monitoring/backup/security files in repo
</files_to_read>

<constraints>
- Response-only: return structured notes in this reply.
- Do NOT create or update any file.
- Explicitly forbidden: CONTEXT.md, RESEARCH.md, PLAN.md, SUMMARY.md, ROADMAP.md, STATE.md, .planning/phases/*.
</constraints>

<success_criteria>
- Return concise, structured notes for planner consumption.
- Mark assumptions when repo facts are missing.
</success_criteria>
  "
)
```

Capture output as `RESEARCH_NOTES`. If this step fails, continue with lower confidence.

5. Planner pass (required):

```
Task(
  subagent_type="gsd-planner",
  model="{planner_model}",
  prompt="
<objective>
Generate a direct-display operations plan (model plan mode) for the requested scope.
</objective>

<planning_input>
- Topic: {analysis_topic}
- Requested docs: {requested_docs}
- Ordered analysis phases: {analysis_phases}
- Existing ops docs inventory: {existing_docs}
- Research notes: {RESEARCH_NOTES}
</planning_input>

<files_to_read>
- {project_path} (if exists)
- {requirements_path} (if exists)
- {roadmap_path} (if exists)
- {config_path} (if exists)
- {ops_dir}/*.md (if exists)
- deployment/CI/runtime/infra/monitoring/backup/security files in repo
</files_to_read>

<output_format>
## Plan Title
## Summary
## Key Changes
## Execution Plan
## Validation Plan
## Risks and Assumptions
</output_format>

<constraints>
- Response-only output. Do NOT write any file.
- Do NOT create phase tracking artifacts.
</constraints>
  "
)
```

Capture output as `DRAFT_PLAN`.

6. Optional checker pass (`plan_checker_enabled=true`):

```
Task(
  subagent_type="gsd-plan-checker",
  model="{checker_model}",
  prompt="
<objective>
Validate the draft plan for coverage, feasibility, and consistency with repository facts.
</objective>

<plan_to_review>
{DRAFT_PLAN}
</plan_to_review>

<expected_output>
- status: passed | needs_revision
- blocking_issues
- warnings
- revised_plan (if needs_revision)
</expected_output>

<constraints>
- Response-only output. Do NOT write any file.
- Do NOT require PLAN.md/RESEARCH.md/VALIDATION.md on disk.
</constraints>
  "
)
```

If checker succeeds with `revised_plan`, use it as final output. Otherwise use `DRAFT_PLAN`.

7. Respond directly:
   - Show final plan in the reply.
   - Add a short next-step handoff:
     - formal docs route: `/gsd:ops-runbook [selection]`
   - Do not create local files in this workflow.

</process>

<success_criteria>
- [ ] `gsd-planner` is invoked and produces a direct-display plan
- [ ] `gsd-phase-researcher` is invoked when `research_enabled=true`
- [ ] `gsd-plan-checker` is invoked when `plan_checker_enabled=true`
- [ ] No local planning artifacts are written
- [ ] Reply contains a complete, actionable plan
</success_criteria>
