---
description: 在 GSD 更新后重新套用本地修改
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

<purpose>
当 GSD 更新过程覆盖并重装文件后，这个命令会把用户之前备份的本地修改合并回新版本。它会尽量智能比较上下游变化，处理“用户改过、上游也改过”的情况。
</purpose>

<process>

## 步骤 1：检测备份的 patch

检查本地 patches 目录：

```bash
# 全局安装：检测运行时配置目录
if [ -d "$HOME/.config/opencode/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.config/opencode/gsd-local-patches"
elif [ -d "$HOME/.opencode/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.opencode/gsd-local-patches"
elif [ -d "$HOME/.gemini/gsd-local-patches" ]; then
  PATCHES_DIR="$HOME/.gemini/gsd-local-patches"
else
  PATCHES_DIR="$HOME/.claude/gsd-local-patches"
fi
# 本地安装兜底：检查所有运行时目录
if [ ! -d "$PATCHES_DIR" ]; then
  for dir in .config/opencode .opencode .gemini .claude; do
    if [ -d "./$dir/gsd-local-patches" ]; then
      PATCHES_DIR="./$dir/gsd-local-patches"
      break
    fi
  done
fi
```

读取 patches 目录中的 `backup-meta.json`。

**如果没找到 patch：**

```
没有找到本地 patch，无需重新套用。

当你修改过 GSD 的 workflow、command 或 agent 文件后运行 /gsd:update，
这些本地修改会被自动备份。
```

然后退出。

## 步骤 2：展示 patch 摘要

```markdown
## 待重新套用的本地补丁

**备份来源版本：** v{from_version}
**当前版本：** {read VERSION file}
**涉及文件数：** {count}

| # | 文件 | 状态 |
|---|------|------|
| 1 | {file_path} | 待处理 |
| 2 | {file_path} | 待处理 |
```

## 步骤 3：逐文件合并

对 `backup-meta.json` 中的每个文件：

1. 读取备份版本（用户修改过的副本）
2. 读取当前新安装版本
3. 对比并合并

**合并策略：**
- 如果新文件与备份文件完全一致：跳过，说明上游已经吸收了改动
- 如果不同：识别用户的本地修改，并尝试把它们重新套到新版本

细则：
- 完整读取两个版本
- 识别用户新增或修改的区块，而不是只做机械 diff
- 将用户改动迁移到新版本
- 如果某段内容用户和上游都改过：标记为冲突，展示两边，让用户决定保留哪边

4. 把合并结果写回安装位置
5. 汇报处理状态：
   - `Merged`：用户改动已顺利合并
   - `已跳过`：改动已被上游吸收
   - `Conflict`：由用户手动裁决后解决

## 步骤 4：更新 manifest

重新套用后，需要让后续更新能正确识别这些文件仍是“用户做过本地修改”的状态。

```bash
# manifest 会在下次 /gsd:update 时重建
# 这里先只记录哪些文件被改回去了
```

## 步骤 5：询问是否清理 patch 备份

询问用户：
- `保留 patch 备份供后续参考`
- `清理 patch 备份`

如果用户选择清理，则删除 `gsd-local-patches/`。

## 步骤 6：结果汇报

```markdown
## Patch 重新套用完成

| # | 文件 | 状态 |
|---|------|------|
| 1 | {file_path} | ✓ Merged |
| 2 | {file_path} | ○ 已跳过（上游已吸收） |
| 3 | {file_path} | ⚠ Conflict resolved |

共更新 {count} 个文件。你的本地修改已经重新生效。
```

</process>

<success_criteria>
- [ ] 所有备份 patch 都已处理
- [ ] 用户本地修改已重新合并到新版本
- [ ] 如有冲突，已通过用户输入解决
- [ ] 每个文件都有清晰状态汇报
</success_criteria>
