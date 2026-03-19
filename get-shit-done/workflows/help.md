<purpose>
展示面向运维工作流的 GSD 命令参考。这里只输出参考正文。
</purpose>

<reference>
# GSD 命令参考

## 推荐流程
1. `/gsd:bootstrap` — 一键启动全链路（有就跳过，没有就初始化）
2. `/gsd:new-project` — 初始化项目
3. `/gsd:map-codebase` — 理解代码库
4. `/gsd:plan-phase <阶段>` — 规划阶段
5. `/gsd:execute-phase <阶段>` — 执行阶段
6. `/gsd:verify-work [阶段]` — 验证阶段
7. `/gsd:ops-runbook` — 生成运维文档
8. `/gsd:ops-audit` — 审计运维文档
9. `/gsd:autonomous` — 全自动执行剩余阶段
10. `/gsd:help` — 显示本参考

## bootstrap 参数
`/gsd:bootstrap --phase N --skip-audit --skip-map`
- `--phase N`：从第 N 个 phase 开始（默认 1）
- `--skip-audit`：跳过 ops-audit
- `--skip-map`：跳过 map-codebase

默认分析内核：
- `Latency`
- `Traffic`
- `Errors`
- `Saturation`

这个裁剪版只保留核心运维流程命令。
</reference>
