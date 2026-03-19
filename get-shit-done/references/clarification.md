# Requirement Clarification Guide

Adapted from `skills/brainstorming/SKILL.md` and `references/questioning.md` — clarification phase only.

Help resolve ambiguous or vague requirements before planning begins. This is NOT a full brainstorming session — only the clarification step.

## Goal

Clarification exists to make the downstream planner's job executable. By the end, you need enough clarity that:

- **plan-phase** can decompose into concrete tasks without guessing
- **execute-phase** has clear success criteria to verify against
- Resolved specifics are captured so they are never re-questioned

A vague handoff forces every downstream phase to assume. The cost compounds.

## When to Use

Invoke this before decomposing requirements into tasks. If all requirements are already specific and unambiguous, skip this step.

## Philosophy

**You are a thinking partner, not an interviewer.**

The user often has a fuzzy idea. Your job is to help them sharpen it. Ask questions that make them think "oh, I hadn't considered that" or "yes, that's exactly what I mean."

Don't interrogate. Collaborate. Don't follow a script. Follow the thread.

## Anti-Pattern: "This Is Too Simple To Need Clarification"

"Simple" projects are where unexamined assumptions cause the most wasted work. Even for a small phase, vague requirements force the planner to guess. The clarification can be brief — a few questions — but you MUST surface ambiguities before planning begins.

## Anti-Patterns to Avoid

- **Checklist walking** — Going through domains regardless of what they said
- **Canned questions** — "What's your core value?" "What's out of scope?" regardless of context
- **Shallow acceptance** — Taking vague answers without probing ("good" means what? "simple" means how?)
- **Interrogation** — Firing questions without building on answers
- **Rushing** — Minimizing questions to get to "the work"
- **Premature constraints** — Asking about tech stack before understanding the idea
- **User skills** — Never ask about the user's technical experience

## Core Principles

- **One question at a time** — don't overwhelm
- **Multiple choice preferred** — easier for users to answer than open-ended
- **Interpret, don't just ask** — "what do you want?" is weak; infer what they likely mean and confirm
- **YAGNI** — ruthlessly remove unnecessary features
- **Follow energy** — dig into what the user emphasized
- **Propose approaches, not just questions** — when 2-3 valid options exist, present them with trade-offs and your recommendation

## Question Types

Use these as inspiration, not a checklist:

**Motivation — why this exists:**
- "What prompted this?"
- "What are you doing today that this replaces?"
- "What would you do if this existed?"

**Concreteness — what it actually is:**
- "Walk me through using this"
- "You said X — what does that actually look like?"
- "Give me an example"

**Clarification — what they mean:**
- "When you say Z, do you mean A or B?"
- "You mentioned X — tell me more about that"

**Success — how you'll know it's working:**
- "How will you know this is working?"
- "What does done look like?"

**Scope — boundaries:**
- "What's in scope vs out of scope?"
- "What should this NOT do?"

## Using AskUserQuestion

Use `AskUserQuestion` to help users think by presenting concrete options.

**Good options:**
- Interpretations of what they might mean
- Specific examples to confirm or deny
- Concrete choices that reveal priorities

**Bad options:**
- Generic categories ("Technical", "Business", "Other")
- Leading options that presume an answer
- Headers longer than 12 characters

**Example — vague answer:**
User says "it should be fast"

- header: "Fast"
- question: "Fast how?"
- options: ["Sub-second response", "Handles large datasets", "Quick to build", "Let me explain"]

**Example — following a thread:**
User mentions "frustrated with current tools"

- header: "Frustration"
- question: "What specifically frustrates you?"
- options: ["Too many clicks", "Missing features", "Unreliable", "Let me explain"]

## Freeform Rule

If the user wants to explain freely, **stop using AskUserQuestion**:

1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response

## Output: CLARIFICATION.md

After clarification, write `{phase}-CLARIFICATION.md` capturing:

```markdown
# Phase N Clarification

## Resolved Specifics
- [specific 1]
- [specific 2]

## Approach Chosen
- [chosen approach with rationale]

## Open Questions / Future Decisions
- [items intentionally left open]
```

This doc becomes **mandatory input** to the planner — all resolved specifics must not be re-questioned.

## Clarification Checklist

Use this as a background mental check. If gaps remain after questioning, weave in natural follow-ups:

- [ ] What they're building (concrete enough to explain to a stranger)
- [ ] Why it needs to exist (the problem or desire driving it)
- [ ] Who it's for (even if just themselves)
- [ ] What "done" looks like (observable outcomes)
- [ ] Which approaches are viable (and trade-offs between them)

Four things. If they volunteer more, capture it.

## Decision Gate

When you have enough to write a clear CLARIFICATION.md that the planner can act on, offer to proceed:

- header: "Ready?"
- question: "I think I understand what you're after. Ready to move to planning?"
- options:
  - "Start planning" — Let's move forward
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring" — ask what they want to add, or identify gaps and probe naturally.

Loop until "Start planning" selected.
