# 验证报告模板

用于生成 `.planning/phases/XX-name/{phase_num}-VERIFICATION.md`。

要求：
- frontmatter 键名与状态值保持英文，便于工具读取
- 面向人的标题、表头、正文使用中文
- frontmatter 中的 `gaps` 与 `human_verification` 必须结构化，供后续流程读取

---

## 文件模板

```markdown
---
phase: XX-name
verified: YYYY-MM-DDTHH:MM:SSZ
status: passed | gaps_found | human_needed
score: N/M 个必备项已验证
---

# 阶段 {X}: {Name} - 验证报告

**阶段目标：** {goal from ROADMAP.md}
**验证时间：** {timestamp}
**状态：** {passed | gaps_found | human_needed}

## 目标达成情况

### 可观察事实

| # | 事实 | 状态 | 证据 |
|---|------|------|------|
| 1 | {truth} | ✅ 已验证 | {evidence} |
| 2 | {truth} | ❌ 未通过 | {what's wrong} |
| 3 | {truth} | ❓ 不确定 | {why can't verify} |

**得分：** {N}/{M} 个事实已验证

### 必需产物

| 产物 | 预期 | 状态 | 详情 |
|------|------|------|------|
| `src/components/Chat.tsx` | 消息列表组件 | ✅ 存在且有效 | 导出 ChatList，渲染 Message[]，无占位桩代码 |

### 关键连接验证

| 从 | 到 | 方式 | 状态 | 详情 |
|----|----|------|------|------|
| Chat.tsx | /api/chat | useEffect 中 fetch | ✅ 已接通 | 第 23 行调用了 `fetch('/api/chat')` |

### 需求覆盖

| 需求 | 状态 | 阻塞问题 |
|------|------|----------|
| {REQ-01}: {description} | ✅ 满足 | - |
| {REQ-02}: {description} | ❌ 阻塞 | API 路由仍是桩实现 |

### 发现的反模式

| 文件 | 行号 | 模式 | 严重性 | 影响 |
|------|------|------|--------|------|
| src/app/api/chat/route.ts | 12 | `// TODO: implement` | ⚠️ 警告 | 表示实现不完整 |

### 需要人工验证

[如果不需要人工验证：]
无——所有可验证项都已通过程序化检查。

[如果需要人工验证：]

#### 1. {测试名称}

- **测试操作：** {What to do}
- **预期结果：** {What should happen}
- **为什么需要人工：** {Why can't verify programmatically}

### 缺口总结

[如果没有缺口：]
**未发现缺口。** 阶段目标已达成，可以继续推进。

[如果有缺口：]

#### 关键缺口（阻塞推进）

1. **{Gap name}**
   - 缺失：{what's missing}
   - 影响：{why this blocks the goal}
   - 修复：{what needs to happen}

#### 非关键缺口（可延后）

1. **{Gap name}**
   - 问题：{what's wrong}
   - 影响：{limited impact}
   - 建议：{fix now or defer}

## 建议的修复计划

[仅在 `gaps_found` 时生成]

### {phase}-{next}-PLAN.md: {Fix Name}

**目标：** {What this fixes}

**任务：**
1. {Task to fix gap 1}
2. {Task to fix gap 2}
3. {Verification task}

**预估范围：** {Small / Medium}

## 验证元数据

**验证方法：** 从目标反推（goal-backward）
**must_haves 来源：** {PLAN.md frontmatter | derived from ROADMAP.md goal}
**自动化检查：** {N} 通过，{M} 失败
**需要人工检查：** {N}
**总验证耗时：** {duration}

---
*验证时间：{timestamp}*
*验证者：Claude (subagent)*
```

---

## 规则

- `passed`：所有必备项通过，无阻塞问题
- `gaps_found`：存在关键缺口
- `human_needed`：自动化检查通过，但仍需人工验证
- `gaps` frontmatter 只写结构化问题，不写散文
- `human_verification` frontmatter 只写可执行测试项
