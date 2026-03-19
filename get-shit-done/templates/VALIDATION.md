---
phase: {N}
slug: {phase-slug}
status: draft
nyquist_compliant: false
wave_0_complete: false
created: {date}
---

# Phase {N} - Validation Strategy

> 按 phase 定义的验证契约，用于执行过程中的反馈采样。

---

## 测试基础设施

| Property | Value |
|----------|-------|
| **Framework** | {pytest 7.x / jest 29.x / vitest / go test / other} |
| **Config file** | {path or "none - Wave 0 installs"} |
| **Quick run command** | `{quick command}` |
| **Full suite command** | `{full command}` |
| **Estimated runtime** | ~{N} seconds |

---

## 采样频率

- **每个任务提交后：** 运行 `{quick run command}`
- **每个 plan wave 结束后：** 运行 `{full suite command}`
- **在 `/gsd:verify-work` 之前：** 完整测试必须全绿
- **最大反馈延迟：** {N} seconds

---

## 每任务验证映射

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| {N}-01-01 | 01 | 1 | REQ-{XX} | unit | `{command}` | ✅ / ❌ W0 | pending |

*Status: `pending` / `green` / `red` / `flaky`*

---

## Wave 0 要求

- [ ] `{tests/test_file.py}` - 为 REQ-{XX} 提供测试桩
- [ ] `{tests/conftest.py}` - 共享 fixtures
- [ ] `{framework install}` - 如果未检测到测试框架

*如果没有：`Existing infrastructure covers all phase requirements.`*

---

## 仅能人工完成的验证

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| {behavior} | REQ-{XX} | {reason} | {steps} |

*如果没有：`All phase behaviors have automated verification.`*

---

## Validation Sign-Off

- [ ] 所有任务都有 `<automated>` verify 或 Wave 0 依赖
- [ ] 采样连续性成立：不存在连续 3 个任务都没有自动验证
- [ ] Wave 0 覆盖所有 `MISSING` 引用
- [ ] 没有 watch-mode 标记
- [ ] 反馈延迟 < {N}s
- [ ] frontmatter 中已设置 `nyquist_compliant: true`

**Approval:** {pending / approved YYYY-MM-DD}
