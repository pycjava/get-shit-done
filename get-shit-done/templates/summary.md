# 总结模板

用于生成 `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`。

要求：
- frontmatter 键名保持英文，便于工具读取
- 面向人的标题、表头和正文使用中文
- 一句话总结必须具体，不要写“阶段完成”“实现完成”这种空话

---

## 文件模板

```markdown
---
phase: XX-name
plan: YY
subsystem: [主要类别，如 auth, payments, ui, api, database, infra, testing ...]
tags: [可检索技术标签]

# Dependency graph
requires:
  - phase: [依赖的前置阶段]
    provides: [该阶段提供了什么]
provides:
  - [本计划交付了什么]
affects: [后续会受影响的阶段或关键词]

# Tech tracking
tech-stack:
  added: [新增库 / 工具]
  patterns: [建立的模式]

key-files:
  created: [关键新文件]
  modified: [关键修改文件]

key-decisions:
  - "决策 1"
  - "决策 2"

patterns-established:
  - "模式 1：描述"
  - "模式 2：描述"

requirements-completed: []  # REQUIRED：从 PLAN.md frontmatter 的 requirements 原样复制

# Metrics
duration: Xmin
completed: YYYY-MM-DD
---

# 阶段 [X]：[Name] 总结

**[用一句有信息量的话概括本次产出]**

## 执行概况

- **耗时：** [time]
- **开始时间：** [ISO timestamp]
- **完成时间：** [ISO timestamp]
- **完成任务：** [count completed]
- **修改文件：** [count]

## 主要成果

- [最重要的成果]
- [第二个关键成果]
- [如有需要，再写第三项]

## 任务提交记录

每个任务都应原子提交：
1. **任务 1：[任务名称]** - `abc123f` (feat/fix/test/refactor)
2. **任务 2：[任务名称]** - `def456g` (feat/fix/test/refactor)
3. **任务 3：[任务名称]** - `hij789k` (feat/fix/test/refactor)

**计划元数据提交：** `lmn012o` (docs: complete plan)

## 创建 / 修改的文件
- `path/to/file.ts` - 文件作用
- `path/to/another.ts` - 文件作用

## 已作决策

[关键决策及其原因；如果没有，写“无——按计划执行”]

## 偏离计划

[如果没有偏离：写“无——完全按计划执行”]

[如果有偏离：]

### 自动修复的问题
**1. [Rule X - Category] 简述**

- **发现于：** 任务 [N]（[任务名称]）
- **问题：** [哪里有问题]
- **修复：** [做了什么]
- **修改文件：** [file paths]
- **验证方式：** [如何验证]
- **提交记录：** [hash]

---

**总偏差数：** [N]
**对计划的影响：** [简短评估]

## 遇到的问题
[执行过程中遇到的问题及处理方式；如果没有，写“无”]

## 用户需要完成的设置

[如果生成了 USER-SETUP.md：]
**外部服务仍需人工配置。** 详见 [{phase}-USER-SETUP.md](./{phase}-USER-SETUP.md)：
- 需要补充的环境变量
- 控制台 / 仪表盘配置步骤
- 验证命令

[如果没有 USER-SETUP.md：]
无——不需要额外人工配置。

## 下一阶段准备情况

[下一阶段已经具备的条件]
[阻塞项或注意事项]

---
*阶段：XX-name*  
*完成时间：[date]*
```

---

## 编写规则

- frontmatter 必须完整
- 一句话总结要可感知、可复述，例如“基于 jose 的 JWT 鉴权与刷新轮换”
- “已作决策”记录执行中真实发生的关键选择
- “偏离计划”记录计划外但已自动处理的工作
- “遇到的问题”记录计划内工作中的排障过程
- 如果有 `USER-SETUP.md`，要在总结里明确提示
