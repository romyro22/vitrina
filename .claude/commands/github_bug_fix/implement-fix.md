---
description: "Implement a bug fix from an existing RCA document. Reads RCA, applies fix, adds tests, runs validation."
argument-hint: "<github-issue-id>"
---

# Implement Fix — From RCA to Resolution

You are implementing a bug fix for the **Vitrina** project based on a Root Cause Analysis document.

**Input:** GitHub issue ID (number). The corresponding RCA must exist at `docs/rca/issue-{id}.md`. If it does not exist, tell the user to run `/github_bug_fix/rca {id}` first.

## Step 1: Read RCA and Context

1. Read `docs/rca/issue-{id}.md` completely.
2. Read `CLAUDE.md` for project conventions.
3. Read all files listed in the RCA's "Changes Required" table.
4. Read any related test files if they exist.

## Step 2: Create Git Save State

```bash
git stash --include-untracked -m "save-state-before-fix-issue-{id}"
git stash pop
git add -A
git commit -m "chore: save state before fixing issue #{id}" --allow-empty
```

Note the current HEAD SHA as the save point.

## Step 3: Implement the Fix

Follow the RCA's proposed fix exactly. For each change in the "Changes Required" table:

1. Read the target file.
2. Apply the described change.
3. Ensure the change follows Vitrina's coding conventions:
   - TypeScript strict mode (no `any`, no untyped variables).
   - Proper null/undefined handling with optional chaining or type guards.
   - JSDoc comments on exported functions.
   - TailwindCSS 4 utility classes (not inline styles).
   - Payload collection fields with correct types and validation.

If the RCA's proposed code diff is outdated or doesn't apply cleanly, adapt it to the current state of the file while preserving the intent.

## Step 4: Add Tests

Based on the RCA's "Tests to Add" section, create or update test files:

1. **Unit test:** Test the specific function/component that was broken.
2. **Regression test:** Test the exact scenario from the bug report to prevent recurrence.

Test file location: mirror the source structure under `tests/` or co-locate with `*.test.ts` / `*.test.tsx` files depending on existing project conventions.

Example test structure for Vitrina:
```typescript
import { describe, it, expect } from 'vitest';

describe('Issue #{id}: {title}', () => {
  it('should {expected behavior from the bug report}', () => {
    // Arrange: set up the scenario from the bug report
    // Act: perform the action that triggered the bug
    // Assert: verify the correct behavior
  });
});
```

If tests require Payload Local API access, use the pattern:
```typescript
import { getPayload } from 'payload';
import config from '@/payload.config';

const payload = await getPayload({ config });
```

## Step 5: Regenerate Types (if needed)

If any Payload collection was modified:
```bash
npm run generate:types
```

Verify the generated types match expectations.

## Step 6: Run Validation

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

All checks must pass. If any fail:
1. Analyze the failure — is it related to the fix or a pre-existing issue?
2. If related to the fix, correct it (up to 2 attempts).
3. If pre-existing, note it but do not block the fix.

## Step 7: Update RCA Status

Edit `docs/rca/issue-{id}.md` to update the status:

```markdown
**Status:** fix-implemented
**Fix commit:** {pending — will be set after /commit}
```

## Step 8: Completion Report

```
## Fix Implemented: Issue #{id}

**RCA:** docs/rca/issue-{id}.md
**Save state:** {SHA}

### Changes Made
| File | Change |
|------|--------|
| {file} | {description} |

### Tests Added
| File | Test Description |
|------|-----------------|
| {file} | {what it tests} |

### Validation
| Check | Status |
|-------|--------|
| ESLint | PASS/FAIL |
| TypeScript | PASS/FAIL |
| Vitest | PASS/FAIL |
| Build | PASS/FAIL |

### Divergences from RCA
{Any differences between the proposed fix and what was actually implemented}

Ready to commit: /commit
Ready to close issue: gh issue close {id} --comment "Fixed in commit {sha}"
```
