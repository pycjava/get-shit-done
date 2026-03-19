# 验证模式

用于判断不同类型产物是否为真实实现，而不是 stub 或 placeholder。

<core_principle>
**存在 ≠ 已实现**

一个文件存在，不代表这个功能真的可用。验证时必须检查：
1. **Exists** - 文件是否在预期路径存在
2. **Substantive** - 内容是否是真实实现，而不是 placeholder
3. **Wired** - 是否已经接入系统其他部分
4. **Functional** - 调用时是否真的能工作

其中 1-3 级通常可以程序化检查，4 级往往需要人工验证。
</core_principle>

<stub_detection>

## 通用 Stub 模式

这些模式无论文件类型如何，都常常意味着只是占位代码：

**基于注释的 stub：**
```bash
# Grep patterns for stub comments
grep -E "(TODO|FIXME|XXX|HACK|PLACEHOLDER)" "$file"
grep -E "implement|add later|coming soon|will be" "$file" -i
grep -E "// \.\.\.|/\* \.\.\. \*/|# \.\.\." "$file"
```

**输出中的 placeholder 文本：**
```bash
# UI placeholder patterns
grep -E "placeholder|lorem ipsum|coming soon|under construction" "$file" -i
grep -E "sample|example|test data|dummy" "$file" -i
grep -E "\[.*\]|<.*>|\{.*\}" "$file"  # Template brackets left in
```

**空实现或过于简单的实现：**
```bash
# Functions that do nothing
grep -E "return null|return undefined|return \{\}|return \[\]" "$file"
grep -E "pass$|\.\.\.|\bnothing\b" "$file"
grep -E "console\.(log|warn|error).*only" "$file"  # Log-only functions
```

**本应动态却被硬编码的值：**
```bash
# Hardcoded IDs, counts, or content
grep -E "id.*=.*['\"].*['\"]" "$file"  # Hardcoded string IDs
grep -E "count.*=.*\d+|length.*=.*\d+" "$file"  # Hardcoded counts
grep -E "\\\$\d+\.\d{2}|\d+ items" "$file"  # Hardcoded display values
```

</stub_detection>

<react_components>

## React / Next.js 组件

**存在性检查：**
```bash
# File exists and exports component
[ -f "$component_path" ] && grep -E "export (default |)function|export const.*=.*\(" "$component_path"
```

**实质性检查：**
```bash
# Returns actual JSX, not placeholder
grep -E "return.*<" "$component_path" | grep -v "return.*null" | grep -v "placeholder" -i

# Has meaningful content (not just wrapper div)
grep -E "<[A-Z][a-zA-Z]+|className=|onClick=|onChange=" "$component_path"

# Uses props or state (not static)
grep -E "props\.|useState|useEffect|useContext|\{.*\}" "$component_path"
```

**React 特有的 stub 模式：**
```javascript
// RED FLAGS - These are stubs:
return <div>Component</div>
return <div>Placeholder</div>
return <div>{/* TODO */}</div>
return <p>Coming soon</p>
return null
return <></>

// Also stubs - empty handlers:
onClick={() => {}}
onChange={() => console.log('clicked')}
onSubmit={(e) => e.preventDefault()}  // Only prevents default, does nothing
```

**接线检查：**
```bash
# Component imports what it needs
grep -E "^import.*from" "$component_path"

# Props are actually used (not just received)
# Look for destructuring or props.X usage
grep -E "\{ .* \}.*props|\bprops\.[a-zA-Z]+" "$component_path"

# API calls exist (for data-fetching components)
grep -E "fetch\(|axios\.|useSWR|useQuery|getServerSideProps|getStaticProps" "$component_path"
```

**功能验证（需要人工）：**
- 组件是否渲染出可见内容？
- 交互元素点击后是否有响应？
- 数据是否真的加载并展示？
- 错误态是否展示正确？

</react_components>

<api_routes>

## API 路由（Next.js App Router / Express / 等）

**存在性检查：**
```bash
# Route file exists
[ -f "$route_path" ]

# Exports HTTP method handlers (Next.js App Router)
grep -E "export (async )?(function|const) (GET|POST|PUT|PATCH|DELETE)" "$route_path"

# Or Express-style handlers
grep -E "\.(get|post|put|patch|delete)\(" "$route_path"
```

**实质性检查：**
```bash
# Has actual logic, not just return statement
wc -l "$route_path"  # More than 10-15 lines suggests real implementation

# Interacts with data source
grep -E "prisma\.|db\.|mongoose\.|sql|query|find|create|update|delete" "$route_path" -i

# Has error handling
grep -E "try|catch|throw|error|Error" "$route_path"

# Returns meaningful response
grep -E "Response\.json|res\.json|res\.send|return.*\{" "$route_path" | grep -v "message.*not implemented" -i
```

