<overview>
TDD 关注的是设计质量，而不是覆盖率数字。`red-green-refactor` 循环会强迫你在写实现之前先思考行为，因此通常能产出更干净的接口和更容易测试的代码。

**原则：** 如果你能在写 `fn` 之前就把行为描述成 `expect(fn(input)).toBe(output)`，那么 TDD 往往会让结果更好。

**关键洞察：** TDD 的工作量天然比标准任务更重。它至少包含 2-3 个执行循环（`RED -> GREEN -> REFACTOR`），每一轮都伴随文件读取、测试运行和可能的调试。因此，适合 TDD 的功能应该获得专门的 plan，确保整个循环期间上下文都足够充足。
</overview>

<when_to_use_tdd>
## 什么情况下 TDD 会提升质量

**适合 TDD 的候选项（创建 TDD plan）：**
- 有明确定义输入/输出的业务逻辑
- 有请求/响应契约的 API endpoint
- 数据转换、解析、格式化
- 校验规则与约束
- 行为可测试的算法
- 状态机与工作流
- 规格清晰的 utility function

**不适合 TDD（使用 `type="auto"` 的标准 plan）：**
- UI 布局、样式、视觉组件
- 配置变更
- 连接既有组件的 glue code
- 一次性脚本和迁移
- 没有业务逻辑的简单 CRUD
- 探索式原型

**经验判断：** 你能在写 `fn` 之前先写出 `expect(fn(input)).toBe(output)` 吗？  
-> 能：创建 TDD plan  
-> 不能：使用标准 plan，需要时事后补测试
</when_to_use_tdd>

<tdd_plan_structure>
## TDD Plan 结构

每个 TDD plan 都只通过完整的 `RED-GREEN-REFACTOR` 循环实现**一个功能**。

```markdown
---
phase: XX-name
plan: NN
type: tdd
---

<objective>
[What feature and why]
Purpose: [Design benefit of TDD for this feature]
Output: [Working, tested feature]
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@relevant/source/files.ts
</context>

<feature>
  <name>[Feature name]</name>
  <files>[source file, test file]</files>
  <behavior>
    [Expected behavior in testable terms]
    Cases: input -> expected output
  </behavior>
  <implementation>[How to implement once tests pass]</implementation>
</feature>

<verification>
[Test command that proves feature works]
</verification>

<success_criteria>
- Failing test written and committed
- Implementation passes test
- Refactor complete (if needed)
- All 2-3 commits present
</success_criteria>

<output>
After completion, create SUMMARY.md with:
- RED: What test was written, why it failed
- GREEN: What implementation made it pass
- REFACTOR: What cleanup was done (if any)
- Commits: List of commits produced
</output>
```

**一个 TDD plan 只做一个功能。** 如果多个功能已经小到能批量塞进一个 TDD plan，那通常也小到不值得走 TDD；直接用标准 plan 并在实现后补测试即可。
</tdd_plan_structure>

<execution_flow>
## Red-Green-Refactor 循环

**RED - 写一个会失败的测试：**
1. 按项目约定创建测试文件
2. 基于 `<behavior>` 写出描述预期行为的测试
3. 运行测试，它**必须失败**
4. 如果测试直接通过了：要么功能已存在，要么测试写错了，先查清楚
5. 提交：`test({phase}-{plan}): add failing test for [feature]`

**GREEN - 实现到能通过：**
1. 写最少量的代码让测试通过
2. 不要耍聪明，不要先做优化，只求先工作
3. 运行测试，它**必须通过**
4. 提交：`feat({phase}-{plan}): implement [feature]`

**REFACTOR（如有必要）：**
1. 如果确实存在明显改进空间，再清理实现
2. 重跑测试，**必须继续通过**
3. 只有发生了真实改动才提交：`refactor({phase}-{plan}): clean up [feature]`

**结果：** 每个 TDD plan 会产出 2-3 个原子提交。
</execution_flow>

<test_quality>
## 好测试与坏测试

**测试行为，不测试实现细节：**
- 好：`returns formatted date string`
- 坏：`calls formatDate helper with correct params`
- 测试应该在重构后仍然稳定成立

**一个测试只验证一个概念：**
- 好：把有效输入、空输入、格式错误拆成不同测试
- 坏：一个测试里用很多断言把所有边界情况都塞进去

