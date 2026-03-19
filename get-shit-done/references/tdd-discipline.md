<discipline>

每个原子任务都遵循三步纪律：**DEFINE -> IMPLEMENT -> VERIFY + SELF-CHECK**。

这不是完整 TDD（不要求必须先写失败测试），但它是一种*测试驱动纪律*：在你开始实现之前，必须先知道“完成”长什么样，而且要能用可验证、可运行的方式表达出来。

</discipline>

<step name="DEFINE - before writing a single line">

开始实现前，在你的推理里明确说清楚：

1. **可观察结果是什么？** 不是“创建了某个文件”，而是“路径 X 上存在文件，内容包含 Y，命令 Z 返回 exit 0”
2. **精确的验证命令是什么？** 现在就写出来。如果现在写不出来，说明你还没真正理解这个任务。
3. **可能的失败模式是什么？** 哪些情况会导致它“看似完成，实际上是错的”？

**门禁：** 如果这三项你答不全，就**不要开始实现**。回去重读任务和 plan，直到能答清楚。

**格式：** 在编码前，至少要在心里或推理里形成下面这个结构：
```
BEFORE:
  outcome: [file/API/state that proves done]
  verify:  [exact command(s) to confirm]
  risks:   [what could be wrong even if it "works"]
```

</step>

<step name="IMPLEMENT - minimal, focused">

- 只实现当前任务真正要求的内容，不要膨胀范围
- 如果发现计划外工作：应用 deviation rules（Rule 1-4），不要静默扩展范围
- 记录你触碰过的每一个文件

</step>

<step name="VERIFY - run the verification you defined in DEFINE">

运行你在 DEFINE 阶段写下的**那条精确验证命令**，不要临时换一条。

- **Pass：** 进入 SELF-CHECK
- **Fail：** 调试并修复，不通过就不能标记完成
- **Cannot verify：** 立刻停止，向用户暴露为 checkpoint，不要假装已完成

</step>

<step name="SELF-CHECK - mandatory before commit">

验证通过后，再花 30 秒做一次自查：

| Question | Check |
|---|---|
| 输出是否与 plan 的 `done-criteria` 完全一致？ | ✅ / ❌ |
| 我是否改了任务列表外的文件？ | ✅ explain / ✅ ok |
| 这会不会破坏下游内容？ | ✅ investigate / ✅ ok |
| commit message 是否诚实，而不是理想化描述？ | ✅ / ❌ |

**如果有任何一项是问题态，先修再提交。** 不要把已知缺口带进 commit。

把 self-check 结果写进 commit body 或 `SUMMARY.md`。如果 `SUMMARY` 里出现 `## Self-Check: FAILED`，orchestrator 会抓到。

</step>

<tdd_code_plans>

对于 `type: tdd` 的 plan，除了上面的纪律外，还要完整执行 `RED-GREEN-REFACTOR`：

1. **RED：** 写一个描述行为的失败测试 -> 提交 `test(...)` -> **必须失败**
2. **GREEN：** 用最小实现让它通过 -> 提交 `feat(...)` -> **必须通过**
3. **REFACTOR：** 如有必要再清理 -> 提交 `refactor(...)` -> 测试**必须仍然通过**

参考：`@~/.claude/get-shit-done/references/tdd.md`

这套流程是在 `DEFINE -> IMPLEMENT -> VERIFY + SELF-CHECK` 之上的补充，不是替代。

</tdd_code_plans>

<when_to_apply>

**所有任务都适用：** `DEFINE -> IMPLEMENT -> VERIFY + SELF-CHECK`

**额外适用于 `type: tdd` 任务：** `RED -> GREEN -> REFACTOR`（见 `tdd.md`）

**验证捷径：** 如果任务的 `<acceptance_criteria>` 已经明确列出了精确验证命令，那就直接把它拿来作为 DEFINE 的输出，不必重复推导。但你**仍然必须执行**这些命令。

</when_to_apply>

<anti_patterns>

- **先实现，再验证**：违反 DEFINE，本质是在猜，不是在工程化执行
- **“应该能跑”**：没跑验证命令之前，这只是幻想
- **静默扩张范围**：deviation rules 的意思是“记录并按规则处理”，不是“默默做掉”
- **理想化提交**：commit message 要描述真实发生了什么，而不是原本打算做什么
- **跳过 self-check**：这 30 秒通常能帮你省掉后面几小时的返工

</anti_patterns>
