---
description: "Review recent code changes for logic errors, security issues, performance problems, and quality. Outputs to .claude/code-reviews/"
---

# Code Review — Quality Analysis

You are a senior TypeScript/Next.js/Payload CMS reviewer performing a thorough code review on the **Vitrina** project.

## Step 1: Identify Changes to Review

Determine what to review:

```bash
git diff --name-only HEAD~1
git diff --stat HEAD~1
```

If the user specifies particular files or a commit range, use those instead.

List all changed files and categorize them:
- **Collections** (`src/collections/`)
- **Pages** (`src/app/(storefront)/`)
- **Components** (`src/components/`)
- **Lib/Helpers** (`src/lib/`)
- **Config** (`src/payload.config.ts`, `next.config.ts`, etc.)
- **Tests** (`tests/` or `*.test.ts`)
- **Other**

## Step 2: Read Full Files

For every changed file, read the **entire file** — not just the diff. Context matters.

Also read:
- `CLAUDE.md` for project conventions.
- Related files that import from or are imported by the changed files.
- `src/payload-types.ts` if collection changes are involved.

## Step 3: Review Checklist

Review each file against these categories:

### Logic Errors
- [ ] Correct control flow (conditions, loops, early returns).
- [ ] Null/undefined handling (optional chaining, nullish coalescing, type guards).
- [ ] Correct array/object operations (map, filter, reduce — correct return types).
- [ ] Async/await used correctly (no floating promises, proper error handling).
- [ ] Payload hooks (afterRead, beforeChange, etc.) return correct data shapes.
- [ ] Server Components vs Client Components boundary is correct ("use client" where needed).

### Security
- [ ] No secrets, API keys, or credentials in code (check for hardcoded strings).
- [ ] User input is validated before use (Payload field validation, Zod schemas).
- [ ] No SQL injection vectors (Payload ORM should handle this, but check raw queries).
- [ ] No XSS vectors in rendered content (check `dangerouslySetInnerHTML`, rich text rendering).
- [ ] WhatsApp links are properly encoded (no injection in URL parameters).
- [ ] Image URLs are validated or use Payload's media handling.

### Performance
- [ ] No N+1 queries (check `depth` parameter in Payload queries, avoid fetching relations in loops).
- [ ] Appropriate use of `select` and `limit` in Payload queries.
- [ ] Images use Next.js `<Image>` component with proper sizing.
- [ ] Heavy computations are not in render paths.
- [ ] No unnecessary re-renders (check dependency arrays in useEffect/useMemo).
- [ ] Database indexes needed for new query patterns.

### Code Quality
- [ ] TypeScript types are strict (no `any`, no unnecessary `as` casts).
- [ ] Functions have JSDoc comments.
- [ ] Variable names are descriptive and consistent.
- [ ] No dead code (unused imports, unreachable branches).
- [ ] DRY — no duplicated logic that should be in a shared helper.
- [ ] Consistent with existing patterns in the codebase.
- [ ] Spanish content uses proper grammar and accents.

### Payload-Specific
- [ ] Collection fields have correct types, required flags, and validation.
- [ ] `admin` config is set appropriately (description, group, useAsTitle).
- [ ] Relations use correct `relationTo` values.
- [ ] Hooks are typed correctly and handle edge cases.
- [ ] Access control is configured (even if wide-open for now, it should be explicit).

### Next.js/React-Specific
- [ ] Server Components are the default (no "use client" unless needed).
- [ ] Data fetching uses server components and `src/lib/payload-helpers.ts`.
- [ ] Metadata exports are present on pages (title, description for SEO).
- [ ] Loading and error boundaries are handled.
- [ ] Dynamic routes use `generateStaticParams` where appropriate.

## Step 4: Severity Classification

Classify each finding:

| Severity | Description | Action |
|----------|-------------|--------|
| **CRITICAL** | Security vulnerability, data loss risk, crash | Must fix before merge |
| **HIGH** | Logic error, type safety violation, broken feature | Should fix before merge |
| **MEDIUM** | Performance issue, missing validation, poor pattern | Fix soon |
| **LOW** | Style nit, naming suggestion, minor improvement | Nice to have |
| **INFO** | Observation, question, or suggestion for future | No action needed |

## Step 5: Write Review Report

Create output directory if needed:
```bash
mkdir -p .claude/code-reviews
```

Write to `.claude/code-reviews/review-{date}-{short-description}.md`:

```markdown
# Code Review: {Description of Changes}

**Date:** {date}
**Reviewer:** AI Code Review
**Commit(s):** {SHA range}
**Files reviewed:** {count}

## Summary
{1-3 sentence overview: overall quality, key concerns}

## Findings

### CRITICAL
{Numbered list or "None"}

### HIGH
{Numbered list or "None"}

### MEDIUM
{Numbered list or "None"}

### LOW
{Numbered list or "None"}

### INFO
{Numbered list or "None"}

## Detailed Findings

### Finding 1: {Title}
**Severity:** {level}
**File:** {path}
**Line(s):** {range}
**Description:** {what the issue is}
**Suggestion:** {how to fix it}
```code
{suggested code change}
```

...

## Statistics
- Files reviewed: {count}
- Findings: {critical}/{high}/{medium}/{low}/{info}
- Overall assessment: {APPROVE / REQUEST CHANGES / NEEDS DISCUSSION}
```

## Team Mode

If reviewing 6 or more files, partition the review by domain:

```
## Review Assignments (Team Mode)

### Domain: Collections ({n} files)
- {file list}
- Focus: field types, hooks, access control

### Domain: Storefront ({n} files)
- {file list}
- Focus: server/client boundaries, data fetching, SEO

### Domain: Components ({n} files)
- {file list}
- Focus: props, accessibility, responsive design
```

## Output

```
Review written to: .claude/code-reviews/{filename}.md
Files reviewed: {count}
Findings: {critical} critical, {high} high, {medium} medium, {low} low
Assessment: {APPROVE / REQUEST CHANGES}
Fix issues: /validation/code-review-fix .claude/code-reviews/{filename}.md
```
