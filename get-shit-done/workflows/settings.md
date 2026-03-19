<purpose>
更新运维工作流使用的 `.planning/config.json`。
</purpose>

<process>

1. 确保配置文件和所需区块存在：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-ensure-section
```

2. 读取当前配置，并让用户选择以下值：
- `model_profile`
- `workflow.research`
- `workflow.plan_check`
- `workflow.verifier`
- `workflow.nyquist_validation`
- `workflow.auto_advance`
- `git.branching_strategy`
- `hooks.context_warnings`

3. 将更新后的设置写回 `.planning/config.json`。

4. 向用户展示一份简洁的设置摘要。

</process>

<notes>
不要再提供已经移除的 UI 设置或开发者 profiling 设置。
</notes>
