# Plan: ESLint Flat Config Setup

**Created:** 2026-03-25
**Status:** executed
**Confidence Score:** 10/10
**Estimated Tasks:** 2
**Estimated Files:** 2

## Summary

Create `eslint.config.mjs` using ESLint 9 flat config format with Next.js 16's `core-web-vitals` and `typescript` presets. Update the `lint` script from the defunct `next lint` to `eslint .`.

## Approach

Use the native flat config API (`defineConfig` + `globalIgnores` from `eslint/config`) as documented in the Next.js 16 ESLint docs. No `FlatCompat` bridge — all dependencies already support flat config natively.

## Tasks

### Task 1: Create eslint.config.mjs
**Files:** `eslint.config.mjs` (create)
**Description:**
Create the flat config file at the project root:

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
```

This combines:
- `core-web-vitals` — Next.js + React + React Hooks rules, with CWV-related rules as errors
- `typescript` — TypeScript-ESLint recommended rules (matches the project's `strict: true` tsconfig)

**Validation:**
- [ ] `npx eslint . --max-warnings 0` runs without config errors
- [ ] File exists at project root as `eslint.config.mjs`

---

### Task 2: Update lint script in package.json
**Files:** `package.json` (modify)
**Description:**
Replace the broken `next lint` script with the ESLint CLI:

```diff
-    "lint": "next lint",
+    "lint": "eslint .",
```

`next lint` was removed in Next.js 16 — the standard ESLint CLI is the replacement.

**Validation:**
- [ ] `npm run lint` executes successfully
- [ ] Lint catches real issues (e.g., unused imports, missing keys)

## Dependencies

None — `eslint` and `eslint-config-next` are already installed.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Existing code may have lint errors | Fix them or add targeted rule overrides |
| Payload admin files may trigger false positives | They live in `src/app/(payload)/` which auto-generates `importMap.js` — may need to ignore that file |

## Out of Scope

- Prettier integration
- Custom rule configuration beyond the Next.js presets
- Pre-commit hooks (husky/lint-staged)
