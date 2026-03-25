# ast-grep Rule Reference

## Atomic Rules

### pattern
Matches code structurally. Metavariables capture AST nodes.

```yaml
rule:
  pattern: 'const $NAME = await getPayload($CONFIG)'
```

### kind
Matches AST node type exactly. Use `--debug-query` to discover kinds.

```yaml
rule:
  kind: arrow_function
```

Common TypeScript/TSX kinds:
- `function_declaration`, `arrow_function`, `call_expression`
- `jsx_element`, `jsx_self_closing_element`, `jsx_attribute`
- `import_statement`, `export_statement`
- `type_alias_declaration`, `interface_declaration`
- `string`, `template_string`, `number`

### regex
Matches the text content of a node against a regex.

```yaml
rule:
  regex: '^(get|fetch|load)'
  kind: identifier
```

### nthChild
Matches nodes by position among siblings.

```yaml
rule:
  nthChild: 1          # first child (1-indexed)
# Also supports:
#   nthChild: { position: 2, ofRule: { kind: jsx_attribute } }
```

---

## Relational Rules

### inside
Node must be inside (descendant of) a matching ancestor.

```yaml
rule:
  pattern: 'console.log($ARG)'
  inside:
    kind: function_declaration
    has:
      kind: export_statement
```

### has
Node must contain a matching descendant.

```yaml
rule:
  kind: jsx_element
  has:
    pattern: '<Image $$$ATTRS />'
```

### precedes
Node must appear before a sibling matching the rule.

```yaml
rule:
  pattern: 'const $A = $B'
  precedes:
    pattern: 'export default $A'
```

### follows
Node must appear after a sibling matching the rule.

```yaml
rule:
  pattern: 'return $JSX'
  follows:
    pattern: 'const $DATA = await $FETCH'
```

### stopBy
Controls how far `inside`/`has` searches. Default is `end` (searches entire subtree).

```yaml
rule:
  pattern: '$VAR'
  inside:
    kind: arrow_function
    stopBy: neighbor    # only direct parent
# stopBy values: neighbor | end | { rule }
```

### field
Matches a specific named field of a parent node.

```yaml
rule:
  kind: identifier
  field: name
  inside:
    kind: function_declaration
```

---

## Composite Rules

### all
All sub-rules must match (AND).

```yaml
rule:
  all:
    - kind: call_expression
    - has:
        pattern: 'fetch($URL)'
    - inside:
        kind: function_declaration
```

### any
At least one sub-rule must match (OR).

```yaml
rule:
  any:
    - pattern: 'console.log($$$ARGS)'
    - pattern: 'console.warn($$$ARGS)'
    - pattern: 'console.error($$$ARGS)'
```

### not
Negates a rule.

```yaml
rule:
  pattern: 'import $$$IMPORTS from "$MOD"'
  not:
    regex: '^@/'
    # This applies to the matched node text — filter imports NOT using @/ alias
```

### matches
References a named utility rule (defined in `utils:` section of config).

```yaml
utils:
  is-server-component:
    kind: program
    not:
      has:
        pattern: '"use client"'

rule:
  pattern: 'async function $NAME($$$P) { $$$BODY }'
  inside:
    matches: is-server-component
```

---

## Metavariables

| Syntax | Matches | Example |
|---|---|---|
| `$VAR` | Exactly one AST node | `const $NAME = $VALUE` |
| `$$VAR` | Zero or one AST node | `function $FN($$PARAM)` |
| `$$$VAR` | Zero or more AST nodes | `console.log($$$ARGS)` |
| `$_` | One node, non-capturing | `import $_ from "$MOD"` |

Metavariables with the same name must match the same text:

```yaml
# Finds: const x = x (self-assignment)
rule:
  pattern: 'const $X = $X'
```

---

## Common TypeScript/React Patterns

### Find all Payload collection configs
```yaml
rule:
  pattern: |
    export const $NAME: CollectionConfig = {
      $$$FIELDS
    }
```

### Find server components that fetch data
```yaml
rule:
  kind: export_statement
  has:
    all:
      - kind: function_declaration
      - has:
          pattern: 'await $$$CALL'
  inside:
    kind: program
    not:
      has:
        pattern: '"use client"'
```

### Find components missing displayName
```yaml
rule:
  kind: variable_declarator
  has:
    kind: arrow_function
    has:
      kind: jsx_element
  not:
    follows:
      pattern: '$COMP.displayName = $NAME'
```

### Find untyped function parameters
```yaml
rule:
  kind: required_parameter
  not:
    has:
      kind: type_annotation
  inside:
    any:
      - kind: function_declaration
      - kind: arrow_function
```

### Find direct DOM event handlers (should use callback)
```yaml
rule:
  kind: jsx_attribute
  has:
    kind: property_identifier
    regex: '^on[A-Z]'
  has:
    kind: arrow_function
    has:
      kind: call_expression
```

### Find imports that should use @/ alias
```yaml
rule:
  pattern: 'import $$$I from "$PATH"'
  regex: '\.\.\/'
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Pattern matches nothing | Use `--debug-query` to see the parsed AST |
| Too many matches | Add `inside` or `has` to narrow scope |
| Kind name unknown | Run `ast-grep run --pattern '$X' --debug-query file.ts` and read the node kinds |
| Multiline pattern fails | Use `$$$` for body captures, ensure indentation matches |
| JSX not matching | Use `--lang tsx` explicitly |
| Metavar mismatch | Same-name metavars must match identical text |
