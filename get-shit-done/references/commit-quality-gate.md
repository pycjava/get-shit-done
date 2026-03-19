<purpose>
这是每个原子 commit 的质量门禁。一个 commit 如果不能被独立验证为可工作，就不算真正原子。所有检查都要在 `staging` 和 `commit` 之前完成。
</purpose>

<pyramid>
## 验证金字塔（Commit Gate）

本任务触碰到的每个产物，在提交前都必须通过所有适用层级。

| Level | Question | How to Check |
|-------|----------|--------------|
| **1 - Exists** | 文件是否出现在预期路径？ | `[ -f path ]` |
| **2 - Substantive** | 内容是否是真实现，而不是 stub / placeholder？ | grep 搜索 TODO / FIXME / placeholder / `return null` / `return {}` |
| **3 - Wired** | 是否已经和系统其他部分打通？ | 检查 import、调用方、路由注册、env 使用 |
| **4 - Functional** | 实际运行时是否可用？ | 执行 DEFINE 阶段里定义的验证命令 |

**Level 1-3：自动检查。** 在 commit 前执行。  
**Level 4：由 VERIFY 阶段负责。** 这里不重复跑；但如果 Level 4 还没执行，就不允许 commit。

</pyramid>

<gates>
## Commit Gate 检查清单

在每次 `git commit` 前运行。这不是建议，而是门禁。

### Gate 1: Exists
```bash
# For each file listed in the task's output
[ -f "path/to/file" ] && echo "OK" || echo "MISSING - do not commit"
```

### Gate 2: Substantive（没有 stub）
```bash
# Universal stub detector - run on each modified file
grep -nE "TODO|FIXME|XXX|HACK|placeholder|not implemented|coming soon" "$file"
grep -nE "return null$|return \{\}$|return \[\]$|pass$|\.\.\.$" "$file"
```
如果命中任何结果，先修，再提交。

### Gate 3: Wired
这一层会随着产物类型不同而变化。目标是确认这个产物不是孤立存在，而是真的能被系统用到：

```bash
# Function/module is imported somewhere
grep -r "import.*$(basename $file .ts)" src/

# API route is registered
grep -r "$(basename $(dirname $file))" src/app/ src/routes/

# Config variable is consumed
grep -r "process.env.$VAR_NAME" src/
```

如果它不可达：要么现在把它接上，要么明确记录为有意延后。

### Gate 4: Functional（已在 VERIFY 完成）
这一步由 `tdd-discipline.md` 的 VERIFY 阶段负责。如果 VERIFY 被跳过，就**不要进入 commit**。

</gates>

<pre_commit_declaration>
## Commit Body 里应该写什么

每个 commit body 都应回答三件事：
1. **改了什么**：文件级别的变更列表（task_commit 协议本来就要求）
2. **为什么它是对的**：用一句话引用实际跑过的验证命令
3. **Pyramid 状态**：适用于非 trivial commit

```
feat(03-02): implement user registration endpoint

- POST /api/auth/register with email/password validation
- Hashes password via bcrypt, creates User record
- Returns JWT on success, 400 on validation failure

Verified: npm test -- auth.test.ts (8 passed)
Pyramid: Exists ✓ / Substantive ✓ / Wired ✓ / Functional ✓
```

对于简单 commit（配置、文档、无逻辑变化的 refactor），`Pyramid` 这一行可以省略。
</pre_commit_declaration>

<halt_conditions>
## 以下情况不要提交

- Gate 1-3 有任何一项失败且还没修
- VERIFY（Gate 4）还没跑
- 你只是想“先存个进度”，但明知现在有问题  
  这不是原子提交，而是在拿 commit 伪装 checkpoint
- commit message 带有理想化描述（比如 “add user auth”），但代码里实际上并没有对应能力

**如果你过不了这道门：** 就把它视为一次 VERIFY 失败（参考 `tdd-discipline.md`），继续调试，直到过关。
</halt_conditions>

<integration>
## 与其他纪律的关系

- **tdd-discipline.md 的 SELF-CHECK**：发生在 VERIFY 之后、commit 之前；这里的 Pyramid Gate 1-3 本质上就是它的结构化版本
- **systematic-debugging.md**：如果某道 gate 挂了而你不清楚原因，先走它的 Phase 1-3，再尝试修
- **verification-patterns.md**：提供了更细的 Level 2-3 检查模式，按产物类型展开（React component、API route、schema、hook 等）
</integration>
