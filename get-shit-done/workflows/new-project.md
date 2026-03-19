<purpose>
初始化项目以开展运维导向的规划，同时保留标准 GSD 产物链。
</purpose>

<process>

在标准运维上下文之外，一并收集容量假设、增长上限和扩容约束。

1. 运行初始化：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-project)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. 如果已存在代码但还没有代码库映射，建议先运行 `/gsd:map-codebase`。
3. 收集聚焦运维的项目上下文：
- 系统目标
- 环境
- 部署模式
- 依赖
- 可观测性预期
- 备份与恢复预期
- 安全边界与所有权边界

4. 写入：
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/config.json`

5. 展示下一步：
- 如果需要先讨论阶段，运行 `/gsd:discuss-phase 1`
- 如果阶段定义已经清楚，运行 `/gsd:plan-phase 1`

</process>
