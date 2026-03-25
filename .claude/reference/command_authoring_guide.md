# Command Authoring Guide

## File Structure

Every command is a Markdown file with YAML frontmatter:

```markdown
---
name: command-name
description: One-line description of what this command does
arguments:
  - name: target
    description: File or directory to operate on
    required: true
  - name: scope
    description: Scope of operation (file, module, project)
    required: false
    default: file
---

# Command Name

## Context
What this command needs to know before running.

## Steps
1. First action
2. Second action
3. Third action

## Output Format
How to structure the response.

## Examples
Concrete input/output examples.
```

## Design Principles

1. **Self-contained** — Command includes all context needed to execute. No external docs required.
2. **Project-agnostic** — Reference project conventions from CLAUDE.md, not hardcoded values.
3. **Structured output** — Define exact output format so results are parseable and consistent.
4. **Single responsibility** — One command does one thing well.
5. **Idempotent** — Running twice produces the same result.

## Command Categories

| Category | Purpose | Examples |
|---|---|---|
| **Plan** | Analyze and decompose work | `/plan-plus`, `/design-feature` |
| **Implement** | Generate or modify code | `/implement`, `/add-collection` |
| **Validate** | Check correctness | `/validate`, `/review-code` |
| **Fix** | Resolve specific issues | `/bugfix`, `/fix-types` |
| **Explore** | Understand codebase | `/explain`, `/find-pattern` |

## Naming Conventions

- Lowercase, hyphen-separated: `fix-types`, `add-collection`
- Verb-first: `validate-schema`, not `schema-validate`
- Specific over generic: `add-payload-collection`, not `add-thing`

## Directory Organization

```
.claude/commands/
├── plan-plus.md         # Planning command
├── implement.md         # Implementation command
├── validate.md          # Validation command
├── bugfix.md            # Bug fix command
└── custom/
    ├── add-collection.md    # Project-specific
    └── add-page.md          # Project-specific
```

## Writing Steps

Steps should be concrete and actionable:

```markdown
## Steps

1. Read the target file and identify its purpose
2. Check for existing tests in `tests/` matching the source path
3. Generate test cases covering:
   - Happy path (valid inputs)
   - Edge cases (empty, null, boundary values)
   - Error cases (invalid inputs, missing data)
4. Run: `npm test -- --testPathPattern <test-file>`
5. Report results in the output format below
```

## Output Format Example

```markdown
## Output Format

### Summary
- **Status:** pass | fail | partial
- **Files changed:** list of file paths

### Details
For each change:
- File path
- What changed and why
- Any warnings or notes

### Next Steps
- Suggested follow-up actions
```

## Testing Checklist

Before shipping a command:

- [ ] Run it against a real file in the project
- [ ] Verify output matches the defined format
- [ ] Test with missing/invalid arguments
- [ ] Confirm it reads project conventions from CLAUDE.md
- [ ] Check it works on both new and existing code
- [ ] Ensure it does not modify files unless that is its explicit purpose
