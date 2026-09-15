---
name: recall
description: In an lstack learning vault (a folder containing lstack.yaml), run a free-recall test where the user writes everything they remember about one node before any comparison. Use for "/recall", "let me brain-dump kernel", "free recall on X", "I'll write what I remember". Skip when the folder has no lstack.yaml, when the user wants questions asked (/quiz), or when "recall" refers to memory in code or a product recall.
---

# Recall

Free recall, uninterrupted, then a hit-and-miss comparison and a scored result.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id. If there is none, ask.

## Steps

1. Say: "Write everything you remember about <title>. Don't look anything up. Say done when finished." Then say nothing until the user says done. Do not prompt, do not hint, do not react to partial text.
2. Ask "confidence 1-4?" and wait.
3. Read the node's Summary, Terms, and Cards. Compare. List, one line each:
   - **Hit**: key points they stated correctly.
   - **Missed**: key points in the node they did not mention.
   - **Wrong**: statements that contradict the node or its sources, with the correction. Never let a wrong statement pass, even under pushback.
4. Score (below). Preview the node edit. Wait for yes. Write.
5. Offer to add each missed item as a card, previewed as `+` lines under `## Cards`. Yes writes them.
6. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so. Offer `/wrap-up`.

## Scoring (from `lstack.yaml` `scheduling` and `.lstack/node-schema.md`)

- Result: `hit / (hit + missed)` over the Summary's key points, written as `n/m`. Any Wrong item counts against a hit. Pass when `n/m >= pass_threshold`.
- Delayed: `today - max(last_studied, last_tested) >= delayed_min_days`. Only a delayed test moves `status`. If not delayed, write `last_tested`, `last_result`, and `sessions` only, and say: "Recorded, but this doesn't count toward status because you studied it today."
- Delayed PASS: `passes_in_a_row += 1`; `next_review = today + ladder_days[min(passes_in_a_row, len - 1)]`; `learning → reviewing`; `reviewing → mastered` once `passes_in_a_row >= mastered_after_passes`.
- Delayed FAIL: `passes_in_a_row = 0`; `next_review = today + ladder_days[0]`; `status` drops one step.
- Record the stated confidence. Always: `last_tested = today`, `last_result = n/m`, append today to `sessions`.

## Preview format

```
### Proposed write: kb/vector-spaces/basis.md
**Frontmatter**
- status: learning → reviewing
- confidence: 2 → 3
- last_tested: null → 2026-09-15
- last_result: null → 4/5
- passes_in_a_row: 0 → 1
- next_review: null → 2026-09-18   (delayed pass; ladder_days[1] = +3 days)
- sessions: [2026-09-08] → [2026-09-08, 2026-09-15]
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Praise the work, not the person.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