**API 路由特有的 stub 模式：**
```typescript
// RED FLAGS - These are stubs:
export async function POST() {
  return Response.json({ message: "Not implemented" })
}

export async function GET() {
  return Response.json([])  // Empty array with no DB query
}

export async function PUT() {
  return new Response()  // Empty response
}

// Console log only:
export async function POST(req) {
  console.log(await req.json())
  return Response.json({ ok: true })
}
```

**接线检查：**
```bash
# Imports database/service clients
grep -E "^import.*prisma|^import.*db|^import.*client" "$route_path"

# Actually uses request body (for POST/PUT)
grep -E "req\.json\(\)|req\.body|request\.json\(\)" "$route_path"

# Validates input (not just trusting request)
grep -E "schema\.parse|validate|zod|yup|joi" "$route_path"
```

**功能验证（人工或自动）：**
- GET 是否真的从数据库返回数据？
- POST 是否真的创建了记录？
- 错误响应的状态码是否正确？
- 鉴权检查是否真的生效？

</api_routes>

<database_schema>

## 数据库 Schema（Prisma / Drizzle / SQL）

**存在性检查：**
```bash
# Schema file exists
[ -f "prisma/schema.prisma" ] || [ -f "drizzle/schema.ts" ] || [ -f "src/db/schema.sql" ]

# Model/table is defined
grep -E "^model $model_name|CREATE TABLE $table_name|export const $table_name" "$schema_path"
```

**实质性检查：**
```bash
# Has expected fields (not just id)
grep -A 20 "model $model_name" "$schema_path" | grep -E "^\s+\w+\s+\w+"

# Has relationships if expected
grep -E "@relation|REFERENCES|FOREIGN KEY" "$schema_path"

# Has appropriate field types (not all String)
grep -A 20 "model $model_name" "$schema_path" | grep -E "Int|DateTime|Boolean|Float|Decimal|Json"
```

**Schema 特有的 stub 模式：**
```prisma
// RED FLAGS - These are stubs:
model User {
  id String @id
  // TODO: add fields
}

model Message {
  id        String @id
  content   String  // Only one real field
}

// Missing critical fields:
model Order {
  id     String @id
  // No: userId, items, total, status, createdAt
}
```

**接线检查：**
```bash
# Migrations exist and are applied
ls prisma/migrations/ 2>/dev/null | wc -l  # Should be > 0
npx prisma migrate status 2>/dev/null | grep -v "pending"

# Client is generated
[ -d "node_modules/.prisma/client" ]
```

**功能验证：**
```bash
# Can query the table (automated)
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM $table_name"
```

</database_schema>

<hooks_utilities>

## 自定义 Hook 与工具函数

**存在性检查：**
```bash
# File exists and exports function
[ -f "$hook_path" ] && grep -E "export (default )?(function|const)" "$hook_path"
```

**实质性检查：**
```bash
# Hook uses React hooks (for custom hooks)
grep -E "useState|useEffect|useCallback|useMemo|useRef|useContext" "$hook_path"

# Has meaningful return value
grep -E "return \{|return \[" "$hook_path"

# More than trivial length
[ $(wc -l < "$hook_path") -gt 10 ]
```

**Hook 特有的 stub 模式：**
```typescript
// RED FLAGS - These are stubs:
export function useAuth() {
  return { user: null, login: () => {}, logout: () => {} }
}

export function useCart() {
  const [items, setItems] = useState([])
  return { items, addItem: () => console.log('add'), removeItem: () => {} }
}

// Hardcoded return:
export function useUser() {
  return { name: "Test User", email: "test@example.com" }
}
```

**接线检查：**
```bash
# Hook is actually imported somewhere
grep -r "import.*$hook_name" src/ --include="*.tsx" --include="*.ts" | grep -v "$hook_path"

# Hook is actually called
grep -r "$hook_name()" src/ --include="*.tsx" --include="*.ts" | grep -v "$hook_path"
```

</hooks_utilities>

<environment_config>

## 环境变量与配置

**存在性检查：**
```bash
# .env file exists
[ -f ".env" ] || [ -f ".env.local" ]

# Required variable is defined
grep -E "^$VAR_NAME=" .env .env.local 2>/dev/null
```

