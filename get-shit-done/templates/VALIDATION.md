---
phase: {N}
slug: {phase-slug}
status: draft
nyquist_compliant: false
wave_0_complete: false
created: {date}
---

# 阶段 {N}：验证策略

> 按 phase 定义的验证契约，用于执行过程中的反馈采样。

---

## 测试基础设施

| 属性 | 值 |
|------|----|
| **测试框架** | {pytest 7.x / jest 29.x / vitest / go test / other} |
| **配置文件** | {path or "none - Wave 0 installs"} |
| **快速执行命令** | `{quick command}` |
| **完整测试命令** | `{full command}` |
| **预计耗时** | ~{N} seconds |

---

## 采样频率

- **每个任务提交后：** 运行 `{quick run command}`
- **每个 plan wave 结束后：** 运行 `{full suite command}`
- **在 `/gsd:verify-work` 之前：** 完整测试必须全绿
- **最大反馈延迟：** {N} seconds

---

## 每任务验证映射

| 任务 ID | 计划 | Wave | 需求 | 测试类型 | 自动化命令 | 文件是否存在 | 状态 |
|---------|------|------|------|----------|------------|--------------|------|
| {N}-01-01 | 01 | 1 | REQ-{XX} | unit | `{command}` | ✅ / ❌ W0 | 待验证 |

*状态：`待验证` / `通过` / `失败` / `不稳定`*

---

## Wave 0 要求

- [ ] `{tests/test_file.py}` - 为 REQ-{XX} 提供测试桩
- [ ] `{tests/conftest.py}` - 共享 fixtures
- [ ] `{framework install}` - 如果未检测到测试框架

*如果没有：`Existing infrastructure covers all phase requirements.`*

---

## 仅能人工完成的验证

| 行为 | 需求 | 必须人工验证的原因 | 测试说明 |
|------|------|------------------|----------|
| {behavior} | REQ-{XX} | {reason} | {steps} |

*如果没有：`All phase behaviors have automated verification.`*

---

## 验证签署

- [ ] 所有任务都有 `<automated>` verify 或 Wave 0 依赖
- [ ] 采样连续性成立：不存在连续 3 个任务都没有自动验证
- [ ] Wave 0 覆盖所有 `MISSING` 引用
- [ ] 没有 watch-mode 标记
- [ ] 反馈延迟 < {N}s
- [ ] frontmatter 中已设置 `nyquist_compliant: true`

**批准状态：** {待定 / 已批准 YYYY-MM-DD}
