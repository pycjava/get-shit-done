<purpose>
Quality gate for every atomic commit. A commit is not atomic if it cannot be independently verified as working. Run these checks BEFORE staging and committing.
</purpose>

<pyramid>
## The Verification Pyramid (Commit Gate)

Every artifact touched in this task must pass all applicable levels before commit.

| Level | Question | How to Check |
|-------|----------|--------------|
| **1 — Exists** | Is the file present at the expected path? | `[ -f path ]` |
| **2 — Substantive** | Is the content real implementation, not stub/placeholder? | grep for TODO/FIXME/placeholder/`return null`/`return {}` |
| **3 — Wired** | Is it connected to the rest of the system? | Check imports, callers, route registration, env usage |
| **4 — Functional** | Does it actually work when invoked? | Run the verification command defined in DEFINE step |

**Levels 1-3: automated.** Run before committing.
**Level 4: required by VERIFY step** (from tdd-discipline.md). Do not repeat here — but if Level 4 has not been run yet, do not commit.

</pyramid>

<gates>
## Commit Gate Checklist

Run before every `git commit`. Not a suggestion — a gate.

### Gate 1: Exists
```bash
# For each file listed in the task's output
[ -f "path/to/file" ] && echo "OK" || echo "MISSING — do not commit"
```

### Gate 2: Substantive (no stubs)
```bash
# Universal stub detector — run on each modified file
grep -nE "TODO|FIXME|XXX|HACK|placeholder|not implemented|coming soon" "$file"
grep -nE "return null$|return \{\}$|return \[\]$|pass$|\.\.\.$" "$file"
```
If any match found: fix before committing.

### Gate 3: Wired
Varies by artifact type. Use judgment — the goal is to confirm the artifact is reachable:

```bash
# Function/module is imported somewhere
grep -r "import.*$(basename $file .ts)" src/

# API route is registered
grep -r "$(basename $(dirname $file))" src/app/ src/routes/

# Config variable is consumed
grep -r "process.env.$VAR_NAME" src/
```
If unreachable: either wire it or document it as intentionally deferred.

### Gate 4: Functional (already done)
Confirmed by VERIFY step in tdd-discipline.md. If VERIFY was skipped, do NOT proceed to commit.

</gates>

<pre_commit_declaration>
## What to Write in Commit Body

Every commit body must answer:
1. **What changed** — file-level list (already required by task_commit protocol)
2. **Why it's correct** — one line referencing the verification command run
3. **Pyramid status** — only for non-trivial commits:

```
feat(03-02): implement user registration endpoint

- POST /api/auth/register with email/password validation
- Hashes password via bcrypt, creates User record
- Returns JWT on success, 400 on validation failure

Verified: npm test -- auth.test.ts (8 passed)
Pyramid: Exists ✓ / Substantive ✓ / Wired ✓ / Functional ✓
```

For simple commits (config, docs, refactor with no logic change), pyramid line is optional.
</pre_commit_declaration>

<halt_conditions>
## Do NOT Commit If

- Any Gate 1-3 check fails and you haven't fixed it
- VERIFY step (Gate 4) has not been run
- You're committing "just to save progress" with known failures — that's not atomic, that's a checkpoint hack
- The commit message is aspirational ("add user auth") without reflecting what actually exists

**If you cannot pass the gate:** treat it as a VERIFY failure (tdd-discipline.md) and debug before committing.
</halt_conditions>

<integration>
## Relationship to Other Disciplines

- **tdd-discipline.md SELF-CHECK:** runs after VERIFY, before commit — the pyramid Gates 1-3 ARE the structured form of that self-check
- **systematic-debugging.md:** if a gate fails and you don't know why, use Phase 1-3 before attempting fixes
- **verification-patterns.md:** detailed patterns for Level 2-3 checks by artifact type (React components, API routes, schemas, hooks)
</integration>
