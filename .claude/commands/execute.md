---
description: "Execute an implementation plan, creating a git save state first. Runs validation after changes."
argument-hint: "<path-to-plan-plus.md>"
---

# Execute — Plan Implementation

You are an expert TypeScript/Next.js/Payload CMS developer implementing a plan for the **Vitrina** project.

**Input:** The user provides a path to a plan file (typically `.claude/plans/{feature}.md`). If no argument is given, list available plans in `.claude/plans/` and ask the user to pick one.

## Step 1: Read the Plan

Read the plan file completely. Do NOT skim — every detail matters.

Also read:
1. `CLAUDE.md` — project rules are mandatory context.
2. All files in `.claude/sections/` — domain conventions.
3. Every file listed in the plan's task descriptions — understand current state before modifying.

## Step 2: Create Git Save State

Before making any changes, create a save point:

```bash
git stash --include-untracked -m "save-state-before-{feature-slug}"
git stash pop
git add -A
git commit -m "chore: save state before implementing {feature-name}" --allow-empty
```

If there are no changes to save, skip the commit but note the current HEAD SHA for reference:
```bash
git rev-parse HEAD
```

Report the save state: `Save state: {SHA}`

## Step 3: Execute Tasks

Work through the plan's tasks **in order**. For each task:

### Before Starting the Task
- Read all files the task will modify (get current state).
- Identify any prerequisites from earlier tasks that this task depends on.

### During the Task
- Follow the plan's instructions precisely.
- Use the exact file paths, field names, types, and patterns specified.
- If the plan references Payload collections, ensure field definitions match the plan exactly.
- If creating or modifying UI components or storefront pages, invoke the `/frontend-design` skill to ensure production-grade design quality. This applies to any task marked `[UI]` in the plan.
- If creating new components, follow existing component patterns in `src/components/`.
- If adding pages, follow the App Router conventions in `src/app/(storefront)/`.
- Use `src/lib/payload-helpers.ts` for data fetching unless the plan specifies otherwise.
- Write TypeScript with strict types — no `any`, no `as` casts without justification.
- Add JSDoc comments to exported functions and components.
- Spanish-language content should use proper Spanish (accents, punctuation).
- **When unsure about a Payload, Next.js, or library API**, use Context7 MCP to query current documentation before guessing. This prevents implementing against outdated or incorrect API signatures.

### After Completing the Task
- Verify the task's validation criteria from the plan.
- If a task creates or modifies a Payload collection, run `npm run generate:types` to update `src/payload-types.ts`.
- Log completion: `Task {n}/{total}: {title} — DONE`

### If a Task Is Blocked or Unclear
- Do NOT guess. Stop and report what is unclear.
- Suggest a resolution and ask the user before proceeding.
- If the issue is minor (typo in plan, obvious intent), fix it and note the divergence.

## Step 4: Post-Implementation Validation

After all tasks are complete, run the full validation suite:

```bash
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
```

Report each check as PASS or FAIL. If any check fails:
1. Attempt to fix the issue (up to 2 attempts per failure).
2. If the fix succeeds, note what was wrong and how it was fixed.
3. If the fix fails after 2 attempts, report the issue and move on.

## Step 5: Completion Report

Produce a summary:

```
## Execution Complete: {Feature Name}

**Plan:** {plan file path}
**Save state:** {SHA}
**Tasks completed:** {n}/{total}

### Results
| Task | Status | Notes |
|------|--------|-------|
| 1. {title} | DONE | {any notes} |
| 2. {title} | DONE | {any notes} |
| ... | ... | ... |

### Validation
| Check | Status |
|-------|--------|
| ESLint | PASS/FAIL |
| TypeScript | PASS/FAIL |
| Vitest | PASS/FAIL |
| Build | PASS/FAIL |

### Divergences from Plan
{List any places where implementation differed from the plan and why}

### Files Changed
{List all files created or modified}

### Next Steps
- [ ] {any follow-up items}
- Ready to commit: /commit
```

## Important Rules

- **Never skip validation.** Even if you think everything is fine, run the checks.
- **Never modify files not listed in the plan** unless it's a direct dependency (e.g., updating an import in a barrel file).
- **Regenerate types** after any collection change: `npm run generate:types`
- **Preserve existing functionality.** If a task could break something, verify the existing behavior still works.
- **Commit nothing.** The execute command does NOT commit. The user will use `/commit` when ready.
