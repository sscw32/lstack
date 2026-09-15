---
name: progress
description: In an lstack learning vault (a folder containing lstack.yaml), report status counts, calibration gaps, hint-heavy nodes, session streak, and what changed since the last report. Use for "/progress", "how am I doing", "show my stats", "what have I learned so far". Skip when the folder has no lstack.yaml, when the user wants today's queue (/today), or when "progress" refers to a progress bar or project status.
---

# Progress

Report. Write nothing.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

Optional. `questions` means: also concatenate every "Questions the user asked" section from `log/`, newest first, as one list.

## Steps

1. Run `node .lstack/lstack.mjs due --json` and read `kb/index.md`. If `lstack.yaml` says `node_available: false`, read the node files directly.
2. Report, short sections in this order:
   - **Counts** per status: new, learning, reviewing, mastered. One line.
   - **Calibration gaps**, ranked: nodes with confidence 3 or 4 and a last result below `pass_threshold`. Say "no gaps" if none.
   - **Most hints**: top three nodes by `hint_count`, with the count.
   - **Streak**: consecutive days with a `log/` file, counted back from the newest. Also sessions this week versus `schedule.sessions_per_week`.
   - **Since last time**: compare the newest log's `## Results` to the node frontmatter now. Name every node whose `status` changed and in which direction.
   - **Mission**: one sentence on progress toward `MISSION.md`'s success criteria and any date.
3. If the argument was `questions`, append the concatenated questions list.
4. Suggest one next action by skill name (`/drill`, `/explain <id>`, `/cards <id>`, `/recall <id>`). Do not run it.

## Rules

- No writes.
- Praise the work, not the person. Numbers over adjectives.
- No hooks, no sub-agents, no argument substitution.
