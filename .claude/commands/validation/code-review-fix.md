---
description: "Fix issues identified in a code review. Addresses findings one by one, adds tests, runs validation."
argument-hint: "<review-file-or-description>"
---

# Code Review Fix — Address Review Findings

You are fixing code review findings in the **Vitrina** project (Next.js 16 + Payload CMS + TypeScript).

**Input:** Path to a code review file (e.g., `.claude/code-reviews/review-{date}.md`) or a description of the issue to fix. If a review file is given, fix all CRITICAL and HIGH findings. If a description is given, treat it as a single finding.

## Step 1: Read Review and Context

1. Read the code review file (if provided).
2. Read `CLAUDE.md` for project conventions.
3. For each finding to fix, read the full source file mentioned.

## Step 2: Prioritize Findings

Fix findings in this order:
1. **CRITICAL** — Security vulnerabilities, data loss risks, crashes.
2. **HIGH** — Logic errors, type safety violations, broken features.
3. **MEDIUM** — Performance issues, missing validation (only if the user requests).
4. **LOW** — Style nits (only if the user requests).

Skip INFO findings — they are observations, not action items.

## Step 3: Fix Each Finding

For each finding, in priority order:

### 3.1 Understand the Issue
- Read the finding's description and the affected file.
- Understand WHY it's a problem (not just what to change).

### 3.2 Apply the Fix
- If the review includes a suggested code change, apply it (adapting to current file state if needed).
- If no suggestion is provided, write the fix based on the description.
- Follow Vitrina conventions:
  - TypeScript strict types.
  - JSDoc on exported symbols.
  - TailwindCSS 4 classes.
  - Payload collection field conventions.
  - Server Component defaults (no "use client" unless required).

### 3.3 Verify the Fix
- Does the fix address the root cause, not just the symptom?
- Does it introduce any new issues?
- Is it consistent with the rest of the file?

### 3.4 Add Test Coverage
For CRITICAL and HIGH findings, add a test that:
- Reproduces the original issue (fails without the fix).
- Verifies the fix works (passes with the fix).

```typescript
describe('Code Review Fix: {finding title}', () => {
  it('should {expected behavior after fix}', () => {
    // Test the fixed behavior
  });
});
```

### 3.5 Log Progress
After each finding is fixed:
```
Fixed [{severity}] Finding {n}: {title}
  File: {path}
  Change: {1-line summary}
  Test: {added/not needed}
```

## Step 4: Regenerate Types (if needed)

If any Payload collection was modified:
```bash
npm run generate:types
```

## Step 5: Run Validation

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

All checks must pass. If a validation failure is caused by a fix, correct it before moving to the next finding.

## Step 6: Update Review File

If a review file was provided, update the status of each fixed finding:

Change:
```
### Finding 1: {Title}
**Severity:** HIGH
```
To:
```
### Finding 1: {Title} [FIXED]
**Severity:** HIGH
**Fixed in:** {file} — {1-line description of change}
```

Update the summary section with the new assessment.

## Step 7: Completion Report

```
## Code Review Fixes Applied

**Review:** {review file path}
**Findings fixed:** {count}
**Findings skipped:** {count} ({reason — e.g., "LOW severity, user did not request"})

### Fixed
| # | Severity | Finding | File | Test Added |
|---|----------|---------|------|------------|
| 1 | CRITICAL | {title} | {file} | Yes/No |
| 2 | HIGH | {title} | {file} | Yes/No |

### Validation
| Check | Status |
|-------|--------|
| ESLint | PASS/FAIL |
| TypeScript | PASS/FAIL |
| Vitest | PASS/FAIL |
| Build | PASS/FAIL |

### Remaining Findings
{List any MEDIUM/LOW findings not addressed}

Ready to commit: /commit
```
