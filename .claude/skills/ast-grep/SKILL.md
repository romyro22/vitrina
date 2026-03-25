# ast-grep Skill

## Overview

ast-grep is an AST-based structural code search and rewrite tool. Unlike regex, it understands code structure — matching `console.log($ARG)` finds all console.log calls regardless of formatting or argument complexity.

## When to Use

- Find specific code patterns across the codebase (e.g., all `getPayload()` calls)
- Refactor: rename, wrap, or restructure code structurally
- Enforce rules: detect anti-patterns before they reach review
- Explore unfamiliar code: "show me all server components that fetch data"

## 5-Step Workflow

```
1. Understand the query
   └─ What pattern are you looking for? What language?

2. Create example code
   └─ Write a minimal snippet that contains the pattern

3. Write the rule
   └─ Use pattern, kind, has, inside, etc. (see references/rule_reference.md)

4. Test the rule
   └─ ast-grep run --inline-rules '<rule>' --debug-query ./test-file.ts

5. Search the codebase
   └─ ast-grep run --inline-rules '<rule>' src/
```

## CLI Reference

### Search with inline rule
```bash
# Simple pattern match
ast-grep run --pattern 'console.log($ARG)' src/

# Inline YAML rule
ast-grep run --inline-rules '{rule: {pattern: "getPayload()"}}' src/

# With language specified
ast-grep run --lang tsx --pattern '<Link href=$URL>$$$CHILDREN</Link>' src/
```

### Scan with config file
```bash
# Run all rules in sgconfig.yml
ast-grep scan

# Scan specific directory
ast-grep scan src/collections/
```

### Debug a rule
```bash
# Show AST node kinds for a pattern
ast-grep run --pattern '$EXPR' --debug-query ./src/app/page.tsx

# Test a rule against a single file
ast-grep run --inline-rules '{rule: {pattern: "export const $NAME: CollectionConfig"}}' --debug-query src/collections/Products.ts
```

## Tips for Effective Rules

1. **Start simple** — begin with `--pattern` before writing full YAML rules
2. **Use `--debug-query`** — shows how ast-grep parses your pattern and what it matches
3. **Metavariables are greedy** — `$ARG` matches a single node, `$$$ARGS` matches zero or more
4. **Combine with `has`/`inside`** — narrow matches by requiring parent/child context
5. **`kind` is precise** — use it when pattern matching is too loose (get kinds from `--debug-query`)
6. **TSX vs TS matters** — use `--lang tsx` for files with JSX

## Common Patterns for TypeScript/React

```yaml
# Find all "use client" directives
rule:
  pattern: '"use client"'
  kind: string

# Find all Payload collection exports
rule:
  pattern: 'export const $NAME: CollectionConfig = $CONFIG'

# Find React components with specific props
rule:
  pattern: '<$COMP className=$CLASS $$$REST />'

# Find async server components
rule:
  pattern: 'async function $NAME($$$PARAMS) { $$$BODY }'
  inside:
    kind: export_statement

# Find all imports from @/lib/
rule:
  pattern: 'import $$$IMPORTS from "@/lib/$MOD"'

# Find getPayload() calls without error handling
rule:
  pattern: 'const $VAR = await getPayload()'
  not:
    inside:
      kind: try_statement
```

## Reference

See [references/rule_reference.md](references/rule_reference.md) for the complete rule syntax.
