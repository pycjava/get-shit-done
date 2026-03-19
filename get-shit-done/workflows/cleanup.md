<purpose>
把已完成里程碑的阶段目录归档到 `.planning/milestones/v{X.Y}-phases/`。识别每个已完成里程碑包含哪些阶段，先展示 dry-run 摘要，确认后再移动目录。
</purpose>

<required_reading>
1. `.planning/MILESTONES.md`
2. `.planning/milestones/` 目录列表
3. `.planning/phases/` 目录列表
</required_reading>

<process>

<step name="identify_completed_milestones">
读取 `.planning/MILESTONES.md`，识别所有已完成里程碑及其版本号。

```bash
cat .planning/MILESTONES.md
```

提取每个里程碑版本号，例如 `v1.0`、`v1.1`、`v2.0`。

检查哪些里程碑归档目录已经存在：

```bash
ls -d .planning/milestones/v*-phases 2>/dev/null
```

只保留那些**尚未**拥有 `-phases` 归档目录的已完成里程碑。

如果所有已完成里程碑都已经归档：

```
所有已完成里程碑的阶段目录都已归档，无需清理。
```

在这里结束。
</step>

<step name="determine_phase_membership">
对每个尚未归档的已完成里程碑，读取其归档的 `ROADMAP` 快照，判断属于它的阶段：

```bash
cat .planning/milestones/v{X.Y}-ROADMAP.md
```

从归档路线图中提取阶段号和阶段名，例如 `Phase 1: Foundation`、`Phase 2: Auth`。

再检查这些阶段目录是否仍然存在于 `.planning/phases/`：

```bash
ls -d .planning/phases/*/ 2>/dev/null
```

将阶段目录和里程碑做匹配。只纳入那些当前仍存在于 `.planning/phases/` 下的目录。
</step>

<step name="show_dry_run">
为每个里程碑展示 dry-run 摘要：

```
## 清理摘要

### v{X.Y} - {Milestone Name}
以下阶段目录将被归档：
- 01-foundation/
- 02-auth/
- 03-core-features/

目标目录：.planning/milestones/v{X.Y}-phases/

### v{X.Z} - {Milestone Name}
以下阶段目录将被归档：
- 04-security/
- 05-hardening/

目标目录：.planning/milestones/v{X.Z}-phases/
```

如果没有任何阶段目录需要归档：

```
没有找到可归档的阶段目录。它们可能已被移动或之前已经归档。
```

在这里结束。

AskUserQuestion: “是否继续归档？” 选项为：“是 - 归档以上阶段” | “取消”

如果选择“取消”：结束。
</step>

<step name="archive_phases">
对每个里程碑移动对应阶段目录：

```bash
mkdir -p .planning/milestones/v{X.Y}-phases
```

对属于该里程碑的每个阶段目录执行：

```bash
mv .planning/phases/{dir} .planning/milestones/v{X.Y}-phases/
```

对 cleanup 集合中的所有里程碑重复这一过程。
</step>

<step name="commit">
提交改动：

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "chore: archive phase directories from completed milestones" --files .planning/milestones/ .planning/phases/
```
</step>

<step name="report">
```
已归档：
{For each milestone}
- v{X.Y}: {N} 个阶段目录 -> .planning/milestones/v{X.Y}-phases/

.planning/phases/ 已清理完成。
```
</step>

</process>

<success_criteria>
- [ ] 已识别所有尚未归档阶段目录的已完成里程碑
- [ ] 已根据归档 `ROADMAP` 快照确定阶段归属
- [ ] 已展示 dry-run 摘要并获得用户确认
- [ ] 已将阶段目录移动到 `.planning/milestones/v{X.Y}-phases/`
- [ ] 已提交改动
</success_criteria>
