# PIV Loop Quick Reference

## Overview

```
    ┌─────────┐
    │  PLAN   │ ← Define scope, architecture, tasks
    └────┬────┘
         │
    ┌────▼────┐
    │IMPLEMENT│ ← Write code guided by the plan
    └────┬────┘
         │
    ┌────▼────┐
    │VALIDATE │ ← Lint, type-check, test, review
    └────┬────┘
         │
    ┌────▼────┐     ┌──────────┐
    │ ITERATE │────►│ COMPLETE │ (all checks pass)
    └────┬────┘     └──────────┘
         │
         └── Fix issues, return to VALIDATE
```

## Phases

### 1. Plan
- Read requirements (PRD, issue, user request)
- Identify affected files and dependencies
- Break work into small, testable tasks
- Define acceptance criteria

**Command:** `/plan-plus` or manual planning prompt
**Inputs:** Requirements, existing codebase context
**Outputs:** Task list with file paths and acceptance criteria

### 2. Implement
- Follow the plan task by task
- Write code matching project conventions
- One logical change per task
- Commit after each completed task

**Command:** `/implement` or direct coding
**Inputs:** Plan, project conventions (CLAUDE.md)
**Outputs:** Working code changes

### 3. Validate
- Run the full validation suite:

```bash
# TypeScript type checking
npx tsc --noEmit

# Linting
npx next lint

# Tests
npm test

# Build check
npm run build
```

**Command:** `/validate`
**Inputs:** Changed files
**Outputs:** Pass/fail report with error details

### 4. Iterate
- Fix each error from validation
- Re-run only the failing checks first
- Then run full validation suite
- Repeat until all checks pass

**Command:** `/bugfix` for specific errors
**Inputs:** Validation errors
**Outputs:** Fixed code, clean validation

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|---|---|---|
| Skip planning | Aimless code, rework | Always plan first, even briefly |
| Implement everything at once | Hard to debug, large diffs | Small tasks, validate often |
| Skip validation | Bugs accumulate | Validate after every task |
| Fix errors without re-validating | New errors introduced | Always re-run full suite |
| Over-plan | Analysis paralysis | Plan just enough, iterate |
| Ignore failing tests | Technical debt | Fix or update tests immediately |

## Quick Reference

| Phase | Command | Inputs | Outputs |
|---|---|---|---|
| Plan | `/plan-plus` | Requirements, context | Task list, file paths |
| Implement | `/implement` | Plan, conventions | Code changes |
| Validate | `/validate` | Changed files | Pass/fail report |
| Iterate | `/bugfix` | Error details | Fixes, clean report |

## When to Loop Back

- **Validate fails** → Iterate → Validate again
- **New requirement discovered** → Plan (update) → Implement → Validate
- **Architecture issue found** → Plan (revise) → Implement → Validate
- **All checks pass** → Done. Commit and move to next feature.
