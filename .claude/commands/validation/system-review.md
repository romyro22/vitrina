---
description: "Process meta-analysis comparing plan vs execution. Classifies divergences and suggests updates to CLAUDE.md and commands. NOT a code review."
---

# System Review — Process Meta-Analysis

You are a process analyst reviewing the **planning and execution workflow** for the **Vitrina** project. This is NOT a code review. You are reviewing the *process*, not the *code*.

The goal is to improve the PIV loop itself — making plans more accurate, execution more predictable, and validation more effective.

## Step 1: Gather Artifacts

Read the following artifacts from the most recent implementation cycle:

### Required
1. **Execution Report:** Find the latest file in `.claude/execution-reports/`. If none exists, tell the user to run `/validation/execution-report` first.

### If Available
2. **Plan:** Read the plan referenced in the execution report (from `.claude/plans/`).
3. **Code Review:** Check `.claude/code-reviews/` for a review of the same feature.
4. **RCA Documents:** Check `docs/rca/` for any related RCAs.
5. **CLAUDE.md:** Read project rules to check if they need updating.
6. **Command files:** Scan `.claude/commands/` to check if any commands need updating.

## Step 2: Plan vs Execution Comparison

If a plan was used, perform a detailed comparison:

### Task-Level Analysis
For each task in the plan:
- Was it completed as specified?
- Did it take more or fewer steps than expected?
- Were the file paths correct?
- Were the type definitions accurate?
- Were the Payload field definitions correct?

### Divergence Classification

Classify each divergence:

| Class | Description | Example |
|-------|-------------|---------|
| **Scope Creep** | Work done that wasn't in the plan | Added an extra component not in the plan |
| **Scope Reduction** | Planned work that was skipped | Deferred tests to a later PR |
| **Approach Change** | Same goal, different implementation | Used server action instead of API route |
| **Correction** | Plan was wrong, implementation fixed it | Plan specified wrong field type for Payload |
| **Discovery** | New requirement found during implementation | Needed a loading state not anticipated |
| **Environment** | Infrastructure or tooling difference | Payload version behavior differed from docs |

### Accuracy Metrics

Calculate:
- **Task completion rate:** {completed}/{planned} tasks
- **File accuracy:** {correct file paths}/{total file paths in plan}
- **Divergence rate:** {divergences}/{total tasks}
- **Plan confidence vs actual difficulty:** Did the confidence score predict reality?

## Step 3: Process Assessment

Evaluate each stage of the PIV loop:

### Planning Quality
- Was the plan detailed enough for implementation?
- Did the "No Prior Knowledge Test" hold up?
- Were Payload collection definitions accurate?
- Were component interfaces well-specified?
- Were data-fetching patterns correct?
- Was the task ordering logical?

### Execution Efficiency
- Were there unnecessary back-and-forth iterations?
- Were validation failures caught early or late?
- Was the git save state useful?
- Were type regeneration steps done at the right time?

### Validation Effectiveness
- Did the validation suite catch real issues?
- Were there issues that validation missed?
- Was the validation order optimal?
- Are there validation checks that should be added?

## Step 4: Improvement Recommendations

### CLAUDE.md Updates
Suggest specific additions or modifications to `CLAUDE.md`:
- New conventions discovered during implementation.
- Patterns that should be standardized.
- Common pitfalls to document.
- Payload-specific gotchas.
- Next.js App Router patterns that need documentation.

### Command Updates
Suggest improvements to any `.claude/commands/` files:
- Missing steps that caused issues.
- Steps that were unnecessary.
- Better defaults or prompts.
- New commands that would be useful.

### Plan Template Improvements
Suggest changes to the planning process:
- Sections that need more detail.
- Sections that had too much detail.
- New sections that would help.
- Better task decomposition strategies.

## Step 5: Write the System Review

Create output directory if needed:
```bash
mkdir -p .claude/system-reviews
```

Write to `.claude/system-reviews/review-{date}-{feature-slug}.md`:

```markdown
# System Review: {Feature/Task Name}

**Date:** {date}
**Plan:** {plan file path or "none"}
**Execution Report:** {report file path}
**Code Review:** {review file path or "none"}

## Executive Summary
{2-3 sentences: Was the process effective? What is the single biggest improvement?}

## Plan vs Execution

### Accuracy Metrics
| Metric | Value |
|--------|-------|
| Task completion rate | {x}/{y} ({%}) |
| File path accuracy | {x}/{y} ({%}) |
| Divergence rate | {x}/{y} ({%}) |
| Plan confidence | {score}/10 |
| Actual difficulty | {score}/10 |

### Divergences
| # | Task | Class | Impact | Preventable? |
|---|------|-------|--------|-------------|
| 1 | {task} | {class} | {Low/Med/High} | {Yes/No — how} |

## Process Assessment

### What Worked Well
1. {positive finding}
2. {positive finding}

### What Needs Improvement
1. {improvement area}
2. {improvement area}

## Recommendations

### CLAUDE.md Changes
{Specific text to add/modify in CLAUDE.md, with rationale}

### Command Changes
{Specific changes to command files, with rationale}

### Plan Template Changes
{Improvements to the planning process}

### New Tools/Commands Needed
{Any new automation that would help}

## Process Health Score

| Dimension | Score (1-10) | Notes |
|-----------|-------------|-------|
| Plan quality | {score} | {note} |
| Execution efficiency | {score} | {note} |
| Validation coverage | {score} | {note} |
| Documentation | {score} | {note} |
| **Overall** | **{avg}** | |
```

## Output

```
System review written to: .claude/system-reviews/review-{date}-{feature-slug}.md
Plan accuracy: {%}
Divergences: {count} ({breakdown by class})
Process health: {score}/10
CLAUDE.md updates suggested: {count}
Command updates suggested: {count}
```
