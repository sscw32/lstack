---
name: log-session
description: In an lstack learning vault (a folder containing lstack.yaml), record study the user did away from the agent, grading pasted evidence when there is any, and write an offline log entry. Use for "/log-session", "I studied X on paper yesterday", "log this session", "here's the problem set I did". Skip when the folder has no lstack.yaml, when the session happened in this conversation (/wrap-up), or when the user means an application log.
---

# Log session

Offline study becomes a log entry and node touches. Status moves only on gradable evidence.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is free text describing what was studied, when, and for how long, optionally with pasted evidence (solved problems, a written explanation, an image). If there is none, ask what they studied and whether they have anything to show.

## Steps

1. Map the description to nodes by id, title, or `## Terms`. Ask if a mention does not resolve. A topic with no node is proposed as a new node, `status: new`, marked `agent-proposed` unless the user names a source.
2. **From the description alone**, propose:
   - `sessions`: append the study date to each node touched;
   - `last_studied: <old> → <date>`;
   - `confidence` only if the user stated a number;
   - new `sources` entries the user named;
   - aha lines under `## Aha`, notes the user dictated under the right section;
   - `status: new → learning` for a node that was `new`.
   Never any other `status` change, and never `last_tested`, `last_result`, `next_review`, or `passes_in_a_row` from a description.
3. **If evidence is present and gradable**, grade it against the node's Summary, Cards, and sources. Show the grading: each item right or wrong with one line of why, then the ratio `n/m`. Treat it as a test per the scoring block. Say whether it is delayed and therefore counts.
4. **After a description-only log**, offer a two-minute check now: three questions on the node, confidence before each reveal, scored per the block below. Accept a no without argument.
5. Build a log entry `log/<date>-<n>.md` with `mode: offline`, `skills: [log-session]`, the nodes, minutes if stated, `## Covered` from the description, `## Results` from any grading, `## Aha`, `## Changes written`, `## Open threads`. Every heading appears even if empty.
6. Show one numbered batch preview of every node edit and the log file. Wait for yes. Write. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Scoring for graded evidence (from `lstack.yaml` `scheduling` and `.lstack/node-schema.md`)

- Pass when `n/m >= pass_threshold`. Delayed when `test date - max(last_studied, last_tested) >= delayed_min_days`, using the dates on record before this log. Only a delayed test moves `status`; otherwise write `last_tested`, `last_result`, `sessions` and say "recorded, but this doesn't count toward status".
- Delayed PASS: `passes_in_a_row += 1`; `next_review = date + ladder_days[min(passes_in_a_row, len - 1)]`; `learning → reviewing`; `reviewing → mastered` once `passes_in_a_row >= mastered_after_passes`.
- Delayed FAIL: `passes_in_a_row = 0`; `next_review = date + ladder_days[0]`; `status` drops one step.

## Preview format

```
### Proposed write 1 of 2: kb/vector-spaces/basis.md
**Frontmatter**
- last_studied: 2026-09-08 → 2026-09-14
- sessions: [2026-09-08] → [2026-09-08, 2026-09-14]
**Body**
+ - 2026-09-14: extending an independent list is the same move as reducing a spanning one, run backwards

### Proposed write 2 of 2: log/2026-09-14-1.md (new file)
<full contents>
```

Reply **yes** to write all, **no** to skip all, or name what to change.

## Rules

- Never rewrite an existing log file.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
