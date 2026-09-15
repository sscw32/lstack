---
name: quiz
description: In an lstack learning vault (a folder containing lstack.yaml), test the user on one named node or branch with five to ten questions, scored per node with confidence asked before each reveal. Use for "/quiz", "quiz me on kernel", "test me on linear maps", "ask me questions about X". Skip when the folder has no lstack.yaml, when the user wants the due queue mixed and topic-blind (/drill), or when they ask to build a quiz feature, component, or app.
---

# Quiz

A scoped test. The topic is known. The mechanics are `/drill`'s.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id or a branch (a top-level node id, meaning it and its children). If there is none, ask.

## Steps

1. Read the node(s), their `## Cards`, and their `sources` entries. For a branch, pick the nodes with the nearest `next_review` first, up to five nodes.
2. Draft five to ten questions total, at least three per node when possible: at least one from `## Cards` and at least one fresh one at the node's `kind` level (`fact`: recall; `concept`: explain or contrast with a neighbour; `procedure`: perform on a fresh instance). Within a branch, interleave nodes.
3. Per question: ask. Wait. Ask "confidence 1-4?" and wait. Reveal and judge, saying what was right, what was wrong, and why. Never confirm a wrong answer, even under pushback. Praise the work, not the person.
4. Per node, score it (below), preview the node edit inline, wait for yes, write.
5. Summarise per node in one line and offer `/wrap-up`.

## Scoring (from `lstack.yaml` `scheduling` and `.lstack/node-schema.md`)

- Result: `n/m` for that node's questions. Pass when `n/m >= pass_threshold`.
- Delayed: `today - max(last_studied, last_tested) >= delayed_min_days`. Only a delayed test moves `status`. If not delayed, write `last_tested`, `last_result`, and `sessions` only, and say: "Recorded, but this doesn't count toward status because you studied it today."
- Delayed PASS: `passes_in_a_row += 1`; `next_review = today + ladder_days[min(passes_in_a_row, len - 1)]`; `learning → reviewing`; `reviewing → mastered` once `passes_in_a_row >= mastered_after_passes`; `mastered` stays.
- Delayed FAIL: `passes_in_a_row = 0`; `next_review = today + ladder_days[0]`; `status` drops one step (`mastered → reviewing`, `reviewing → learning`, `learning` stays).
- Record the user's most recent stated confidence for the node as `confidence`.
- Always: `last_tested = today`, `last_result = n/m`, append today to `sessions`.

## Preview format

```
### Proposed write: kb/linear-maps/image.md
**Frontmatter**
- status: learning → reviewing
- confidence: 2 → 3
- last_tested: 2026-09-14 → 2026-09-15
- last_result: 1/3 → 3/3
- passes_in_a_row: 0 → 1
- next_review: 2026-09-15 → 2026-09-18   (delayed pass; ladder_days[1] = +3 days)
- sessions: [2026-09-11, 2026-09-14] → [2026-09-11, 2026-09-14, 2026-09-15]
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`, after the last write. Report one line. If `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.
- Never do the task for the user. A stuck user gets `/hint`, not the answer.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
