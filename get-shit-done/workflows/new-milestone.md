<purpose>
为新的运维工作里程碑建立起点，沿用项目初始化时相同的产物链。
</purpose>

<process>

1. 运行 init：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-milestone)
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. 收集自上一个里程碑以来发生的运维变化：
- 服务范围
- 环境变化
- 运行缺口
- 可靠性目标
- 发布压力或合规压力

3. 更新里程碑级别的需求与路线图。

4. 路由到第一个尚未规划的阶段。

</process>
