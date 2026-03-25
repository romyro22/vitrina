---
description: "Create an atomic git commit with conventional commit format. Runs validation first."
---

# Commit — Atomic Git Commit

You are preparing a git commit for the **Vitrina** project.

## Step 1: Pre-Commit Validation

Run the full validation suite before committing. This is mandatory — never skip it.

```bash
npm run lint
npx tsc --noEmit
npx vitest run 2>&1 || true
npm run build
```

If any check fails (except Vitest if no tests exist yet):
- Report the failures.
- Do NOT proceed with the commit.
- Suggest running `/validate` to see detailed fix suggestions.

## Step 2: Analyze Changes

Run these commands to understand what will be committed:

```bash
git status
git diff --staged
git diff
git log --oneline -10
```

Review:
- **Staged changes:** What is already staged.
- **Unstaged changes:** What is modified but not staged. Ask the user if these should be included.
- **Untracked files:** New files that need to be added. Ask the user if these should be included.
- **Recent history:** Understand the commit message style and recent context.

## Step 3: Stage Files

Stage the appropriate files. Be selective:
- **DO** stage source files (`src/`), config files, test files, plan/report files.
- **DO NOT** stage `.env`, `.env.local`, `node_modules/`, `.next/`, or any file containing secrets.
- **DO NOT** stage `src/payload-types.ts` unless collection changes were made (it is auto-generated).

If unsure about a file, ask the user.

## Step 4: Craft Commit Message

Use **Conventional Commits** format:

```
<type>(<scope>): <short description>

<optional body — what and why, not how>

<optional footer>
```

### Types
- `feat` — New feature or capability
- `fix` — Bug fix
- `refactor` — Code change that neither fixes a bug nor adds a feature
- `style` — Formatting, whitespace, missing semicolons (no logic change)
- `docs` — Documentation only
- `test` — Adding or updating tests
- `chore` — Maintenance (deps, config, scripts)
- `perf` — Performance improvement
- `ci` — CI/CD changes

### Scopes (Vitrina-specific)
- `collections` — Payload collection changes
- `storefront` — Customer-facing pages
- `admin` — Payload admin customizations
- `components` — Shared UI components
- `lib` — Utility/helper functions
- `config` — Configuration (payload.config.ts, tailwind, etc.)
- `types` — Type definitions
- `docker` — Docker/infrastructure
- `deps` — Dependency updates

### Rules
- Short description: imperative mood, lowercase, no period, under 72 characters.
- Body: wrap at 80 characters. Explain WHY the change was made.
- If implementing a plan, reference it: `Plan: .claude/plans/{feature}.md`
- If fixing an issue, reference it: `Fixes #{issue-number}`

## Step 5: Create the Commit

```bash
git add <files>
git commit -m "<message>"
```

## Step 6: Post-Commit Verification

```bash
git status
git log --oneline -3
```

Confirm:
- Working tree is clean (or only expected files remain unstaged).
- The commit message looks correct in the log.

Report:
```
Committed: {short SHA} {commit message first line}
Files: {count} changed, {insertions} insertions, {deletions} deletions
```
