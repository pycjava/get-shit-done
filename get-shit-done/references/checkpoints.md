<overview>
计划会自主执行。checkpoint 用来明确那些必须由人类验证或决策的交互点。

**核心原则：** Claude 会用 CLI / API 自动化一切可自动化的事。checkpoint 只用于验证与决策，不用于把手工活丢给用户。

**黄金规则：**
1. **Claude 能执行的，就必须由 Claude 执行** - 不要让用户运行 CLI 命令、启动 server、或执行 build
2. **验证环境由 Claude 负责搭建** - 启动 dev server、seed 数据库、配置 env vars
3. **用户只做必须依赖人工判断的事** - 视觉检查、UX 评估、“这感觉对不对？”
4. **Secrets 来自用户，自动化来自 Claude** - 先向用户获取 API key，再由 Claude 用 CLI 完成配置
5. **自动模式会跳过验证 / 决策类 checkpoint** — 当配置中的 `workflow._auto_chain_active` 或 `workflow.auto_advance` 为 true 时：`human-verify` 自动通过，`decision` 自动选第一个选项，`human-action` 仍必须停下（认证闸门不能自动化）
</overview>

<checkpoint_types>

<type name="human-verify">
## checkpoint:human-verify（最常见，约 90%）

**何时使用：** Claude 已完成自动化工作，由人类确认结果是否正确。

**适用场景：**
- 视觉 UI 检查（布局、样式、响应式）
- 交互流程检查（点完整个 wizard、测试用户流）
- 功能验证（特性是否按预期工作）
- 音视频播放质量
- 动画流畅度
- 无障碍测试

**结构：**
```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[What Claude automated and deployed/built]</what-built>
  <how-to-verify>
    [Exact steps to test - URLs, commands, expected behavior]
  </how-to-verify>
  <resume-signal>[How to continue - "approved", "yes", or describe issues]</resume-signal>
</task>
```

**示例：UI 组件（关键模式：Claude 会在 checkpoint 前先启动 server）**
```xml
<task type="auto">
  <name>Build responsive dashboard layout</name>
  <files>src/components/Dashboard.tsx, src/app/dashboard/page.tsx</files>
  <action>Create dashboard with sidebar, header, and content area. Use Tailwind responsive classes for mobile.</action>
  <verify>npm run build succeeds, no TypeScript errors</verify>
  <done>Dashboard component builds without errors</done>
</task>

<task type="auto">
  <name>Start dev server for verification</name>
  <action>Run `npm run dev` in background, wait for "ready" message, capture port</action>
  <verify>curl http://localhost:3000 returns 200</verify>
  <done>Dev server running at http://localhost:3000</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Responsive dashboard layout - dev server running at http://localhost:3000</what-built>
  <how-to-verify>
    Visit http://localhost:3000/dashboard and verify:
    1. Desktop (>1024px): Sidebar left, content right, header top
    2. Tablet (768px): Sidebar collapses to hamburger menu
    3. Mobile (375px): Single column layout, bottom nav appears
    4. No layout shift or horizontal scroll at any size
  </how-to-verify>
  <resume-signal>Type "approved" or describe layout issues</resume-signal>
</task>
```

**示例：Xcode 构建**
```xml
<task type="auto">
  <name>Build macOS app with Xcode</name>
  <files>App.xcodeproj, Sources/</files>
  <action>Run `xcodebuild -project App.xcodeproj -scheme App build`. Check for compilation errors in output.</action>
  <verify>Build output contains "BUILD SUCCEEDED", no errors</verify>
  <done>App builds successfully</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Built macOS app at DerivedData/Build/Products/Debug/App.app</what-built>
  <how-to-verify>
    Open App.app and test:
    - App launches without crashes
    - Menu bar icon appears
    - Preferences window opens correctly
    - No visual glitches or layout issues
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>
```
</type>

<type name="decision">
## checkpoint:decision（约 9%）

**何时使用：** 人类必须做出会影响实现方向的选择。

**适用场景：**
- 技术选型（用哪个 auth provider、哪个数据库）
- 架构决策（monorepo 还是拆仓）
- 设计选择（配色、布局方式）
- 功能优先级排序（先做哪个版本）
- 数据模型决策（schema 结构）

