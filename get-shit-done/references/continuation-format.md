# 续接格式

用于在一个命令或 workflow 完成后，向用户展示“下一步该做什么”的标准格式。

## 核心结构

```
---

## ▶ Next Up

**{identifier}: {name}** — {one-line description}

`{command to copy-paste}`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- `{alternative option 1}` — description
- `{alternative option 2}` — description

---
```

## 格式规则

1. **永远说明这是什么**：要有名字和一句说明，不能只给命令
2. **从源头提取上下文**：phase 用 `ROADMAP.md`，plan 用 `PLAN.md` 的 `<objective>`
3. **命令使用 inline code**：用反引号，方便复制，也更容易被渲染成可点击
4. **始终解释 `/clear`**：不仅写“先 `/clear`”，还要顺手说明为什么
5. **用 “Also available” 而不是 “Other options”**：语气更像产品，而不是附带说明
6. **用 `---` 做视觉分隔**：让下一步建议从正文里凸出来

## 变体

### 执行下一个 Plan

```
---

## ▶ Next Up

**02-03: Refresh Token Rotation** — Add /api/auth/refresh with sliding expiry

`/gsd:execute-phase 2`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- Review plan before executing
- `/gsd:list-phase-assumptions 2` — check assumptions

---
```

### 执行该 Phase 的最后一个 Plan

在卡片里额外说明这是最后一个 plan，以及后续会发生什么：

```
---

## ▶ Next Up

**02-03: Refresh Token Rotation** — Add /api/auth/refresh with sliding expiry
<sub>Final plan in Phase 2</sub>

`/gsd:execute-phase 2`

<sub>`/clear` first -> fresh context window</sub>

---

**After this completes:**
- Phase 2 -> Phase 3 transition
- Next: **Phase 3: Core Features** — User dashboard and settings

---
```

### 规划某个 Phase

```
---

## ▶ Next Up

**Phase 2: Authentication** — JWT login flow with refresh tokens

`/gsd:plan-phase 2`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- `/gsd:discuss-phase 2` — gather context first
- `/gsd:research-phase 2` — investigate unknowns
- Review roadmap

---
```

### Phase 完成，准备进入下一个

先显示完成状态，再显示下个动作：

```
---

## ✓ Phase 2 Complete

3/3 plans executed

## ▶ Next Up

**Phase 3: Core Features** — User dashboard, settings, and data export

`/gsd:plan-phase 3`

<sub>`/clear` first -> fresh context window</sub>

---

**Also available:**
- `/gsd:discuss-phase 3` — gather context first
- `/gsd:research-phase 3` — investigate unknowns
- Review what Phase 2 built

---
```

### 多个选项同等重要

如果没有绝对优先的主动作：

```
---

## ▶ Next Up

**Phase 3: Core Features** — User dashboard, settings, and data export

**To plan directly:** `/gsd:plan-phase 3`

**To discuss context first:** `/gsd:discuss-phase 3`

**To research unknowns:** `/gsd:research-phase 3`

<sub>`/clear` first -> fresh context window</sub>

---
```

### Milestone 完成

```
---

## 🎉 Milestone v1.0 Complete

All 4 phases shipped

## ▶ Next Up

**Start v1.1** — questioning -> research -> requirements -> roadmap

`/gsd:new-milestone`

<sub>`/clear` first -> fresh context window</sub>

---
```

## 如何抽取上下文

### 对于 Phase（从 ROADMAP.md）：

```markdown
### Phase 2: Authentication
**Goal**: JWT login flow with refresh tokens
```

抽取后应显示为：`**Phase 2: Authentication** — JWT login flow with refresh tokens`

### 对于 Plan（从 ROADMAP.md 或 PLAN.md）：

```markdown
Plans:
- [ ] 02-03: Add refresh token rotation
```

或者从 `PLAN.md` 的 `<objective>`：

```xml
<objective>
Add refresh token rotation with sliding expiry window.

Purpose: Extend session lifetime without compromising security.
</objective>
```

抽取后应显示为：`**02-03: Refresh Token Rotation** — Add /api/auth/refresh with sliding expiry`

## 反模式

### 不要：只有命令，没有上下文

```
## To Continue

Run `/clear`, then paste:
/gsd:execute-phase 2
```

用户根本不知道 `02-03` 是什么。

### 不要：只说 `/clear`，不解释原因

```
`/gsd:plan-phase 3`

Run /clear first.
```

这没有解释为什么要这样做，用户很可能直接跳过。

### 不要：用 “Other options”

```
Other options:
- Review roadmap
```

这会让其他选项像附属品。统一用 `Also available:`。

### 不要：把命令放进 fenced code block

```
```
/gsd:plan-phase 3
```
```

模板里使用 fenced block 会制造嵌套歧义。命令应该使用 inline backticks。
