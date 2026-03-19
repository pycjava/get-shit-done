<purpose>
将自由描述的请求路由到最合适的运维 workflow 命令。
</purpose>

<routing_hints>
| 请求类型 | 路由到 |
|---|---|
| 初始化或重启规划 | `/gsd:new-project` |
| 理解现有服务 / 代码库 | `/gsd:map-codebase` |
| 澄清某个阶段 | `/gsd:discuss-phase` |
| 创建计划 | `/gsd:plan-phase` |
| 执行某个阶段 | `/gsd:execute-phase` |
| 验证运行结果 | `/gsd:verify-work` |
| 生成 runbook | `/gsd:ops-runbook` |
| 审计 runbook | `/gsd:ops-audit` |
| 查看状态 | `/gsd:progress` |
</routing_hints>
