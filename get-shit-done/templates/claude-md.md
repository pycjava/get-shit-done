# CLAUDE.md Template

Template for project-level `CLAUDE.md` content in the operations edition.

## Managed Sections

### Project

```markdown
<!-- GSD:project-start source:PROJECT.md -->
## Project

{{project_content}}
<!-- GSD:project-end -->
```

### Stack

```markdown
<!-- GSD:stack-start source:STACK.md -->
## Stack

{{stack_content}}
<!-- GSD:stack-end -->
```

### Conventions

```markdown
<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

{{conventions_content}}
<!-- GSD:conventions-end -->
```

### Architecture

```markdown
<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

{{architecture_content}}
<!-- GSD:architecture-end -->
```

## Scope

Use `CLAUDE.md` for stable repository instructions such as:

- service boundaries
- deployment and rollback constraints
- operational conventions
- documentation rules

Developer profiling sections are not part of this edition.
