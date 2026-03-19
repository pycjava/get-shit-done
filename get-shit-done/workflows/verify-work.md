<purpose>
在阶段完成后验证实际交付结果，并在仍有缺口时生成后续修复计划。
</purpose>

<process>

1. 运行 init：

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init verify-work "$ARGUMENTS")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
```

2. 读取该阶段的 summary 与 verification 输出。
3. 逐项执行运行侧验收检查，例如：
- 发布路径是否可用
- 回滚路径是否清楚
- 是否具备告警覆盖
- 监控信号是否有意义
- 备份或恢复是否得到验证
- runbook 指引是否可执行

4. 将结果记录到 `{phase}-UAT.md`。
5. 若发现问题，转入 diagnosis，并为后续执行生成聚焦修复计划。

</process>
