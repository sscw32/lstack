---
name: drill
description: In an lstack learning vault (a folder containing lstack.yaml), run today's spaced review as an interleaved, topic-blind test over the due nodes, scoring each node and scheduling its next review. Use for "/drill", "drill me", "let's do today's review", "test me on what's due". Skip when the folder has no lstack.yaml, when the user names one topic to be tested on (/quiz), when they want an explanation (/explain), or when "drill" refers to a tool or a database drill-down.
---

# Drill

The daily driver. Test what is due, mixed across branches, without naming the topic. Score per node, preview, write.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

Optional: a number of minutes to cap the session. Otherwise use `schedule.minutes_per_session` from `lstack.yaml`.

## Steps

1. Run `node .lstack/lstack.mjs due --json`. Take the `due` list in order up to the budget (about 10 minutes per node). If `lstack.yaml` says `node_available: false`, read `kb/today.md` instead. If nothing is due, say so and offer `/today`.
2. For each node pick three questions: at least one from `## Cards`, at least one fresh one at the node's `kind` level (`fact`: recall the definition or formula; `concept`: explain, or contrast with a neighbour node; `procedure`: perform it on a fresh instance you make up). Draft all questions before asking any.
3. Interleave. Never two consecutive questions from the same node. Shuffle across branches. Do not say which node a question belongs to, and do not announce the topic. Number the questions.
4. Per question: ask. Wait. Ask "confidence 1-4?" and wait. Then reveal the answer and judge theirs, saying plainly what was right, what was wrong, and why. Never confirm a wrong answer, even under pushback. Praise the work, not the person.
5. Per node, once its three questions are done, score it (below), preview the node edit inline, wait for yes, write. Then continue.
6. When the list is done, summarise results per node in one line each and offer `/wrap-up`.

## Scoring (from `lstack.yaml` `scheduling` and `.lstack/node-schema.md`)

- Result: `n/3`. Pass when `n/3 >= pass_threshold`. At the default 0.67 only 3/3 passes; say so if the user asks.
- Delayed: `today - max(last_studied, last_tested) >= delayed_min_days`. Only a delayed test moves `status`. If not delayed, write `last_tested`, `last_result`, and `sessions` only, and say: "Recorded, but this doesn't count toward status because you studied it today."
- Delayed PASS: `passes_in_a_row += 1`; `next_review = today + ladder_days[min(passes_in_a_row, len - 1)]`; `learning → reviewing`; `reviewing` stays until `passes_in_a_row >= mastered_after_passes`, then `→ mastered`; `mastered` stays.
- Delayed FAIL: `passes_in_a_row = 0`; `next_review = today + ladder_days[0]`; `status` drops one step (`mastered → reviewing`, `reviewing → learning`, `learning` stays).
- Record the user's stated confidence as `confidence` (the most recent value they gave for this node).
- Always: `last_tested = today`, `last_result = n/3`, append today to `sessions`.

## Preview format

```
### Proposed write: kb/linear-maps/kernel.md
**Frontmatter**
- status: learning → reviewing
- confidence: 3 → 4
- last_tested: 2026-09-12 → 2026-09-15
- last_result: 3/3 → 3/3
- passes_in_a_row: 1 → 2
- next_review: 2026-09-15 → 2026-09-22   (delayed pass; ladder_days[2] = +7 days)
- sessions: [..., 2026-09-12] → [..., 2026-09-12, 2026-09-15]
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`, after the last write. Report one line. If `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.
- Never do the task for the user. A stuck user gets `/hint`, not the answer.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
