---
name: gsd:update
description: 更新 GSD 到最新版本，并展示变更说明
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
检查是否有新的 GSD 版本；如果有，则安装更新并展示发生了哪些变化。

它会路由到 `update` workflow，负责：
- 检测当前版本（本地 / 全局安装）
- 通过 npm 检查最新版本
- 拉取并展示 changelog
- 提示用户确认，并说明 clean install 风险
- 执行更新并清理缓存
- 提醒用户重启当前环境
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/update.md
</execution_context>

<process>
**按 `@~/.claude/get-shit-done/workflows/update.md` 执行 `update` workflow。**

workflow 会负责：
1. 检测当前已安装版本（本地 / 全局）
2. 通过 npm 查询最新版本
3. 比较版本差异
4. 抓取并提炼 changelog
5. 展示 clean install 警告
6. 获取用户确认
7. 执行更新
8. 清理缓存
</process>