**实质性检查：**
```bash
# Variable has actual value (not placeholder)
grep -E "^$VAR_NAME=.+" .env .env.local 2>/dev/null | grep -v "your-.*-here|xxx|placeholder|TODO" -i

# Value looks valid for type:
# - URLs should start with http
# - Keys should be long enough
# - Booleans should be true/false
```

**env 特有的 stub 模式：**
```bash
# RED FLAGS - These are stubs:
DATABASE_URL=your-database-url-here
STRIPE_SECRET_KEY=sk_test_xxx
API_KEY=placeholder
NEXT_PUBLIC_API_URL=http://localhost:3000  # Still pointing to localhost in prod
```

**接线检查：**
```bash
# Variable is actually used in code
grep -r "process\.env\.$VAR_NAME|env\.$VAR_NAME" src/ --include="*.ts" --include="*.tsx"

# Variable is in validation schema (if using zod/etc for env)
grep -E "$VAR_NAME" src/env.ts src/env.mjs 2>/dev/null
```

</environment_config>

<wiring_verification>

## 接线验证模式

接线验证用于判断组件之间是否真的打通了通信。这通常也是最容易藏 stub 的地方。

### 模式：Component → API

**检查：** 组件是否真的调用了 API？

```bash
# Find the fetch/axios call
grep -E "fetch\(['\"].*$api_path|axios\.(get|post).*$api_path" "$component_path"

# Verify it's not commented out
grep -E "fetch\(|axios\." "$component_path" | grep -v "^.*//.*fetch"

# Check the response is used
grep -E "await.*fetch|\.then\(|setData|setState" "$component_path"
```

**危险信号：**
```typescript
// Fetch exists but response ignored:
fetch('/api/messages')  // No await, no .then, no assignment

// Fetch in comment:
// fetch('/api/messages').then(r => r.json()).then(setMessages)

// Fetch to wrong endpoint:
fetch('/api/message')  // Typo - should be /api/messages
```

### 模式：API → Database

**检查：** API 路由是否真的查询了数据库？

```bash
# Find the database call
grep -E "prisma\.$model|db\.query|Model\.find" "$route_path"

# Verify it's awaited
grep -E "await.*prisma|await.*db\." "$route_path"

# Check result is returned
grep -E "return.*json.*data|res\.json.*result" "$route_path"
```

**危险信号：**
```typescript
// Query exists but result not returned:
await prisma.message.findMany()
return Response.json({ ok: true })  // Returns static, not query result

// Query not awaited:
const messages = prisma.message.findMany()  // Missing await
return Response.json(messages)  // Returns Promise, not data
```

### 模式：Form → Handler

**检查：** 表单提交后是否真的执行了有效动作？

```bash
# Find onSubmit handler
grep -E "onSubmit=\{|handleSubmit" "$component_path"

# Check handler has content
grep -A 10 "onSubmit.*=" "$component_path" | grep -E "fetch|axios|mutate|dispatch"

# Verify not just preventDefault
grep -A 5 "onSubmit" "$component_path" | grep -v "only.*preventDefault" -i
```

**危险信号：**
```typescript
// Handler only prevents default:
onSubmit={(e) => e.preventDefault()}

// Handler only logs:
const handleSubmit = (data) => {
  console.log(data)
}

// Handler is empty:
onSubmit={() => {}}
```

### 模式：State → Render

**检查：** 组件渲染的是否是状态数据，而不是硬编码内容？

```bash
# Find state usage in JSX
grep -E "\{.*messages.*\}|\{.*data.*\}|\{.*items.*\}" "$component_path"

# Check map/render of state
grep -E "\.map\(|\.filter\(|\.reduce\(" "$component_path"

# Verify dynamic content
grep -E "\{[a-zA-Z_]+\." "$component_path"  # Variable interpolation
```

**危险信号：**
```tsx
// Hardcoded instead of state:
return <div>
  <p>Message 1</p>
  <p>Message 2</p>
</div>

// State exists but not rendered:
const [messages, setMessages] = useState([])
return <div>No messages</div>  // Always shows "no messages"

// Wrong state rendered:
const [messages, setMessages] = useState([])
return <div>{otherData.map(...)}</div>  // Uses different data
```

</wiring_verification>

<verification_checklist>

## 快速验证清单

针对每种产物类型，都可以按下面清单走一遍：

### 组件清单
- [ ] 文件存在于预期路径
- [ ] 导出了函数 / const 组件
- [ ] 返回 JSX（不是 null / 空）
- [ ] 渲染内容中没有 placeholder 文本
- [ ] 使用了 props 或 state（不是纯静态）
- [ ] 事件处理器有真实实现
- [ ] imports 可以正确解析
- [ ] 在应用某处被实际使用

