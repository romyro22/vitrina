---
description: "Generate a comprehensive Product Requirements Document (PRD) with 15 sections. Supports team mode for multi-domain products."
argument-hint: "<output-filename.md>"
---

# Create PRD — Product Requirements Document Generator

You are a senior product manager creating a PRD for a feature or product within the **Vitrina** ecosystem (Spanish-language product showcase, WhatsApp-first, Next.js 16 + Payload CMS).

**Input:** The user provides an output filename. If not given, ask for one. The file will be saved to `.claude/plans/{filename}`.

## Context Loading

1. Read `CLAUDE.md` for project conventions and architecture.
2. Read `.claude/sections/` for domain-specific context.
3. Read `src/payload.config.ts` to understand existing collections and capabilities.
4. Scan `src/app/(storefront)/` to understand current user-facing features.

## Interview Phase

Before writing the PRD, ask the user these questions (skip any the user has already answered in their initial prompt):

1. **What problem does this solve?** (user pain point)
2. **Who is the target user?** (store owner? customer? both?)
3. **What does success look like?** (measurable outcome)
4. **Are there constraints?** (timeline, budget, technical limitations)
5. **What is out of scope?** (what this is NOT)

## PRD Sections

Write all 15 sections:

### 1. Title & Metadata
- Feature/product name
- Author, date, version, status (draft/review/approved)

### 2. Executive Summary
- 2-3 sentence overview. What, why, for whom.

### 3. Problem Statement
- What problem exists today? Who is affected? What is the cost of not solving it?

### 4. Goals & Success Metrics
- 3-5 measurable goals with specific KPIs.
- For Vitrina: think WhatsApp message rates, catalog views, time-to-publish for store owners.

### 5. Target Users & Personas
- Primary persona: store owner (Spanish-speaking, non-technical, mobile-first).
- Secondary persona: end customer (browsing products, contacting via WhatsApp).
- Include relevant behaviors, goals, and frustrations.

### 6. User Stories & Scenarios
- Format: "Como [persona], quiero [accion], para [beneficio]" (Spanish user stories).
- Include 5-10 user stories covering the core flow.
- Include 1-2 edge case scenarios.

### 7. Functional Requirements
- Numbered list (FR-001, FR-002, ...).
- Each requirement: description, priority (Must/Should/Could/Won't), acceptance criteria.

### 8. Non-Functional Requirements
- Performance targets (page load time, Lighthouse scores).
- Accessibility (WCAG 2.1 AA minimum).
- SEO requirements (metadata, Open Graph, structured data).
- Mobile responsiveness (mobile-first design).
- Internationalization (Spanish primary, structure for future languages).

### 9. Technical Architecture
- Which Payload collections are needed (with field definitions).
- Which pages/routes to create.
- Which components to build.
- Data flow diagrams (text-based).
- Integration points (WhatsApp links, external services).

### 10. UI/UX Requirements
- Wireframe descriptions (text-based, referencing shadcn/ui components).
- Key screens and their purpose.
- Navigation flow.
- Mobile-first layout considerations.
- Spanish language UI conventions (formal/informal tone, button labels).

### 11. Data Model
- Collection schemas with field types, validation rules, and relationships.
- Sample data for each collection.
- Query patterns that will be needed.

### 12. API & Integration Points
- Payload REST API endpoints that will be used.
- WhatsApp link generation format.
- Any external API integrations.

### 13. Security & Privacy
- Data handling requirements.
- Input validation rules.
- Content moderation needs (if user-generated content).
- GDPR/privacy considerations for customer data.

### 14. Release Plan
- Phases (MVP, v1.1, v1.2, ...).
- What is in each phase.
- Dependencies between phases.

### 15. Open Questions & Risks
- Unresolved decisions.
- Technical risks.
- Business risks.
- Assumptions that need validation.

## Team Mode

If the feature spans multiple domains (e.g., new collection + new storefront page + WhatsApp integration), break the PRD into domain sections and suggest which tasks could be worked on in parallel by separate agents:

```
## Parallel Workstreams

### Workstream A: Data Layer (Payload Collections)
- Tasks that can be done independently
- Estimated: {n} tasks

### Workstream B: Storefront UI (Next.js Pages + Components)
- Tasks that depend on Workstream A's types but can start with mocks
- Estimated: {n} tasks

### Workstream C: Integration (WhatsApp, external services)
- Tasks that can be done independently
- Estimated: {n} tasks
```

## Output

Save the PRD to `.claude/plans/{output-filename}` and report:

```
PRD written to: .claude/plans/{output-filename}
Sections: 15/15
User stories: {count}
Functional requirements: {count}
Ready to plan: /plan-plus {feature-summary}
```
