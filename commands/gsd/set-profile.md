---
name: gsd:set-profile
description: 切换 GSD agents 的模型档位（quality / balanced / budget / inherit）
argument-hint: <档位（quality|balanced|budget|inherit）>
model: haiku
allowed-tools:
  - Bash
---

把下面这段输出原样展示给用户，不要追加任何说明：

!`node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" config-set-model-profile $ARGUMENTS --raw`