**命名要描述行为：**
- 好：`should reject empty email`、`returns null for invalid ID`
- 坏：`test1`、`handles error`、`works correctly`

**不要测试内部细节：**
- 好：测试公开 API、可观察行为
- 坏：mock 内部实现、测试私有方法、断言内部状态
</test_quality>

<framework_setup>
## 测试框架初始化（如果项目里还没有）

如果执行 TDD plan 时项目里还没有配置测试框架，就把它视为 RED 阶段的一部分：

**1. 识别项目类型：**
```bash
# JavaScript/TypeScript
if [ -f package.json ]; then echo "node"; fi

# Python
if [ -f requirements.txt ] || [ -f pyproject.toml ]; then echo "python"; fi

# Go
if [ -f go.mod ]; then echo "go"; fi

# Rust
if [ -f Cargo.toml ]; then echo "rust"; fi
```

**2. 安装最小测试框架：**
| Project | Framework | Install |
|---------|-----------|---------|
| Node.js | Jest | `npm install -D jest @types/jest ts-jest` |
| Node.js (Vite) | Vitest | `npm install -D vitest` |
| Python | pytest | `pip install pytest` |
| Go | testing | Built-in |
| Rust | cargo test | Built-in |

**3. 如有需要，创建配置：**
- Jest：`jest.config.js` + `ts-jest` preset
- Vitest：`vitest.config.ts` + test globals
- pytest：`pytest.ini` 或 `pyproject.toml` 对应 section

**4. 验证框架可用：**
```bash
# Run empty test suite - should pass with 0 tests
npm test  # Node
pytest    # Python
go test ./...  # Go
cargo test    # Rust
```

**5. 创建第一个测试文件：**
遵循项目既有测试位置约定：
- `*.test.ts` / `*.spec.ts` 与源码相邻
- `__tests__/` 目录
- 根目录下的 `tests/` 目录

测试框架初始化是一笔一次性成本，算在第一个 TDD plan 的 RED 阶段里。
</framework_setup>

<error_handling>
## 错误处理

**RED 阶段测试没有失败：**
- 这个功能可能已经存在，先调查
- 测试可能写错了，没测到你以为在测的东西
- 在查清前不要进入下一阶段

**GREEN 阶段测试没有通过：**
- 调试实现
- 不要跳到 refactor
- 一直迭代到变绿为止

**REFACTOR 阶段测试失败：**
- 回退这次重构
- 说明提交时机太早
- 用更小的步子重新做重构

**无关测试也挂了：**
- 立刻停下来调查
- 这可能说明耦合存在问题
- 查清并修复后再继续
</error_handling>

<commit_pattern>
## TDD Plan 的提交模式

TDD plan 会产出 2-3 个原子提交（每个阶段一个）：

```
test(08-02): add failing test for email validation

- Tests valid email formats accepted
- Tests invalid formats rejected
- Tests empty input handling

feat(08-02): implement email validation

- Regex pattern matches RFC 5322
- Returns boolean for validity
- Handles edge cases (empty, null)

refactor(08-02): extract regex to constant (optional)

- Moved pattern to EMAIL_REGEX constant
- No behavior changes
- Tests still pass
```

**与标准 plan 的区别：**
- 标准 plan：每个任务 1 个提交，每个 plan 通常 2-4 个提交
- TDD plan：为了一个功能产出 2-3 个提交

两者都遵循统一格式：`{type}({phase}-{plan}): {description}`

**收益：**
- 每个提交都能独立回退
- `git bisect` 可以在提交粒度上工作
- 历史能清楚体现 TDD discipline
- 与整体提交策略保持一致
</commit_pattern>

<context_budget>
## 上下文预算

TDD plan 的目标是**约 40% 的上下文占用**，低于标准 plan 通常的 50%。

原因在于：
- RED 阶段：写测试、跑测试、还可能调试为什么它没失败
- GREEN 阶段：写实现、跑测试、还可能多轮迭代修错
- REFACTOR 阶段：改代码、重跑测试、确认没有回归

每个阶段都包含读文件、跑命令、分析输出，这种来回切换天然比线性执行更重。

因此，坚持“一个 plan 只做一个 feature”，才能在整个循环里都保持足够质量。
</context_budget>