### API 路由清单
- [ ] 文件存在于预期路径
- [ ] 导出了 HTTP 方法处理器
- [ ] 处理器不止 5 行
- [ ] 会查询数据库或服务
- [ ] 返回有意义的响应（不是空 / placeholder）
- [ ] 包含错误处理
- [ ] 做了输入校验
- [ ] 被前端实际调用

### Schema 清单
- [ ] 定义了 model / table
- [ ] 具备所有预期字段
- [ ] 字段类型合适
- [ ] 必要时定义了关系
- [ ] 存在 migration 且已应用
- [ ] 已生成 client

### Hook / 工具函数清单
- [ ] 文件存在于预期路径
- [ ] 导出了函数
- [ ] 有真实实现（不是空返回）
- [ ] 在应用某处被实际使用
- [ ] 返回值被实际消费

### 接线清单
- [ ] Component → API：存在 fetch / axios 调用，且响应被实际使用
- [ ] API → Database：存在查询，且结果被返回
- [ ] Form → Handler：`onSubmit` 会调用 API / mutation
- [ ] State → Render：状态变量实际出现在 JSX 中

</verification_checklist>

<automated_verification_script>

## 自动验证方法

给 verification subagent 时，可使用这套模式：

```bash
# 1. Check existence
check_exists() {
  [ -f "$1" ] && echo "EXISTS: $1" || echo "MISSING: $1"
}

# 2. Check for stub patterns
check_stubs() {
  local file="$1"
  local stubs=$(grep -c -E "TODO|FIXME|placeholder|not implemented" "$file" 2>/dev/null || echo 0)
  [ "$stubs" -gt 0 ] && echo "STUB_PATTERNS: $stubs in $file"
}

# 3. Check wiring (component calls API)
check_wiring() {
  local component="$1"
  local api_path="$2"
  grep -q "$api_path" "$component" && echo "WIRED: $component → $api_path" || echo "NOT_WIRED: $component → $api_path"
}

# 4. Check substantive (more than N lines, has expected patterns)
check_substantive() {
  local file="$1"
  local min_lines="$2"
  local pattern="$3"
  local lines=$(wc -l < "$file" 2>/dev/null || echo 0)
  local has_pattern=$(grep -c -E "$pattern" "$file" 2>/dev/null || echo 0)
  [ "$lines" -ge "$min_lines" ] && [ "$has_pattern" -gt 0 ] && echo "SUBSTANTIVE: $file" || echo "THIN: $file ($lines lines, $has_pattern matches)"
}
```

对每个 must-have artifact 运行这些检查，再把结果汇总进 `VERIFICATION.md`。

</automated_verification_script>

<human_verification_triggers>

## 何时必须人工验证

有些内容无法稳定地程序化验证。遇到这些情况时，应显式标记为人工测试项：

**始终需要人工：**
- 视觉外观（看起来是否正确）
- 完整用户流程（用户是否真的能完成目标）
- 实时行为（WebSocket、SSE）
- 外部服务集成（Stripe、邮件发送）
- 错误消息是否清晰
- 体感性能是否足够快

**不确定时也要人工：**
- grep 无法稳定追踪的复杂接线
- 依赖动态状态的行为
- 边界情况与错误态
- 移动端响应式表现
- 无障碍能力

**人工验证请求格式：**
```markdown
## Human Verification Required

### 1. Chat message sending
**Test:** Type a message and click Send
**Expected:** Message appears in list, input clears
**Check:** Does message persist after refresh?

### 2. Error handling
**Test:** Disconnect network, try to send
**Expected:** Error message appears, message not lost
**Check:** Can retry after reconnect?
```

</human_verification_triggers>

<checkpoint_automation_reference>

## 检查点前的自动化准备

关于 automation-first 的 checkpoint 模式、server 生命周期管理、CLI 安装处理和错误恢复协议，见：

**@~/.claude/get-shit-done/references/checkpoints.md** → `<automation_reference>` section

关键原则：
- Claude 必须在展示 checkpoint 之前先搭好验证环境
- 用户不应执行 CLI 命令（只访问 URL）
- Server 生命周期：checkpoint 前启动，处理端口冲突，并在整个验证期间保持运行
- CLI 安装：能安全自动装就自动装，否则再用 checkpoint 让用户选择
- 错误处理：先修复损坏的环境，再展示 checkpoint；绝不要带着失败的 setup 进入 checkpoint

</checkpoint_automation_reference>