**结构：**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>[What's being decided]</decision>
  <context>[Why this decision matters]</context>
  <options>
    <option id="option-a">
      <name>[Option name]</name>
      <pros>[Benefits]</pros>
      <cons>[Tradeoffs]</cons>
    </option>
    <option id="option-b">
      <name>[Option name]</name>
      <pros>[Benefits]</pros>
      <cons>[Tradeoffs]</cons>
    </option>
  </options>
  <resume-signal>[How to indicate choice]</resume-signal>
</task>
```

**示例：Auth Provider 选择**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>Select authentication provider</decision>
  <context>
    Need user authentication for the app. Three solid options with different tradeoffs.
  </context>
  <options>
    <option id="supabase">
      <name>Supabase Auth</name>
      <pros>Built-in with Supabase DB we're using, generous free tier, row-level security integration</pros>
      <cons>Less customizable UI, tied to Supabase ecosystem</cons>
    </option>
    <option id="clerk">
      <name>Clerk</name>
      <pros>Beautiful pre-built UI, best developer experience, excellent docs</pros>
      <cons>Paid after 10k MAU, vendor lock-in</cons>
    </option>
    <option id="nextauth">
      <name>NextAuth.js</name>
      <pros>Free, self-hosted, maximum control, widely adopted</pros>
      <cons>More setup work, you manage security updates, UI is DIY</cons>
    </option>
  </options>
  <resume-signal>Select: supabase, clerk, or nextauth</resume-signal>
</task>
```

**示例：数据库选择**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>Select database for user data</decision>
  <context>
    App needs persistent storage for users, sessions, and user-generated content.
    Expected scale: 10k users, 1M records first year.
  </context>
  <options>
    <option id="supabase">
      <name>Supabase (Postgres)</name>
      <pros>Full SQL, generous free tier, built-in auth, real-time subscriptions</pros>
      <cons>Vendor lock-in for real-time features, less flexible than raw Postgres</cons>
    </option>
    <option id="planetscale">
      <name>PlanetScale (MySQL)</name>
      <pros>Serverless scaling, branching workflow, excellent DX</pros>
      <cons>MySQL not Postgres, no foreign keys in free tier</cons>
    </option>
    <option id="convex">
      <name>Convex</name>
      <pros>Real-time by default, TypeScript-native, automatic caching</pros>
      <cons>Newer platform, different mental model, less SQL flexibility</cons>
    </option>
  </options>
  <resume-signal>Select: supabase, planetscale, or convex</resume-signal>
</task>
```
</type>

<type name="human-action">
## checkpoint:human-action（约 1%，较少见）

**何时使用：** 某个动作没有 CLI / API，只能由人类完成；或者 Claude 在自动化过程中撞上了认证闸门。

**只用于以下情况：**
- **认证闸门** - Claude 已尝试 CLI / API，但还需要凭证（这**不是**失败）
- 邮件验证链接（点邮件）
- SMS 2FA 验证码（手机验证）
- 手动账号审批（平台要求人工审核）
- 信用卡 3D Secure 流程（网页支付授权）
- OAuth app 审批（网页端确认）

**不要用于预先规划好的手工工作：**
- 部署（应走 CLI；需要时再触发 auth gate）
- 创建 webhook / 数据库（应走 API / CLI；需要时再触发 auth gate）
- 运行 build / test（应使用 Bash 工具）
- 创建文件（应使用 Write 工具）

**结构：**
```xml
<task type="checkpoint:human-action" gate="blocking">
  <action>[What human must do - Claude already did everything automatable]</action>
  <instructions>
    [What Claude already automated]
    [The ONE thing requiring human action]
  </instructions>
  <verification>[What Claude can check afterward]</verification>
  <resume-signal>[How to continue]</resume-signal>
</task>
```

**示例：邮件验证**
```xml
<task type="auto">
  <name>Create SendGrid account via API</name>
  <action>Use SendGrid API to create subuser account with provided email. Request verification email.</action>
  <verify>API returns 201, account created</verify>
  <done>Account created, verification email sent</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <action>Complete email verification for SendGrid account</action>
  <instructions>
    I created the account and requested verification email.
    Check your inbox for SendGrid verification link and click it.
  </instructions>
  <verification>SendGrid API key works: curl test succeeds</verification>
  <resume-signal>Type "done" when email verified</resume-signal>
</task>
```

**示例：认证闸门（动态 checkpoint）**
```xml
<task type="auto">
  <name>Deploy to Vercel</name>
  <files>.vercel/, vercel.json</files>
  <action>Run `vercel --yes` to deploy</action>
  <verify>vercel ls shows deployment, curl returns 200</verify>
</task>

<!-- If vercel returns "Error: Not authenticated", Claude creates checkpoint on the fly -->

<task type="checkpoint:human-action" gate="blocking">
  <action>Authenticate Vercel CLI so I can continue deployment</action>
  <instructions>
    I tried to deploy but got authentication error.
    Run: vercel login
    This will open your browser - complete the authentication flow.
  </instructions>
  <verification>vercel whoami returns your account email</verification>
  <resume-signal>Type "done" when authenticated</resume-signal>
</task>

<!-- After authentication, Claude retries the deployment -->

<task type="auto">
  <name>Retry Vercel deployment</name>
  <action>Run `vercel --yes` (now authenticated)</action>
  <verify>vercel ls shows deployment, curl returns 200</verify>
</task>
```

**关键区别：** auth gate 是 Claude 遇到认证错误时动态创建的，而不是预先规划好的步骤。正确顺序是先自动化，只有被挡住时才向用户要凭证。
</type>
</checkpoint_types>

<execution_protocol>

当 Claude 遇到 `type="checkpoint:*"` 时：

1. **立刻停下** - 不要继续下一个任务
2. **清晰展示 checkpoint**，格式如下
3. **等待用户回应** - 不要臆测已完成
4. **能验证就先验证** - 查文件、跑测试，按要求执行
5. **恢复执行** - 只有确认后才能继续下一个任务

**针对 checkpoint:human-verify：**
```
╔═══════════════════════════════════════════════════════╗
║  检查点：需要验证                                     ║
╚═══════════════════════════════════════════════════════╝

进度：8 个任务中已完成 5 个
任务：响应式 dashboard 布局

已构建：`/dashboard` 上的响应式 dashboard

如何验证：
  1. 访问：http://localhost:3000/dashboard
  2. 桌面端（>1024px）：侧边栏可见，内容区填满剩余空间
  3. 平板端（768px）：侧边栏收起为图标
  4. 移动端（375px）：侧边栏隐藏，顶部出现汉堡菜单

────────────────────────────────────────────────────────
→ 你的操作：输入 "approved" 或直接描述问题
────────────────────────────────────────────────────────
```

**针对 checkpoint:decision：**
```
╔═══════════════════════════════════════════════════════╗
║  检查点：需要决策                                     ║
╚═══════════════════════════════════════════════════════╝

进度：6 个任务中已完成 2 个
任务：选择认证提供方

决策项：我们应该使用哪个 auth provider？

上下文：当前需要用户认证。下面有三种方案，取舍不同。

可选方案：
  1. supabase - Built-in with our DB, free tier
     Pros: Row-level security integration, generous free tier
     Cons: Less customizable UI, ecosystem lock-in

  2. clerk - Best DX, paid after 10k users
     Pros: Beautiful pre-built UI, excellent documentation
     Cons: Vendor lock-in, pricing at scale

  3. nextauth - Self-hosted, maximum control
     Pros: Free, no vendor lock-in, widely adopted
     Cons: More setup work, DIY security updates

────────────────────────────────────────────────────────
→ 你的操作：选择 supabase、clerk 或 nextauth
────────────────────────────────────────────────────────
```

**针对 checkpoint:human-action：**
```
╔═══════════════════════════════════════════════════════╗
║  检查点：需要人工动作                                 ║
╚═══════════════════════════════════════════════════════╝

进度：8 个任务中已完成 3 个
任务：部署到 Vercel

已尝试：`vercel --yes`
错误：`Not authenticated`。请运行 `vercel login`

你需要执行：
  1. 运行：`vercel login`
  2. 浏览器弹出后完成认证
  3. 完成后回到这里

我会验证：`vercel whoami` 能返回你的账号

────────────────────────────────────────────────────────
→ YOUR ACTION: Type "done" when authenticated
────────────────────────────────────────────────────────
```
</execution_protocol>

<authentication_gates>

**Auth gate = Claude tried CLI/API, got auth error.** Not a failure — a gate requiring human input to unblock.

**Pattern:** Claude tries automation → auth error → creates checkpoint:human-action → user authenticates → Claude retries → continues

**Gate protocol:**
1. Recognize it's not a failure - missing auth is expected
2. Stop current task - don't retry repeatedly
3. Create checkpoint:human-action dynamically
4. Provide exact authentication steps
5. Verify authentication works
6. Retry the original task
7. Continue normally

**Key distinction:**
- Pre-planned checkpoint: "I need you to do X" (wrong - Claude should automate)
- Auth gate: "I tried to automate X but need credentials" (correct - unblocks automation)

</authentication_gates>

<automation_reference>

**The rule:** If it has CLI/API, Claude does it. Never ask human to perform automatable work.

## Service CLI Reference

| Service | CLI/API | Key Commands | Auth Gate |
|---------|---------|--------------|-----------|
| Vercel | `vercel` | `--yes`, `env add`, `--prod`, `ls` | `vercel login` |
| Railway | `railway` | `init`, `up`, `variables set` | `railway login` |
| Fly | `fly` | `launch`, `deploy`, `secrets set` | `fly auth login` |
| Stripe | `stripe` + API | `listen`, `trigger`, API calls | API key in .env |
| Supabase | `supabase` | `init`, `link`, `db push`, `gen types` | `supabase login` |
| Upstash | `upstash` | `redis create`, `redis get` | `upstash auth login` |
| PlanetScale | `pscale` | `database create`, `branch create` | `pscale auth login` |
| GitHub | `gh` | `repo create`, `pr create`, `secret set` | `gh auth login` |
| Node | `npm`/`pnpm` | `install`, `run build`, `test`, `run dev` | N/A |
| Xcode | `xcodebuild` | `-project`, `-scheme`, `build`, `test` | N/A |
| Convex | `npx convex` | `dev`, `deploy`, `env set`, `env get` | `npx convex login` |

## Environment Variable Automation

**Env files:** Use Write/Edit tools. Never ask human to create .env manually.

**Dashboard env vars via CLI:**

| Platform | CLI Command | Example |
|----------|-------------|---------|
| Convex | `npx convex env set` | `npx convex env set OPENAI_API_KEY sk-...` |
| Vercel | `vercel env add` | `vercel env add STRIPE_KEY production` |
| Railway | `railway variables set` | `railway variables set API_KEY=value` |
| Fly | `fly secrets set` | `fly secrets set DATABASE_URL=...` |
| Supabase | `supabase secrets set` | `supabase secrets set MY_SECRET=value` |

**Secret collection pattern:**
```xml
<!-- WRONG: Asking user to add env vars in dashboard -->
<task type="checkpoint:human-action">
  <action>Add OPENAI_API_KEY to Convex dashboard</action>
  <instructions>Go to dashboard.convex.dev → Settings → Environment Variables → Add</instructions>
</task>

<!-- RIGHT: Claude asks for value, then adds via CLI -->
<task type="checkpoint:human-action">
  <action>Provide your OpenAI API key</action>
  <instructions>
    I need your OpenAI API key for Convex backend.
    Get it from: https://platform.openai.com/api-keys
    Paste the key (starts with sk-)
  </instructions>
  <verification>I'll add it via `npx convex env set` and verify</verification>
  <resume-signal>Paste your API key</resume-signal>
</task>

<task type="auto">
  <name>Configure OpenAI key in Convex</name>
  <action>Run `npx convex env set OPENAI_API_KEY {user-provided-key}`</action>
  <verify>`npx convex env get OPENAI_API_KEY` returns the key (masked)</verify>
</task>
```

## Dev Server Automation

| Framework | Start Command | Ready Signal | Default URL |
|-----------|---------------|--------------|-------------|
| Next.js | `npm run dev` | "Ready in" or "started server" | http://localhost:3000 |
| Vite | `npm run dev` | "ready in" | http://localhost:5173 |
| Convex | `npx convex dev` | "Convex functions ready" | N/A (backend only) |
| Express | `npm start` | "listening on port" | http://localhost:3000 |
| Django | `python manage.py runserver` | "Starting development server" | http://localhost:8000 |

**Server lifecycle:**
```bash
# Run in background, capture PID
npm run dev &
DEV_SERVER_PID=$!

# Wait for ready (max 30s)
timeout 30 bash -c 'until curl -s localhost:3000 > /dev/null 2>&1; do sleep 1; done'
```

**Port conflicts:** Kill stale process (`lsof -ti:3000 | xargs kill`) or use alternate port (`--port 3001`).

**Server stays running** through checkpoints. Only kill when plan complete, switching to production, or port needed for different service.

## CLI Installation Handling

| CLI | Auto-install? | Command |
|-----|---------------|---------|
| npm/pnpm/yarn | No - ask user | User chooses package manager |
| vercel | Yes | `npm i -g vercel` |
| gh (GitHub) | Yes | `brew install gh` (macOS) or `apt install gh` (Linux) |
| stripe | Yes | `npm i -g stripe` |
| supabase | Yes | `npm i -g supabase` |
| convex | No - use npx | `npx convex` (no install needed) |
| fly | Yes | `brew install flyctl` or curl installer |
| railway | Yes | `npm i -g @railway/cli` |

**Protocol:** Try command → "command not found" → auto-installable? → yes: install silently, retry → no: checkpoint asking user to install.

## Pre-Checkpoint Automation Failures

| Failure | Response |
|---------|----------|
| Server won't start | Check error, fix issue, retry (don't proceed to checkpoint) |
| Port in use | Kill stale process or use alternate port |
| Missing dependency | Run `npm install`, retry |
| Build error | Fix the error first (bug, not checkpoint issue) |
| Auth error | Create auth gate checkpoint |
| Network timeout | Retry with backoff, then checkpoint if persistent |

**Never present a checkpoint with broken verification environment.** If `curl localhost:3000` fails, don't ask user to "visit localhost:3000".

```xml
<!-- WRONG: Checkpoint with broken environment -->
<task type="checkpoint:human-verify">
  <what-built>Dashboard (server failed to start)</what-built>
  <how-to-verify>Visit http://localhost:3000...</how-to-verify>
</task>

<!-- RIGHT: Fix first, then checkpoint -->
<task type="auto">
  <name>Fix server startup issue</name>
  <action>Investigate error, fix root cause, restart server</action>
  <verify>curl http://localhost:3000 returns 200</verify>
</task>

<task type="checkpoint:human-verify">
  <what-built>Dashboard - server running at http://localhost:3000</what-built>
  <how-to-verify>Visit http://localhost:3000/dashboard...</how-to-verify>
</task>
```

## Automatable Quick Reference

| Action | Automatable? | Claude does it? |
|--------|--------------|-----------------|
| Deploy to Vercel | Yes (`vercel`) | YES |
| Create Stripe webhook | Yes (API) | YES |
| Write .env file | Yes (Write tool) | YES |
| Create Upstash DB | Yes (`upstash`) | YES |
| Run tests | Yes (`npm test`) | YES |
| Start dev server | Yes (`npm run dev`) | YES |
| Add env vars to Convex | Yes (`npx convex env set`) | YES |
| Add env vars to Vercel | Yes (`vercel env add`) | YES |
| Seed database | Yes (CLI/API) | YES |
| Click email verification link | No | NO |
| Enter credit card with 3DS | No | NO |
| Complete OAuth in browser | No | NO |
| Visually verify UI looks correct | No | NO |
| Test interactive user flows | No | NO |

</automation_reference>

<writing_guidelines>

**DO:**
- Automate everything with CLI/API before checkpoint
- Be specific: "Visit https://myapp.vercel.app" not "check deployment"
- Number verification steps
- State expected outcomes: "You should see X"
- Provide context: why this checkpoint exists

**DON'T:**
- Ask human to do work Claude can automate ❌
- Assume knowledge: "Configure the usual settings" ❌
- Skip steps: "Set up database" (too vague) ❌
- Mix multiple verifications in one checkpoint ❌

**Placement:**
- **After automation completes** - not before Claude does the work
- **After UI buildout** - before declaring phase complete
- **Before dependent work** - decisions before implementation
- **At integration points** - after configuring external services

**Bad placement:** Before automation ❌ | Too frequent ❌ | Too late (dependent tasks already needed the result) ❌
</writing_guidelines>

<examples>

### Example 1: Database Setup (No Checkpoint Needed)

```xml
<task type="auto">
  <name>Create Upstash Redis database</name>
  <files>.env</files>
  <action>
    1. Run `upstash redis create myapp-cache --region us-east-1`
    2. Capture connection URL from output
    3. Write to .env: UPSTASH_REDIS_URL={url}
    4. Verify connection with test command
  </action>
  <verify>
    - upstash redis list shows database
    - .env contains UPSTASH_REDIS_URL
    - Test connection succeeds
  </verify>
  <done>Redis database created and configured</done>
</task>

<!-- NO CHECKPOINT NEEDED - Claude automated everything and verified programmatically -->
```

### Example 2: Full Auth Flow (Single checkpoint at end)

```xml
<task type="auto">
  <name>Create user schema</name>
  <files>src/db/schema.ts</files>
  <action>Define User, Session, Account tables with Drizzle ORM</action>
  <verify>npm run db:generate succeeds</verify>
</task>

<task type="auto">
  <name>Create auth API routes</name>
  <files>src/app/api/auth/[...nextauth]/route.ts</files>
  <action>Set up NextAuth with GitHub provider, JWT strategy</action>
  <verify>TypeScript compiles, no errors</verify>
</task>

<task type="auto">
  <name>Create login UI</name>
  <files>src/app/login/page.tsx, src/components/LoginButton.tsx</files>
  <action>Create login page with GitHub OAuth button</action>
  <verify>npm run build succeeds</verify>
</task>

<task type="auto">
  <name>Start dev server for auth testing</name>
  <action>Run `npm run dev` in background, wait for ready signal</action>
  <verify>curl http://localhost:3000 returns 200</verify>
  <done>Dev server running at http://localhost:3000</done>
</task>

<!-- ONE checkpoint at end verifies the complete flow -->
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete authentication flow - dev server running at http://localhost:3000</what-built>
  <how-to-verify>
    1. Visit: http://localhost:3000/login
    2. Click "Sign in with GitHub"
    3. Complete GitHub OAuth flow
    4. Verify: Redirected to /dashboard, user name displayed
    5. Refresh page: Session persists
    6. Click logout: Session cleared
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>
```
</examples>

<anti_patterns>

### ❌ BAD: Asking user to start dev server

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Dashboard component</what-built>
  <how-to-verify>
    1. Run: npm run dev
    2. Visit: http://localhost:3000/dashboard
    3. Check layout is correct
  </how-to-verify>
</task>
```

**Why bad:** Claude can run `npm run dev`. User should only visit URLs, not execute commands.

### ✅ GOOD: Claude starts server, user visits

```xml
<task type="auto">
  <name>Start dev server</name>
  <action>Run `npm run dev` in background</action>
  <verify>curl localhost:3000 returns 200</verify>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Dashboard at http://localhost:3000/dashboard (server running)</what-built>
  <how-to-verify>
    Visit http://localhost:3000/dashboard and verify:
    1. Layout matches design
    2. No console errors
  </how-to-verify>
</task>
```

### ❌ BAD: Asking human to deploy / ✅ GOOD: Claude automates

```xml
<!-- BAD: Asking user to deploy via dashboard -->
<task type="checkpoint:human-action" gate="blocking">
  <action>Deploy to Vercel</action>
  <instructions>Visit vercel.com/new → Import repo → Click Deploy → Copy URL</instructions>
</task>

<!-- GOOD: Claude deploys, user verifies -->
<task type="auto">
  <name>Deploy to Vercel</name>
  <action>Run `vercel --yes`. Capture URL.</action>
  <verify>vercel ls shows deployment, curl returns 200</verify>
</task>

<task type="checkpoint:human-verify">
  <what-built>Deployed to {url}</what-built>
  <how-to-verify>Visit {url}, check homepage loads</how-to-verify>
  <resume-signal>Type "approved"</resume-signal>
</task>
```

### ❌ BAD: Too many checkpoints / ✅ GOOD: Single checkpoint

```xml
<!-- BAD: Checkpoint after every task -->
<task type="auto">Create schema</task>
<task type="checkpoint:human-verify">Check schema</task>
<task type="auto">Create API route</task>
<task type="checkpoint:human-verify">Check API</task>
<task type="auto">Create UI form</task>
<task type="checkpoint:human-verify">Check form</task>

<!-- GOOD: One checkpoint at end -->
<task type="auto">Create schema</task>
<task type="auto">Create API route</task>
<task type="auto">Create UI form</task>

<task type="checkpoint:human-verify">
  <what-built>Complete auth flow (schema + API + UI)</what-built>
  <how-to-verify>Test full flow: register, login, access protected page</how-to-verify>
  <resume-signal>Type "approved"</resume-signal>
</task>
```

### ❌ BAD: Vague verification / ✅ GOOD: Specific steps

```xml
<!-- BAD -->
<task type="checkpoint:human-verify">
  <what-built>Dashboard</what-built>
  <how-to-verify>Check it works</how-to-verify>
</task>

<!-- GOOD -->
<task type="checkpoint:human-verify">
  <what-built>Responsive dashboard - server running at http://localhost:3000</what-built>
  <how-to-verify>
    Visit http://localhost:3000/dashboard and verify:
    1. Desktop (>1024px): Sidebar visible, content area fills remaining space
    2. Tablet (768px): Sidebar collapses to icons
    3. Mobile (375px): Sidebar hidden, hamburger menu in header
    4. No horizontal scroll at any size
  </how-to-verify>
  <resume-signal>Type "approved" or describe layout issues</resume-signal>
</task>
```

### ❌ BAD: Asking user to run CLI commands

```xml
<task type="checkpoint:human-action">
  <action>Run database migrations</action>
  <instructions>Run: npx prisma migrate deploy && npx prisma db seed</instructions>
</task>
```

**Why bad:** Claude can run these commands. User should never execute CLI commands.

### ❌ BAD: Asking user to copy values between services

```xml
<task type="checkpoint:human-action">
  <action>Configure webhook URL in Stripe</action>
  <instructions>Copy deployment URL → Stripe Dashboard → Webhooks → Add endpoint → Copy secret → Add to .env</instructions>
</task>
```

**Why bad:** Stripe has an API. Claude should create the webhook via API and write to .env directly.

</anti_patterns>

<summary>

Checkpoints formalize human-in-the-loop points for verification and decisions, not manual work.

**The golden rule:** If Claude CAN automate it, Claude MUST automate it.

**Checkpoint priority:**
1. **checkpoint:human-verify** (90%) - Claude automated everything, human confirms visual/functional correctness
2. **checkpoint:decision** (9%) - Human makes architectural/technology choices
3. **checkpoint:human-action** (1%) - Truly unavoidable manual steps with no API/CLI

**When NOT to use checkpoints:**
- Things Claude can verify programmatically (tests, builds)
- File operations (Claude can read files)
- Code correctness (tests and static analysis)
- Anything automatable via CLI/API
</summary>

<checkpoint_artifact>

## Checkpoint Artifact（检查点产物）

每个检查点在暂停时生成一个结构化产物，包含：进度快照、质量报告、验证结果、回滚元数据。

**存储位置：** `.planning/phases/{phase-dir}/CHECKPOINT-{plan}.json`

**文件结构：**

```json
{
  "id": "cp-{phase}-{plan}-{timestamp}",
  "phase": "08",
  "plan": "02",
  "type": "human-verify|decision|human-action",
  "created_at": "2024-01-15T10:30:00Z",
  "status": "pending|approved|rejected|rolled_back",
  
  "snapshot": {
    "completed_tasks": [
      {
        "task_num": 1,
        "name": "Create user schema",
        "commit": "a1b2c3d",
        "files_modified": ["prisma/schema.prisma", "src/types/user.ts"]
      }
    ],
    "total_tasks": 5,
    "progress": "1/5"
  },
  
  "quality_report": {
    "pyramid": {
      "exists": { "status": "passed", "details": "All 3 files present" },
      "substantive": { "status": "passed", "details": "No stub patterns detected" },
      "wired": { "status": "passed", "details": "All imports resolve" },
      "functional": { "status": "passed", "details": "npm test passed (8/8)" }
    },
    "test_coverage": { "lines": 85, "branches": 72, "functions": 90 },
    "lint": { "errors": 0, "warnings": 2 },
    "typecheck": { "errors": 0 },
    "security": { "vulnerabilities": 0, "warnings": 1 }
  },
  
  "verification_results": {
    "automated": [
      { "check": "npm run build", "status": "passed", "output_summary": "Build succeeded in 12s" },
      { "check": "npm test", "status": "passed", "output_summary": "8 tests passed" }
    ],
    "human_required": [
      { "item": "Visual layout check", "status": "pending" },
      { "item": "Responsive behavior", "status": "pending" }
    ],
    "failures": []
  },
  
  "rollback_metadata": {
    "anchor_commit": "a1b2c3d",
    "dependencies_locked": true,
    "env_snapshot": { "NODE_VERSION": "20.10.0", "PACKAGE_MANAGER": "pnpm@8.14.0" },
    "git_status_clean": true
  },
  
  "resolution": {
    "resolved_at": null,
    "resolved_by": null,
    "outcome": null,
    "notes": null
  }
}
```

</checkpoint_artifact>

<quality_report_structure>

## Quality Report Structure（质量报告结构）

质量报告基于验证金字塔（commit-quality-gate.md），在每个检查点自动生成。

### Pyramid Status（金字塔状态）

```json
{
  "pyramid": {
    "exists": {
      "status": "passed|failed|skipped",
      "details": "Human-readable summary",
      "checked_files": ["path/to/file1", "path/to/file2"]
    },
    "substantive": {
      "status": "passed|failed|skipped",
      "details": "Stub pattern scan results",
      "patterns_found": []
    },
    "wired": {
      "status": "passed|failed|skipped",
      "details": "Import and integration check",
      "unreachable": []
    },
    "functional": {
      "status": "passed|failed|skipped",
      "details": "Test/build results",
      "command": "npm test",
      "exit_code": 0
    }
  }
}
```

### Test Coverage（测试覆盖率）

```json
{
  "test_coverage": {
    "lines": 85,
    "branches": 72,
    "functions": 90,
    "statements": 88,
    "uncovered_files": ["src/utils/helper.ts"],
    "coverage_command": "npm run test:coverage"
  }
}
```

### Static Analysis（静态分析）

```json
{
  "lint": {
    "errors": 0,
    "warnings": 2,
    "details": [
      { "file": "src/api/auth.ts", "line": 42, "rule": "@typescript-eslint/no-explicit-any", "message": "Unexpected any" }
    ]
  },
  "typecheck": {
    "errors": 0,
    "details": []
  }
}
```

### Security Scan（安全扫描）

```json
{
  "security": {
    "vulnerabilities": 0,
    "warnings": 1,
    "details": [
      { "package": "lodash@4.17.20", "severity": "moderate", "cve": "CVE-2021-23337" }
    ]
  }
}
```

### Quality Gate Decision（质量门禁决策）

```json
{
  "quality_gate": {
    "overall": "passed|failed|warning",
    "blocking_issues": [],
    "warnings": ["lodash vulnerability in dev dependencies"],
    "recommendation": "Safe to proceed|Fix before proceeding|Review warnings"
  }
}
```

</quality_report_structure>

<verification_results_model>

## Verification Results Model（验证结果数据模型）

验证结果分为自动验证和人工验证两类。

### Automated Verification（自动验证）

```json
{
  "automated": [
    {
      "check": "npm run build",
      "status": "passed|failed|skipped",
      "exit_code": 0,
      "duration_ms": 12345,
      "output_summary": "Build succeeded in 12s",
      "output_file": ".planning/phases/08-auth/checkpoint-outputs/build.log"
    },
    {
      "check": "npm test",
      "status": "passed",
      "exit_code": 0,
      "duration_ms": 8234,
      "output_summary": "8 tests passed, 0 failed",
      "test_results": {
        "total": 8,
        "passed": 8,
        "failed": 0,
        "skipped": 0
      }
    },
    {
      "check": "npm run lint",
      "status": "passed",
      "exit_code": 0,
      "output_summary": "0 errors, 2 warnings"
    }
  ]
}
```

### Human Verification（人工验证）

```json
{
  "human_required": [
    {
      "id": "hv-1",
      "item": "Visual layout check",
      "description": "Verify dashboard layout matches design spec",
      "status": "pending|approved|rejected",
      "verified_by": null,
      "verified_at": null,
      "notes": null
    },
    {
      "id": "hv-2",
      "item": "Responsive behavior",
      "description": "Test mobile/tablet/desktop breakpoints",
      "status": "pending",
      "verified_by": null,
      "verified_at": null,
      "notes": null
    }
  ]
}
```

### Failure Tracking（失败追踪）

```json
{
  "failures": [
    {
      "check": "npm test",
      "status": "failed",
      "exit_code": 1,
      "output_summary": "2 tests failed",
      "failed_tests": [
        { "name": "should authenticate user", "error": "Expected 200, got 401" },
        { "name": "should create session", "error": "Timeout exceeded" }
      ],
      "attempted_fixes": [
        { "attempt": 1, "action": "Fixed auth header", "result": "still failing" }
      ],
      "requires_escalation": true
    }
  ]
}
```

</verification_results_model>

<rollback_metadata>

## Rollback Metadata（回滚元数据）

回滚元数据确保检查点可以作为安全的回滚锚点。

### Structure（结构）

```json
{
  "rollback_metadata": {
    "anchor_commit": "a1b2c3d4e5f6",
    "anchor_message": "feat(08-02): implement user authentication",
    "anchor_timestamp": "2024-01-15T10:25:00Z",
    
    "dependencies": {
      "locked": true,
      "lockfile": "pnpm-lock.yaml",
      "lockfile_hash": "sha256:abc123..."
    },
    
    "environment": {
      "node_version": "20.10.0",
      "package_manager": "pnpm@8.14.0",
      "os": "darwin-arm64"
    },
    
    "git_state": {
      "branch": "feature/auth",
      "clean": true,
      "uncommitted_files": [],
      "stash_available": false
    },
    
    "database_state": {
      "migrations_applied": ["20240115_add_users_table", "20240115_add_sessions_table"],
      "pending_migrations": []
    }
  }
}
```

### Rollback Procedure（回滚流程）

当需要回滚到此检查点时：

```bash
# 1. Verify checkpoint exists
[ -f ".planning/phases/08-auth/CHECKPOINT-02.json" ]

# 2. Reset to anchor commit
git reset --hard a1b2c3d4e5f6

# 3. Restore dependencies (if needed)
pnpm install --frozen-lockfile

# 4. Rollback database migrations (if needed)
npx prisma migrate rollback --to 20240115_add_sessions_table

# 5. Verify state
npm test
npm run build
```

### Rollback Decision Matrix（回滚决策矩阵）

| 场景 | 回滚到 | 条件 |
|------|--------|------|
| 验证失败 | 上一个检查点 | 自动验证失败，修复成本 > 重做成本 |
| 架构决策变更 | 决策检查点 | 用户选择不同方案 |
| 环境问题 | 最近检查点 | 依赖冲突、配置错误 |
| 质量门禁失败 | 当前检查点 | 安全漏洞、严重 bug |

</rollback_metadata>

<checkpoint_lifecycle>

## Checkpoint Lifecycle（检查点生命周期）

### Creation（创建）

检查点在遇到 `type="checkpoint:*"` 时自动创建：

```bash
# Executor creates checkpoint artifact
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" checkpoint create \
  --phase "${PHASE}" \
  --plan "${PLAN}" \
  --type "${CHECKPOINT_TYPE}" \
  --snapshot "$(cat snapshot.json)" \
  --quality-report "$(cat quality.json)" \
  --verification "$(cat verify.json)"
```

### Resolution（解决）

用户响应后更新检查点状态：

```bash
# Update checkpoint with resolution
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" checkpoint resolve \
  --id "cp-08-02-1705315800" \
  --status "approved|rejected|rolled_back" \
  --notes "User feedback or reason"
```

### Rollback（回滚）

需要回滚时执行：

```bash
# Rollback to checkpoint
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" checkpoint rollback \
  --id "cp-08-02-1705315800" \
  --reason "Architecture decision changed"
```

### Cleanup（清理）

阶段完成后清理检查点文件：

```bash
# Archive checkpoints after phase completion
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" checkpoint archive \
  --phase "${PHASE}"
```

</checkpoint_lifecycle>

<checkpoint_return_format_enhanced>

## Enhanced Checkpoint Return Format（增强版检查点返回格式）

当遇到检查点时，返回以下增强格式：

```markdown
## CHECKPOINT REACHED（已到达检查点）

**ID:** cp-08-02-1705315800
**类型:** human-verify
**计划:** 08-02
**进度:** 已完成 3/5 个任务

### Quality Gate（质量门禁）

| 检查项 | 状态 | 详情 |
|--------|------|------|
| Exists | ✅ PASSED | 3/3 文件存在 |
| Substantive | ✅ PASSED | 无 stub 模式 |
| Wired | ✅ PASSED | 所有导入可解析 |
| Functional | ✅ PASSED | npm test: 8/8 通过 |

**测试覆盖率:** 85% lines, 72% branches
**Lint:** 0 errors, 2 warnings
**安全:** 0 vulnerabilities

### Completed Tasks（已完成任务）

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create user schema | a1b2c3d | prisma/schema.prisma |
| 2 | Create auth API | b2c3d4e | src/api/auth.ts |
| 3 | Create login UI | c3d4e5f | src/app/login/page.tsx |

### Rollback Anchor（回滚锚点）

**Commit:** c3d4e5f - feat(08-02): create login UI
**Clean state:** ✅ 可安全回滚

### Current Task（当前任务）

**任务 4:** Verify authentication flow
**状态:** awaiting verification

### Checkpoint Details（检查点详情）

[Type-specific content as before]

### Awaiting（等待项）

[用户需要执行或提供的内容]

---

**检查点文件:** `.planning/phases/08-auth/CHECKPOINT-02.json`
```

</checkpoint_return_format_enhanced>
