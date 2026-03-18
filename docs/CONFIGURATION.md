# Configuration

Primary config lives in `.planning/config.json`.

## Common Keys

| Key | Default | Purpose |
|---|---|---|
| `model_profile` | `balanced` | Agent model tier |
| `commit_docs` | `true` | Commit planning docs to git |
| `search_gitignored` | `false` | Include ignored files in wide searches |
| `workflow.research` | `true` | Enable research before planning |
| `workflow.plan_check` | `true` | Verify plans before execution |
| `workflow.verifier` | `true` | Verify outcomes after execution |
| `workflow.nyquist_validation` | `true` | Create validation mapping during planning |
| `workflow._auto_chain_active` | `false` | Internal auto-chain flag |

## Git

| Key | Default |
|---|---|
| `git.branching_strategy` | `none` |
| `git.phase_branch_template` | `gsd/phase-{phase}-{slug}` |
| `git.milestone_branch_template` | `gsd/{milestone}-{slug}` |

## Planning

| Key | Default |
|---|---|
| `planning.commit_docs` | `true` |
| `planning.search_gitignored` | `false` |

## Notes

- UI-related config keys were removed from this edition.
- Settings are still edited through `/gsd:settings`.
