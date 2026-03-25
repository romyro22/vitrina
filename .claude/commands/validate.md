---
description: "Run the full quality validation suite: lint, types, tests, build. Reports PASS/FAIL per check with fix suggestions."
---

# Validate — Quality Gate

You are validating the **Vitrina** project (Next.js 16 + Payload CMS + TypeScript strict mode).

Run all four validation levels in sequence. Stop-on-failure is NOT required — run all levels and report everything.

## Level 1: Linting (ESLint)

```bash
npm run lint
```

- **PASS:** No errors or warnings.
- **FAIL:** Report each error with file, line, and rule name.
- **Fix suggestion:** Most ESLint issues can be auto-fixed with `npm run lint -- --fix`. For `@typescript-eslint` rule violations, provide the specific code fix.

## Level 2: Type Checking (TypeScript)

```bash
npx tsc --noEmit
```

- **PASS:** No type errors.
- **FAIL:** Report each error with file, line, error code (e.g., TS2345), and the actual vs expected type.
- **Fix suggestion:** For each type error, suggest the correct type annotation or cast. If the error is in `src/payload-types.ts`, it means types are stale — run `npm run generate:types` and re-check.

## Level 3: Tests (Vitest)

```bash
npx vitest run 2>&1 || echo "VITEST_EXIT: $?"
```

- **PASS:** All tests pass.
- **FAIL:** Report each failing test with the test name, file, assertion that failed, and expected vs actual values.
- **SKIP:** If no test files exist yet, report as `SKIP — no tests configured` (this is not a failure, but note it as technical debt).
- **Fix suggestion:** For assertion failures, suggest the fix. For missing test infrastructure, suggest creating `vitest.config.ts` and a first test file.

## Level 4: Production Build

```bash
npm run build
```

- **PASS:** Build completes without errors.
- **FAIL:** Report the build error. Common issues in Payload/Next.js projects:
  - Missing environment variables at build time.
  - Server-only code imported in client components (`"use client"` boundary issues).
  - Dynamic imports needed for client components using browser APIs.
  - Payload `afterRead`/`beforeChange` hooks with incorrect types.
- **Fix suggestion:** Provide the specific code change needed.

## Summary Report

```
## Validation Report — Vitrina

| Level | Check | Status | Issues |
|-------|-------|--------|--------|
| 1 | ESLint | PASS/FAIL | {count or 0} |
| 2 | TypeScript | PASS/FAIL | {count or 0} |
| 3 | Vitest | PASS/FAIL/SKIP | {count or 0} |
| 4 | Build | PASS/FAIL | {count or 0} |

**Overall: {PASS / FAIL}**

### Issues Found
{Numbered list of each issue with file, description, and fix suggestion}

### Recommended Fix Order
{If multiple issues exist, suggest the order to fix them — usually: type errors first, then lint, then tests, then build.}
```

## Auto-Fix Mode

If the user says "fix" or "auto-fix" after a validation run, attempt to fix all reported issues:

1. Fix type errors first (they often cause cascading lint/build failures).
2. Fix lint errors next.
3. Fix test failures.
4. Re-run the full validation suite to confirm.

After auto-fixing, report what was changed and re-run validation to confirm green checks.

**Green checks = done.** When all four levels pass, the project is ready to commit.
