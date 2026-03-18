<purpose>
初始化项目以进行运维规划，同时保留标准 GSD  artifact 链。
</purpose>

<process>

1. 运行初始化：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-project)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. 如果存在现有代码且没有代码库映射，建议先运行 `/gsd:map-codebase`。

3. 收集聚焦于运维的项目上下文：
- 系统目的
- 环境
- 部署模式
- 依赖
- 可观测性期望
- 备份和恢复期望
- 安全和所有权边界

4. 写入：
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/config.json`

5. 展示下一步：
- 如果需要阶段讨论，运行 `/gsd:discuss-phase 1`
- 如果阶段已明确定义，运行 `/gsd:plan-phase 1`

</process>
