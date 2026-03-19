<overview>
GSD framework 的 Git 集成规范。
</overview>

<core_principle>

**提交结果，而不是过程。**

git log 应该像“已交付内容的变更日志”，而不是“规划活动的流水账”。
</core_principle>

<commit_points>

| 事件 | 提交？ | 原因 |
|------|--------|------|
| 创建 BRIEF + ROADMAP | YES | 项目初始化 |
| 创建 PLAN.md | NO | 中间产物，应与计划完成一起提交 |
| 创建 RESEARCH.md | NO | 中间产物 |
| 创建 DISCOVERY.md | NO | 中间产物 |
| **任务完成** | YES | 原子工作单元（每个 task 一个 commit） |
| **计划完成** | YES | 元数据提交（`SUMMARY` + `STATE` + `ROADMAP`） |
| 创建 handoff | YES | 保留 WIP 状态 |

</commit_points>

<git_check>

```bash
[ -d .git ] && echo "GIT_EXISTS" || echo "NO_GIT"
```

如果结果是 `NO_GIT`：静默执行 `git init`。GSD 项目总是拥有自己的仓库。
</git_check>

<commit_formats>

<format name="initialization">
## 项目初始化（brief + roadmap 一起提交）

```
docs: initialize [project-name] ([N] phases)

[One-liner from PROJECT.md]

Phases:
1. [phase-name]: [goal]
2. [phase-name]: [goal]
3. [phase-name]: [goal]
```

提交内容：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs: initialize [project-name] ([N] phases)" --files .planning/
```

</format>

<format name="task-completion">
## 任务完成（计划执行过程中）

每个 task 完成后都要立刻单独提交。

```
{type}({phase}-{plan}): {task-name}

- [Key change 1]
- [Key change 2]
- [Key change 3]
```

**提交类型：**
- `feat` - 新功能 / 新行为
- `fix` - 修复 bug
- `test` - 仅测试（TDD RED 阶段）
- `refactor` - 代码整理（TDD REFACTOR 阶段）
- `perf` - 性能优化
- `chore` - 依赖、配置、工具链

**示例：**

```bash
# 标准任务
git add src/api/auth.ts src/types/user.ts
git commit -m "feat(08-02): create user registration endpoint

- POST /auth/register validates email and password
- Checks for duplicate users
- Returns JWT token on success
"

# TDD 任务 - RED 阶段
git add src/__tests__/jwt.test.ts
git commit -m "test(07-02): add failing test for JWT generation

- Tests token contains user ID claim
- Tests token expires in 1 hour
- Tests signature verification
"

# TDD 任务 - GREEN 阶段
git add src/utils/jwt.ts
git commit -m "feat(07-02): implement JWT generation

- Uses jose library for signing
- Includes user ID and expiry claims
- Signs with HS256 algorithm
"
```

</format>

<format name="plan-completion">
## 计划完成（所有任务都完成之后）

所有任务各自提交后，再补一个元数据提交，记录计划完成。

```
docs({phase}-{plan}): complete [plan-name] plan

Tasks completed: [N]/[N]
- [Task 1 name]
- [Task 2 name]
- [Task 3 name]

SUMMARY: .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md
```

提交内容：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "docs({phase}-{plan}): complete [plan-name] plan" --files .planning/phases/XX-name/{phase}-{plan}-PLAN.md .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md .planning/STATE.md .planning/ROADMAP.md
```

**注意：** 不包含代码文件，这些文件已经在 task 级提交中提交过。

</format>

<format name="handoff">
## Handoff（WIP）

```
wip: [phase-name] paused at task [X]/[Y]

Current: [task name]
[If blocked:] Blocked: [reason]
```

提交内容：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "wip: [phase-name] paused at task [X]/[Y]" --files .planning/
```

</format>
</commit_formats>

<example_log>

**旧方式（按 plan 提交）：**
```
a7f2d1 feat(checkout): Stripe payments with webhook verification
3e9c4b feat(products): catalog with search, filters, and pagination
8a1b2c feat(auth): JWT with refresh rotation using jose
5c3d7e feat(foundation): Next.js 15 + Prisma + Tailwind scaffold
2f4a8d docs: initialize ecommerce-app (5 phases)
```

**新方式（按 task 提交）：**
```
# Phase 04 - Checkout
1a2b3c docs(04-01): complete checkout flow plan
4d5e6f feat(04-01): add webhook signature verification
7g8h9i feat(04-01): implement payment session creation
0j1k2l feat(04-01): create checkout page component

# Phase 03 - Products
3m4n5o docs(03-02): complete product listing plan
6p7q8r feat(03-02): add pagination controls
9s0t1u feat(03-02): implement search and filters
2v3w4x feat(03-01): create product catalog schema

# Phase 02 - Auth
5y6z7a docs(02-02): complete token refresh plan
8b9c0d feat(02-02): implement refresh token rotation
1e2f3g test(02-02): add failing test for token refresh
4h5i6j docs(02-01): complete JWT setup plan
7k8l9m feat(02-01): add JWT generation and validation
0n1o2p chore(02-01): install jose library

# Phase 01 - Foundation
3q4r5s docs(01-01): complete scaffold plan
6t7u8v feat(01-01): configure Tailwind and globals
9w0x1y feat(01-01): set up Prisma with database
2z3a4b feat(01-01): create Next.js 15 project

# Initialization
5c6d7e docs: initialize ecommerce-app (5 phases)
```

每个计划会产生 2-4 个提交（tasks + metadata），足够清晰、足够细粒度，也便于 bisect。

</example_log>

<anti_patterns>

**仍然不要提交的内容（中间产物）：**
- PLAN.md 刚创建时（应与 plan 完成一起提交）
- RESEARCH.md（中间产物）
- DISCOVERY.md（中间产物）
- 微小的规划改动
- “修了 roadmap 里的错别字”

**应该提交的内容（结果）：**
- 每个 task 完成（`feat` / `fix` / `test` / `refactor`）
- 计划完成元数据（`docs`）
- 项目初始化（`docs`）

**核心原则：** 提交可运行的结果与已交付成果，而不是规划过程本身。

</anti_patterns>

<commit_strategy_rationale>

## 为什么采用按任务提交？

**为了 AI 的上下文工程：**
- Git 历史会成为后续 Claude session 的主要上下文来源
- `git log --grep="{phase}-{plan}"` 能直接看到某个 plan 的全部工作
- `git diff <hash>^..<hash>` 能看到某个 task 的精确变更
- 对 `SUMMARY.md` 的依赖更少，把更多上下文留给实际工作

**为了失败恢复：**
- Task 1 已提交 ✅，Task 2 失败 ❌
- 下一次 session 中，Claude 能看出 task 1 已完成，并从 task 2 继续
- 可以 `git reset --hard` 回到上一个成功 task

**为了调试：**
- `git bisect` 能直接定位到具体失败 task，而不是整个 plan
- `git blame` 能把某一行追溯到具体 task 背景
- 每个 commit 都可以独立回退

**为了可观测性：**
- 单人开发 + Claude 的工作流本来就适合细粒度归因
- 原子提交本身就是 Git 最佳实践
- 对主要消费者是 Claude 而不是人类时，“提交噪音”不是问题

</commit_strategy_rationale>
