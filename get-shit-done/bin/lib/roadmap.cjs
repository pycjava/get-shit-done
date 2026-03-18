/**
 * Roadmap — Roadmap parsing and update operations
 */

const fs = require('fs');
const path = require('path');
const { escapeRegex, normalizePhaseName, comparePhaseNum, output, error, findPhaseInternal, stripShippedMilestones, replaceInCurrentMilestone } = require('./core.cjs');
const { getPhasePlanIndexInternal } = require('./phase.cjs');

function analyzeRoadmapInternal(cwd) {
  const roadmapPath = path.join(cwd, '.planning', 'ROADMAP.md');

  if (!fs.existsSync(roadmapPath)) {
    return { error: 'ROADMAP.md not found', milestones: [], phases: [], current_phase: null };
  }

  const rawContent = fs.readFileSync(roadmapPath, 'utf-8');
  const content = stripShippedMilestones(rawContent);

  // Extract all phase headings: ## Phase N: Name or ### Phase N: Name
  const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:\s*([^\n]+)/gi;
  const phases = [];
  let match;

  while ((match = phasePattern.exec(content)) !== null) {
    const phaseNum = match[1];
    const phaseName = match[2].replace(/\(INSERTED\)/i, '').trim();

    // Extract goal from the section
    const sectionStart = match.index;
    const restOfContent = content.slice(sectionStart);
    const nextHeader = restOfContent.match(/\n#{2,4}\s+Phase\s+\d/i);
    const sectionEnd = nextHeader ? sectionStart + nextHeader.index : content.length;
    const section = content.slice(sectionStart, sectionEnd);

    const goalMatch = section.match(/\*\*Goal(?::\*\*|\*\*:)\s*([^\n]+)/i);
    const goal = goalMatch ? goalMatch[1].trim() : null;

    const dependsMatch = section.match(/\*\*Depends on(?::\*\*|\*\*:)\s*([^\n]+)/i);
    const depends_on = dependsMatch ? dependsMatch[1].trim() : null;

    const phaseInfo = findPhaseInternal(cwd, phaseNum);
    let diskStatus = 'no_directory';
    let planCount = 0;
    let summaryCount = 0;
    let hasContext = false;
    let hasResearch = false;
    let hasVerification = false;

    if (phaseInfo) {
      planCount = phaseInfo.plans.length;
      summaryCount = phaseInfo.summaries.length;
      hasContext = phaseInfo.has_context;
      hasResearch = phaseInfo.has_research;
      hasVerification = phaseInfo.has_verification;

      if (summaryCount >= planCount && planCount > 0) diskStatus = 'complete';
      else if (summaryCount > 0) diskStatus = 'partial';
      else if (planCount > 0) diskStatus = 'planned';
      else if (hasResearch) diskStatus = 'researched';
      else if (hasContext) diskStatus = 'discussed';
      else diskStatus = 'empty';
    }

    // Check ROADMAP checkbox status
    const checkboxPattern = new RegExp(`-\\s*\\[(x| )\\]\\s*.*Phase\\s+${escapeRegex(phaseNum)}[:\\s]`, 'i');
    const checkboxMatch = content.match(checkboxPattern);
    const roadmapComplete = checkboxMatch ? checkboxMatch[1] === 'x' : false;

    // If roadmap marks phase complete, trust that over disk file structure.
    // Phases completed before GSD tracking (or via external tools) may lack
    // the standard PLAN/SUMMARY pairs but are still done.
    if (roadmapComplete && diskStatus !== 'complete') {
      diskStatus = 'complete';
    }

    phases.push({
      number: phaseNum,
      name: phaseName,
      goal,
      depends_on,
      plan_count: planCount,
      summary_count: summaryCount,
      has_context: hasContext,
      has_research: hasResearch,
      has_verification: hasVerification,
      disk_status: diskStatus,
      roadmap_complete: roadmapComplete,
    });
  }

  phases.sort((a, b) => comparePhaseNum(a.number, b.number));

  // Extract milestone info
  const milestones = [];
  const milestonePattern = /##\s*(.*v(\d+\.\d+)[^(\n]*)/gi;
  let mMatch;
  while ((mMatch = milestonePattern.exec(content)) !== null) {
    milestones.push({
      heading: mMatch[1].trim(),
      version: 'v' + mMatch[2],
    });
  }

  // Find current and next phase
  const currentPhase = phases.find(p => p.disk_status === 'planned' || p.disk_status === 'partial') || null;
  const nextPhase = phases.find(p => p.disk_status === 'empty' || p.disk_status === 'no_directory' || p.disk_status === 'discussed' || p.disk_status === 'researched') || null;

  // Aggregated stats
  const totalPlans = phases.reduce((sum, p) => sum + p.plan_count, 0);
  const totalSummaries = phases.reduce((sum, p) => sum + p.summary_count, 0);
  const completedPhases = phases.filter(p => p.disk_status === 'complete').length;

  // Detect phases in summary list without detail sections (malformed ROADMAP)
  const checklistPattern = /-\s*\[[ x]\]\s*\*\*Phase\s+(\d+[A-Z]?(?:\.\d+)*)/gi;
  const checklistPhases = new Set();
  let checklistMatch;
  while ((checklistMatch = checklistPattern.exec(content)) !== null) {
    checklistPhases.add(checklistMatch[1]);
  }
  const detailPhases = new Set(phases.map(p => p.number));
  const missingDetails = [...checklistPhases].filter(p => !detailPhases.has(p));

  return {
    milestones,
    phases,
    phase_count: phases.length,
    completed_phases: completedPhases,
    total_plans: totalPlans,
    total_summaries: totalSummaries,
    progress_percent: totalPlans > 0 ? Math.min(100, Math.round((totalSummaries / totalPlans) * 100)) : 0,
    current_phase: currentPhase ? currentPhase.number : null,
    next_phase: nextPhase ? nextPhase.number : null,
    missing_phase_details: missingDetails.length > 0 ? missingDetails : null,
  };
}

function buildPhaseLifecycleStatus(phase) {
  const contextWasOptional = phase.has_research || phase.plan_count > 0 || phase.summary_count > 0 || phase.has_verification || phase.roadmap_complete;

  const context = phase.has_context
    ? 'complete'
    : contextWasOptional
      ? 'skipped'
      : 'pending';

  const planning = phase.plan_count > 0 || (phase.roadmap_complete && phase.plan_count === 0)
    ? 'complete'
    : 'pending';

  const execution = phase.plan_count === 0
    ? (phase.roadmap_complete ? 'complete' : 'blocked')
    : phase.summary_count >= phase.plan_count
      ? 'complete'
      : phase.summary_count > 0
        ? 'in_progress'
        : 'pending';

  const verification = phase.has_verification || phase.roadmap_complete
    ? 'complete'
    : execution === 'complete'
      ? 'pending'
      : 'blocked';

  return { context, planning, execution, verification };
}

function createMasterPlanSteps(phase, planIndex) {
  const lifecycle = buildPhaseLifecycleStatus(phase);
  const steps = [
    {
      id: `${phase.number}-context`,
      phase: phase.number,
      phase_name: phase.name,
      kind: 'context',
      mode: 'standard',
      status: lifecycle.context,
      title: `Phase ${phase.number} context`,
      summary: phase.has_context
        ? 'Use existing CONTEXT.md decisions.'
        : lifecycle.context === 'skipped'
          ? 'No CONTEXT.md; phase can proceed directly to planning.'
          : 'Capture decisions and constraints for this phase.',
    },
    {
      id: `${phase.number}-plan`,
      phase: phase.number,
      phase_name: phase.name,
      kind: 'plan',
      mode: 'standard',
      status: lifecycle.planning,
      title: `Phase ${phase.number} planning`,
      summary: phase.plan_count > 0
        ? `${phase.plan_count} executable plan(s) already exist.`
        : phase.roadmap_complete
          ? 'Phase already completed without current PLAN.md artifacts.'
          : 'Break the phase goal into executable plan(s).',
    },
  ];

  if (planIndex && !planIndex.error && planIndex.plans.length > 0) {
    const sortedPlans = [...planIndex.plans].sort((a, b) => {
      if (a.wave !== b.wave) return a.wave - b.wave;
      return a.id.localeCompare(b.id);
    });

    for (const plan of sortedPlans) {
      steps.push({
        id: `${phase.number}-${plan.id}`,
        phase: phase.number,
        phase_name: phase.name,
        kind: 'plan-execution',
        mode: plan.type === 'tdd' ? 'tdd' : 'standard',
        status: plan.has_summary ? 'complete' : 'pending',
        title: `${plan.id} execution`,
        summary: plan.objective || `Execute plan ${plan.id}.`,
        plan_id: plan.id,
        plan_type: plan.type,
        wave: plan.wave,
        autonomous: plan.autonomous,
        execution_pattern: plan.execution_pattern,
        tdd_cycle: plan.tdd_cycle,
      });
    }
  } else {
    steps.push({
      id: `${phase.number}-execute`,
      phase: phase.number,
      phase_name: phase.name,
      kind: 'phase-execution',
      mode: 'standard',
      status: lifecycle.execution,
      title: `Phase ${phase.number} execution`,
      summary: phase.plan_count === 0
        ? 'Execution unlocks after planning creates plan files.'
        : 'Execute this phase in dependency waves.',
    });
  }

  steps.push({
    id: `${phase.number}-verify`,
    phase: phase.number,
    phase_name: phase.name,
    kind: 'verify',
    mode: 'standard',
    status: lifecycle.verification,
    title: `Phase ${phase.number} verification`,
    summary: phase.has_verification
      ? 'Verification artifact already exists.'
      : lifecycle.verification === 'blocked'
        ? 'Verification unlocks after execution finishes.'
        : 'Verify must-haves and the phase goal.',
  });

  return { lifecycle, steps };
}

function cmdRoadmapGetPhase(cwd, phaseNum, raw) {
  const roadmapPath = path.join(cwd, '.planning', 'ROADMAP.md');

  if (!fs.existsSync(roadmapPath)) {
    output({ found: false, error: 'ROADMAP.md not found' }, raw, '');
    return;
  }

  try {
    const content = stripShippedMilestones(fs.readFileSync(roadmapPath, 'utf-8'));

    // Escape special regex chars in phase number, handle decimal
    const escapedPhase = escapeRegex(phaseNum);

    // Match "## Phase X:", "### Phase X:", or "#### Phase X:" with optional name
    const phasePattern = new RegExp(
      `#{2,4}\\s*Phase\\s+${escapedPhase}:\\s*([^\\n]+)`,
      'i'
    );
    const headerMatch = content.match(phasePattern);

    if (!headerMatch) {
      // Fallback: check if phase exists in summary list but missing detail section
      const checklistPattern = new RegExp(
        `-\\s*\\[[ x]\\]\\s*\\*\\*Phase\\s+${escapedPhase}:\\s*([^*]+)\\*\\*`,
        'i'
      );
      const checklistMatch = content.match(checklistPattern);

      if (checklistMatch) {
        // Phase exists in summary but missing detail section - malformed ROADMAP
        output({
          found: false,
          phase_number: phaseNum,
          phase_name: checklistMatch[1].trim(),
          error: 'malformed_roadmap',
          message: `Phase ${phaseNum} exists in summary list but missing "### Phase ${phaseNum}:" detail section. ROADMAP.md needs both formats.`
        }, raw, '');
        return;
      }

      output({ found: false, phase_number: phaseNum }, raw, '');
      return;
    }

    const phaseName = headerMatch[1].trim();
    const headerIndex = headerMatch.index;

    // Find the end of this section (next ## or ### phase header, or end of file)
    const restOfContent = content.slice(headerIndex);
    const nextHeaderMatch = restOfContent.match(/\n#{2,4}\s+Phase\s+\d/i);
    const sectionEnd = nextHeaderMatch
      ? headerIndex + nextHeaderMatch.index
      : content.length;

    const section = content.slice(headerIndex, sectionEnd).trim();

    // Extract goal if present (supports both **Goal:** and **Goal**: formats)
    const goalMatch = section.match(/\*\*Goal(?::\*\*|\*\*:)\s*([^\n]+)/i);
    const goal = goalMatch ? goalMatch[1].trim() : null;

    // Extract success criteria as structured array
    const criteriaMatch = section.match(/\*\*Success Criteria\*\*[^\n]*:\s*\n((?:\s*\d+\.\s*[^\n]+\n?)+)/i);
    const success_criteria = criteriaMatch
      ? criteriaMatch[1].trim().split('\n').map(line => line.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean)
      : [];

    output(
      {
        found: true,
        phase_number: phaseNum,
        phase_name: phaseName,
        goal,
        success_criteria,
        section,
      },
      raw,
      section
    );
  } catch (e) {
    error('Failed to read ROADMAP.md: ' + e.message);
  }
}

function cmdRoadmapAnalyze(cwd, raw) {
  output(analyzeRoadmapInternal(cwd), raw);
}

function cmdRoadmapExecutionPlan(cwd, fromPhase, raw) {
  const analysis = analyzeRoadmapInternal(cwd);
  if (analysis.error) {
    output(analysis, raw);
    return;
  }

  const normalizedFrom = fromPhase ? normalizePhaseName(fromPhase) : null;
  const remainingPhases = analysis.phases
    .filter(phase => phase.disk_status !== 'complete' || phase.roadmap_complete === false)
    .filter(phase => !normalizedFrom || comparePhaseNum(phase.number, normalizedFrom) >= 0)
    .sort((a, b) => comparePhaseNum(a.number, b.number));

  const phases = remainingPhases.map(phase => {
    const planIndex = phase.plan_count > 0 ? getPhasePlanIndexInternal(cwd, phase.number) : null;
    const { lifecycle, steps } = createMasterPlanSteps(phase, planIndex);

    return {
      ...phase,
      lifecycle,
      plan_summary: {
        total: phase.plan_count,
        complete: phase.summary_count,
        incomplete: Math.max(phase.plan_count - phase.summary_count, 0),
        tdd: planIndex?.tdd_plans || 0,
        checkpoints: planIndex?.plans?.filter(plan => !plan.autonomous).length || 0,
        waves: Object.keys(planIndex?.waves || {}).length,
      },
      steps,
    };
  });

  const master_steps = phases.flatMap(phase => phase.steps);
  const countByStatus = (status) => master_steps.filter(step => step.status === status).length;
  const next_step = master_steps.find(step => step.status !== 'complete' && step.status !== 'skipped') || null;

  output({
    generated_at: new Date().toISOString(),
    start_from: normalizedFrom,
    completed_phase_count: analysis.completed_phases,
    phase_count: phases.length,
    phases,
    master_steps,
    totals: {
      steps: master_steps.length,
      complete: countByStatus('complete'),
      pending: countByStatus('pending'),
      in_progress: countByStatus('in_progress'),
      blocked: countByStatus('blocked'),
      skipped: countByStatus('skipped'),
      tdd_plans: master_steps.filter(step => step.kind === 'plan-execution' && step.mode === 'tdd').length,
      checkpoint_plans: master_steps.filter(step => step.kind === 'plan-execution' && step.autonomous === false).length,
    },
    next_step,
  }, raw);
}

function cmdRoadmapUpdatePlanProgress(cwd, phaseNum, raw) {
  if (!phaseNum) {
    error('phase number required for roadmap update-plan-progress');
  }

  const roadmapPath = path.join(cwd, '.planning', 'ROADMAP.md');

  const phaseInfo = findPhaseInternal(cwd, phaseNum);
  if (!phaseInfo) {
    error(`Phase ${phaseNum} not found`);
  }

  const planCount = phaseInfo.plans.length;
  const summaryCount = phaseInfo.summaries.length;

  if (planCount === 0) {
    output({ updated: false, reason: 'No plans found', plan_count: 0, summary_count: 0 }, raw, 'no plans');
    return;
  }

  const isComplete = summaryCount >= planCount;
  const status = isComplete ? 'Complete' : summaryCount > 0 ? 'In Progress' : 'Planned';
  const today = new Date().toISOString().split('T')[0];

  if (!fs.existsSync(roadmapPath)) {
    output({ updated: false, reason: 'ROADMAP.md not found', plan_count: planCount, summary_count: summaryCount }, raw, 'no roadmap');
    return;
  }

  let roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');
  const phaseEscaped = escapeRegex(phaseNum);

  // Progress table row: update Plans column (summaries/plans) and Status column
  const tablePattern = new RegExp(
    `(\\|\\s*${phaseEscaped}\\.?\\s[^|]*\\|)[^|]*(\\|)\\s*[^|]*(\\|)\\s*[^|]*(\\|)`,
    'i'
  );
  const dateField = isComplete ? ` ${today} ` : '  ';
  roadmapContent = replaceInCurrentMilestone(
    roadmapContent, tablePattern,
    `$1 ${summaryCount}/${planCount} $2 ${status.padEnd(11)}$3${dateField}$4`
  );

  // Update plan count in phase detail section
  const planCountPattern = new RegExp(
    `(#{2,4}\\s*Phase\\s+${phaseEscaped}[\\s\\S]*?\\*\\*Plans:\\*\\*\\s*)[^\\n]+`,
    'i'
  );
  const planCountText = isComplete
    ? `${summaryCount}/${planCount} plans complete`
    : `${summaryCount}/${planCount} plans executed`;
  roadmapContent = replaceInCurrentMilestone(roadmapContent, planCountPattern, `$1${planCountText}`);

  // If complete: check checkbox
  if (isComplete) {
    const checkboxPattern = new RegExp(
      `(-\\s*\\[)[ ](\\]\\s*.*Phase\\s+${phaseEscaped}[:\\s][^\\n]*)`,
      'i'
    );
    roadmapContent = replaceInCurrentMilestone(roadmapContent, checkboxPattern, `$1x$2 (completed ${today})`);
  }

  fs.writeFileSync(roadmapPath, roadmapContent, 'utf-8');

  output({
    updated: true,
    phase: phaseNum,
    plan_count: planCount,
    summary_count: summaryCount,
    status,
    complete: isComplete,
  }, raw, `${summaryCount}/${planCount} ${status}`);
}

module.exports = {
  analyzeRoadmapInternal,
  cmdRoadmapGetPhase,
  cmdRoadmapAnalyze,
  cmdRoadmapExecutionPlan,
  cmdRoadmapUpdatePlanProgress,
};
