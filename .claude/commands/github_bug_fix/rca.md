---
description: "Root Cause Analysis for a GitHub issue. Searches codebase, reviews git history, proposes fix. Outputs to docs/rca/issue-{id}.md"
argument-hint: "<github-issue-id>"
---

# RCA — Root Cause Analysis

You are a senior debugger performing root cause analysis on a bug reported in the **Vitrina** project (Next.js 16 + Payload CMS + TypeScript + PostgreSQL 17).

**Input:** GitHub issue ID (number). If not provided, ask for it.

## Step 1: Gather Issue Details

```bash
gh issue view <issue-id> --json title,body,labels,assignees,comments,createdAt
```

Extract:
- **Title:** What the issue reports.
- **Description:** Steps to reproduce, expected vs actual behavior.
- **Labels:** Bug severity, affected area.
- **Comments:** Any additional context from contributors.

If the issue lacks reproduction steps, note this as a gap.

## Step 2: Context Loading

1. Read `CLAUDE.md` for project conventions.
2. Read `src/payload.config.ts` for collection and plugin configuration.
3. Based on the issue description, identify the likely affected area:
   - **Collection issue** → Read the relevant file in `src/collections/`.
   - **Storefront page issue** → Read the relevant file in `src/app/(storefront)/`.
   - **Component issue** → Read the relevant file in `src/components/`.
   - **Data/query issue** → Read `src/lib/payload-helpers.ts`.
   - **Config issue** → Read `src/payload.config.ts`, `next.config.ts`, `tailwind.config.ts`.

## Step 3: Codebase Search

Search for code related to the bug:

1. **Keyword search:** Search for terms from the error message or issue description.
2. **File search:** Find files related to the affected feature.
3. **Type search:** If it's a type error, search `src/payload-types.ts` for the relevant type.
4. **Pattern search:** Look for similar patterns elsewhere that work correctly (to understand the expected behavior).
5. **Library docs:** Use Context7 MCP to query current documentation for the relevant library (Payload CMS, Next.js, etc.) — verify whether the code follows the current API contract or if a breaking change was introduced.

## Step 4: Git History Analysis

```bash
git log --oneline --all -20 -- <affected-files>
git log --oneline --all --since="2 weeks ago"
```

Look for:
- Recent changes to the affected files.
- Commits that might have introduced the regression.
- Related changes in nearby files.

If a suspicious commit is found:
```bash
git show <sha> -- <affected-files>
```

## Step 5: Root Cause Determination

Classify the root cause:

| Category | Description |
|----------|-------------|
| **Type Error** | Incorrect TypeScript types, missing type narrowing, stale payload-types.ts |
| **Data Error** | Wrong query, missing field, incorrect relation, null/undefined not handled |
| **UI Error** | Component rendering issue, missing props, incorrect TailwindCSS classes |
| **Config Error** | payload.config.ts misconfiguration, missing plugin, wrong field type |
| **Logic Error** | Incorrect business logic, wrong conditional, missing edge case |
| **Integration Error** | WhatsApp link format wrong, external API issue, CORS problem |
| **Build Error** | Server/client boundary issue, missing "use client", dynamic import needed |

## Step 6: Propose Fix

For each identified cause:

1. **What to change:** Exact file(s) and line(s).
2. **How to change it:** Specific code diff or description.
3. **Why this fixes it:** Explanation of how the fix addresses the root cause.
4. **Risk assessment:** Could this fix break anything else?
5. **Test to add:** What test would catch this regression in the future?

## Step 7: Write RCA Document

Create the output directory if needed:
```bash
mkdir -p docs/rca
```

Write to `docs/rca/issue-{id}.md`:

```markdown
# RCA: Issue #{id} — {title}

**Date:** {date}
**Severity:** {Critical / High / Medium / Low}
**Status:** analysis-complete
**Issue:** {github issue URL}

## Summary
{1-2 sentence summary of the bug and its root cause}

## Reproduction
{Steps to reproduce, from the issue or determined during analysis}

## Root Cause
**Category:** {category from table above}
**File(s):** {affected files}
**Description:** {detailed explanation of why the bug occurs}

## Evidence
{Code snippets, git history, search results that support the diagnosis}

## Proposed Fix

### Changes Required
| File | Change | Reason |
|------|--------|--------|
| {file} | {description} | {why} |

### Code Diff (Proposed)
{Show the specific changes as a diff or before/after code blocks}

### Tests to Add
{Describe the test case(s) that should be added}

## Risk Assessment
- **Fix complexity:** {Low / Medium / High}
- **Regression risk:** {Low / Medium / High}
- **Files affected:** {count}

## Timeline
- **RCA completed:** {date}
- **Estimated fix time:** {estimate}
```

## Team Mode

For complex issues that span multiple areas (e.g., a bug in a collection's hook that causes a UI rendering error), break the RCA into sections by domain and suggest how multiple agents could work on the fix in parallel:

```
## Parallel Fix Strategy
- Agent 1: Fix the collection hook (backend domain)
- Agent 2: Add defensive rendering in the component (frontend domain)
- Agent 3: Add integration test covering the full flow
```

## Output

```
RCA written to: docs/rca/issue-{id}.md
Root cause: {category} — {1-line summary}
Fix complexity: {Low/Medium/High}
Ready to fix: /github_bug_fix/implement-fix {id}
```
