<purpose>
通过 npm 检查 GSD 是否有更新，展示当前版本到最新版本之间的 changelog，获得用户确认后执行干净安装，并清理更新缓存。
</purpose>

<required_reading>
开始前先读取调用方 `execution_context` 中引用的全部文件。
</required_reading>

<process>

<step name="get_installed_version">
同时检查本地安装和全局安装，判断 GSD 安装位置并校验完整性。

首先从 `execution_context` 推导 `PREFERRED_RUNTIME`：
- 路径包含 `/.codex/` -> `codex`
- 路径包含 `/.gemini/` -> `gemini`
- 路径包含 `/.config/opencode/` 或 `/.opencode/` -> `opencode`
- 否则 -> `claude`

然后优先检查对应 runtime 的安装位置。

结果需要确定：
- 已安装版本
- 安装范围：`LOCAL` / `GLOBAL` / `UNKNOWN`
- 目标 runtime：`claude` / `opencode` / `gemini` / `codex`

如果多个 runtime 都安装了，但无法从 `execution_context` 确认当前调用来源，则先询问用户要更新哪一个。

**如果缺少 VERSION 文件：**
展示：
```
## GSD 更新

**当前版本：** Unknown

当前安装没有版本跟踪信息。
将按全新安装方式继续。
```

此时把版本视作 `0.0.0` 继续。
</step>

<step name="check_latest_version">
检查 npm 上的最新版本：

```bash
npm view get-shit-done-cc version 2>/dev/null
```

如果 npm 查询失败：
```
无法检查更新（可能离线或 npm 不可用）。

手动更新可执行：`npx get-shit-done-cc --global`
```

退出。
</step>

<step name="compare_versions">
比较当前版本和最新版本：

**如果已是最新：**
```
## GSD 更新

**当前版本：** X.Y.Z
**最新版本：** X.Y.Z

你已经在使用最新版本。
```

退出。

**如果当前版本比最新版本还高：**
```
## GSD 更新

**当前版本：** X.Y.Z
**最新版本：** A.B.C

你当前使用的是高于正式发布版的版本（可能是开发版）。
```

退出。
</step>

<step name="show_changes_and_confirm">
**如果发现可更新版本：**

先获取并展示 changelog，再询问是否继续：

展示内容包括：
- 当前版本
- 最新版本
- 两者之间的新增 / 修复内容
- 干净安装会覆盖哪些 GSD 自带目录
- 哪些自定义文件不会受影响
- 如果用户曾直接修改 GSD 文件，安装器会先备份到 `gsd-local-patches/`

然后使用 AskUserQuestion 询问：
- “是，现在更新”
- “否，取消”

如果用户取消：退出。
</step>

<step name="run_update">
根据第 1 步识别出的安装类型执行更新：

```bash
RUNTIME_FLAG="--$TARGET_RUNTIME"
```

**LOCAL 安装：**
```bash
npx -y get-shit-done-cc@latest "$RUNTIME_FLAG" --local
```

**GLOBAL 安装：**
```bash
npx -y get-shit-done-cc@latest "$RUNTIME_FLAG" --global
```

**UNKNOWN 安装：**
```bash
npx -y get-shit-done-cc@latest --claude --global
```

如果安装失败，则展示错误并退出。

安装后清理更新缓存，避免状态栏继续显示旧的更新提示：

```bash
for dir in .claude .config/opencode .opencode .gemini .codex; do
  rm -f "./$dir/cache/gsd-update-check.json"
  rm -f "$HOME/$dir/cache/gsd-update-check.json"
done
```
</step>

<step name="display_result">
展示更新完成信息：

```
GSD 已更新：v1.5.10 -> v1.5.15

请重启当前 runtime，以加载新命令。

完整变更日志：
https://github.com/glittercowboy/get-shit-done/blob/main/CHANGELOG.md
```
</step>

<step name="check_local_patches">
更新完成后，检查安装器是否备份了本地修改：

查看配置目录中的 `gsd-local-patches/backup-meta.json`。

如果存在：
```
检测到本地 patch 已在更新前备份。
运行 /gsd:reapply-patches 可把你的修改重新合并到新版本中。
```

如果不存在，则正常结束。
</step>

</process>

<success_criteria>
- [ ] 已正确识别当前安装版本
- [ ] 已通过 npm 检查最新版本
- [ ] 若已是最新，则正确跳过更新
- [ ] 已在更新前展示 changelog
- [ ] 已展示干净安装覆盖范围
- [ ] 已取得用户确认
- [ ] 已成功执行更新
- [ ] 已提醒用户重启 runtime
</success_criteria>
