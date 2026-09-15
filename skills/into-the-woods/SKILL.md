---
name: into-the-woods
description: In an lstack learning vault (a folder containing lstack.yaml), test the fine print of one node from its sources, asking about edge cases, theorem conditions, skipped proof steps, and notation the Summary and Cards do not cover. Use for "/into-the-woods", "go deeper on kernel", "test the details", "what am I missing in the fine print". Skip when the folder has no lstack.yaml, when the user wants the main idea tested (/quiz), or when "woods" is literal.
---

# Into the woods

Five questions on what the node's own material leaves out. Counts as a test.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id. If there is none, ask.

## Steps

1. Read the node's `sources` entries in `sources/`. If no source file exists, say the questions will come from your own knowledge and mark that in the log. Read the Summary and Cards to know what *not* to ask.
2. Draft five questions that the Summary and Cards do not answer: an edge case, a condition in a theorem's statement and what fails without it, the step in a proof that is usually skipped, a notation subtlety, a boundary between this node and a neighbour. Cite the source section each question comes from.
3. Per question: ask. Wait. Ask "confidence 1-4?" and wait. Reveal, judge, and say why. Never confirm a wrong answer, even under pushback. Praise the work, not the person.
4. Score (below). Preview the node edit. Wait for yes. Write.
5. Offer to add each missed item to `## Open questions` or as a card under `## Cards`, previewed as `+` lines. Yes writes them.
6. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so. Offer `/wrap-up`.

## Scoring (from `lstack.yaml` `scheduling` and `.lstack/node-schema.md`)

- Result: `n/5`. Pass when `n/5 >= pass_threshold`.
- Delayed: `today - max(last_studied, last_tested) >= delayed_min_days`. Only a delayed test moves `status`. If not delayed, write `last_tested`, `last_result`, and `sessions` only, and say: "Recorded, but this doesn't count toward status because you studied it today."
- Delayed PASS: `passes_in_a_row += 1`; `next_review = today + ladder_days[min(passes_in_a_row, len - 1)]`; `learning → reviewing`; `reviewing → mastered` once `passes_in_a_row >= mastered_after_passes`.
- Delayed FAIL: `passes_in_a_row = 0`; `next_review = today + ladder_days[0]`; `status` drops one step.
- Record the stated confidence. Always: `last_tested = today`, `last_result = n/5`, append today to `sessions`.

## Preview format

```
### Proposed write: kb/linear-maps.md
**Frontmatter**
- last_tested: 2026-09-14 → 2026-09-15
- last_result: 3/3 → 2/5
- confidence: 3 → 4
- sessions: [..., 2026-09-14] → [..., 2026-09-14, 2026-09-15]
   (not delayed: tested yesterday, so status and next_review are unchanged)
**Body**
+ - Does L(V, W) need V and W over the same field? (from 3.A)
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
