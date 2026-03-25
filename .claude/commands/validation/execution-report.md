---
description: "Post-implementation reflection documenting what was done, validation results, challenges, divergences, and recommendations."
---

# Execution Report — Post-Implementation Reflection

You are documenting the results of a recent implementation session on the **Vitrina** project (Next.js 16 + Payload CMS + TypeScript).

This is a reflection tool — it captures what happened during implementation so the team (and future AI sessions) can learn from it.

## Step 1: Gather Information

### Git History
```bash
git log --oneline -20
git diff --stat HEAD~5
```

Identify the commits from the most recent implementation session.

### Plan (if one was used)
Check `.claude/plans/` for the plan that was being executed. Read it fully.

### Validation State
Run the current validation suite:
```bash
npm run lint 2>&1 | tail -5
npx tsc --noEmit 2>&1 | tail -10
npx vitest run 2>&1 | tail -10
npm run build 2>&1 | tail -10
```

### Changed Files
```bash
git diff --name-only <start-sha>..HEAD
```

Read any changed files that are central to the implementation.

## Step 2: Interview (Optional)

If the user is available, ask:
1. What was the goal of this implementation session?
2. Were there any unexpected challenges?
3. Anything you'd do differently next time?

If the user doesn't respond or says "just generate it," proceed with what you can determine from the codebase.

## Step 3: Write the Report

Create output directory if needed:
```bash
mkdir -p .claude/execution-reports
```

Write to `.claude/execution-reports/report-{date}-{feature-slug}.md`:

```markdown
# Execution Report: {Feature/Task Name}

**Date:** {date}
**Plan:** {plan file path or "no plan used"}
**Duration:** {estimated based on commit timestamps}
**Commits:** {count} ({first SHA}..{last SHA})

## Summary
{2-3 sentence overview of what was implemented}

## What Was Done

### Tasks Completed
| # | Task | Files Changed | Status |
|---|------|--------------|--------|
| 1 | {description} | {file list} | Done |
| 2 | {description} | {file list} | Done |
| ... | ... | ... | ... |

### Files Created
{List of new files with brief description of each}

### Files Modified
{List of modified files with brief description of changes}

## Validation Results

| Check | Status | Notes |
|-------|--------|-------|
| ESLint | PASS/FAIL | {error count or clean} |
| TypeScript | PASS/FAIL | {error count or clean} |
| Vitest | PASS/FAIL/SKIP | {test count or no tests} |
| Build | PASS/FAIL | {any warnings} |

## Challenges Encountered

### Challenge 1: {Title}
**Description:** {What happened}
**Resolution:** {How it was resolved}
**Time impact:** {Estimate}
**Prevention:** {How to avoid this in the future}

## Divergences from Plan

{If a plan was used, list every place where implementation differed:}

| Plan Said | Actually Did | Reason |
|-----------|-------------|--------|
| {expected} | {actual} | {why} |

{If no plan was used, write "No plan — ad-hoc implementation."}

## Technical Decisions Made

{List any non-trivial decisions made during implementation:}

1. **{Decision}:** {Options considered} → Chose {option} because {reason}.

## Recommendations

### Immediate Follow-ups
- [ ] {Tasks that should be done soon}

### Future Improvements
- [ ] {Longer-term suggestions}

### Process Improvements
- [ ] {Suggestions for better plans, commands, or conventions}

## Lessons Learned
{1-3 key takeaways from this implementation session}
```

## Output

```
Execution report written to: .claude/execution-reports/report-{date}-{feature-slug}.md
Tasks completed: {count}
Validation: {PASS/FAIL}
Divergences from plan: {count}
Recommendations: {count}

Next step: /validation/system-review (to compare plan vs execution at the process level)
```
