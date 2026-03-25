---
description: "Create a structured implementation plan for a feature or change. Outputs to .claude/plans/{feature}.md"
argument-hint: "<feature-description>"
---

# Plan — Feature Planning

You are a senior architect planning a feature for **Vitrina**, a Spanish-language product showcase built with Next.js 16 (App Router), Payload CMS, PostgreSQL 17, and TailwindCSS 4 + shadcn/ui.

**Input:** The user provides a feature description as the argument. If no argument is given, ask for one before proceeding.

## Phase 0: Context Loading

1. Read `CLAUDE.md` at the repository root — this is mandatory, never skip it.
2. Read all files in `.claude/sections/` for domain-specific conventions.
3. Read `src/payload.config.ts` to understand current collections and configuration.
4. Read `src/payload-types.ts` to understand current type definitions.
5. Scan `src/collections/`, `src/app/(storefront)/`, and `src/components/` to understand existing code.

## Phase 1: Vibe Planning (Exploration)

Before committing to a plan, explore the solution space:

- **Option A:** Describe the most straightforward approach.
- **Option B:** Describe an alternative approach (different architecture, different Payload feature, etc.).
- **Option C (optional):** If there's a third viable path, describe it.

For each option, note:
- Complexity (Low / Medium / High)
- Files touched (count)
- New dependencies required
- Risk factors
- Alignment with existing patterns in the codebase

Present the options to the user and ask which direction to pursue. If the user says "just do it" or similar, pick the simplest option that meets requirements.

## Phase 2: 5-Phase Analysis

Once a direction is chosen, perform deep analysis:

### 2.1 Requirements Analysis
- What exactly does this feature need to do?
- What are the user-facing behaviors (storefront side)?
- What are the admin-facing behaviors (Payload admin side)?
- What data needs to be stored/queried?
- What are the WhatsApp integration touchpoints (if any)?

### 2.2 Architecture Analysis
- Which Payload collections need to be created or modified?
- Which pages/routes are affected?
- Which components need to be created or updated? If any, mark the task with `[UI]` so the executor knows to use `/frontend-design`.
- What data-fetching patterns are needed (server components, `payload-helpers.ts`)?
- Does this need API routes beyond Payload's built-in REST/GraphQL?

### 2.3 Dependency Analysis
- Are new npm packages needed? List them with exact versions.
- Are new Payload plugins needed?
- Does this require changes to `payload.config.ts`?
- Does this require database migrations (Payload handles these automatically on `npm run dev`)?
- **Use Context7 MCP** to query up-to-date docs for any library being added or any Payload/Next.js API being used in an unfamiliar way. Do not rely on training data for framework-specific behavior — verify against current docs.

### 2.4 Risk Analysis
- What could go wrong during implementation?
- Are there breaking changes to existing functionality?
- Are there performance implications (large queries, missing indexes)?
- Are there i18n considerations (Spanish-first content)?

### 2.5 Task Decomposition
Break the work into ordered, atomic tasks. Each task must:
- Have a clear description of what to do.
- List the exact files to create or modify.
- Specify the expected outcome.
- Be completable independently (within reason).
- Include validation criteria.

## Phase 3: Write the Plan

Output the plan to `.claude/plans/{feature-slug}.md` using this format:

```markdown
# Plan: {Feature Name}

**Created:** {date}
**Status:** draft
**Confidence Score:** {1-10}/10
**Estimated Tasks:** {count}
**Estimated Files:** {count}

## Summary
{2-3 sentence overview}

## Approach
{Which option was chosen from Phase 1 and why}

## Tasks

### Task 1: {Title}
**Files:** {list of files to create/modify}
**Description:**
{Detailed instructions — specific enough that a developer with no prior knowledge of this feature could implement it}

**Validation:**
- [ ] {specific check}

### Task 2: {Title}
...

## Dependencies
{New packages, if any}

## Risks & Mitigations
{Key risks and how to handle them}

## Out of Scope
{What this plan deliberately does NOT cover}
```

## Phase 4: No Prior Knowledge Test

Review your plan and ask: "Could a developer who has never seen this codebase implement this feature using ONLY this plan and the CLAUDE.md?"

If the answer is no, add more detail to the weak areas. Specifically check:
- Are file paths absolute or clearly relative to project root?
- Are Payload collection field definitions explicit (field type, name, required, relations)?
- Are component props and types specified?
- Are data-fetching patterns spelled out (which helper to use, what query shape)?

## Phase 5: Confidence Score

Rate your confidence in the plan from 1 to 10:
- **1-3:** Too many unknowns, needs research or user input before proceeding.
- **4-6:** Reasonable plan but some assumptions that may need adjustment during execution.
- **7-9:** High confidence, clear path, well-understood patterns.
- **10:** Trivial change, virtually no risk.

Report the score and explain any factors that lower confidence.

## Output

After writing the plan file, print:
```
Plan written to: .claude/plans/{feature-slug}.md
Confidence: {score}/10
Tasks: {count}
Ready to execute: /execute .claude/plans/{feature-slug}.md
```
