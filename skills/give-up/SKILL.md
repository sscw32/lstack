---
name: give-up
description: In an lstack learning vault (a folder containing lstack.yaml), reveal the full answer to the current problem and record a gave-up result on the node. Use for "/give-up", "just tell me the answer", "I give up", "show me the solution". Skip when the user wants a nudge (/hint), when no problem is in play, or when "give up" is about abandoning a project or plan.
disable-model-invocation: true
---

# Give up

Reveal, explain, record the fail, and point at the prerequisite to review. The only skill that shows an answer.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`.

## Argument

The text after the skill name in the user's message is optional. The problem is the one in play from `/hint`, `/drill`, or `/quiz`. If none is in play, ask which problem and which node.

## Steps

1. Say once, plainly, that this records a gave-up result on the node. Then reveal the full answer with a short explanation of each step. Point at the exact place their attempt (if they showed one) went off.
2. Propose the node edit, preview, yes, write. Read `scheduling` from `lstack.yaml`:
   - `last_tested: <old> → <today>`.
   - `last_result: <old> → gave-up`.
   - `passes_in_a_row: n → 0`.
   - `next_review: <old> → today + ladder_days[0]`.
   - `status`: one step down (`mastered → reviewing`, `reviewing → learning`, `learning` stays `learning`, `new → learning`). If the node is not delayed (`today - max(last_studied, last_tested) < delayed_min_days`), leave `status` unchanged and say "recorded, but this doesn't count toward status because you studied it today".
   - `sessions`: append today if absent.
3. Name the prerequisite node to review next: the one from `prereqs` whose Summary covers the step they missed. If no prereq fits, name the node itself and suggest `/explain <id>`.
4. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so. Note the result for `/wrap-up`'s log entry.

## Preview format

```
### Proposed write 1 of 1: kb/vector-spaces/span.md
**Frontmatter**
- last_tested: 2026-09-12 → 2026-09-15
- last_result: 1/3 → gave-up
- passes_in_a_row: 0 → 0
- next_review: 2026-09-13 → 2026-09-16   (today + ladder_days[0] = +1 day)
- status: learning → learning
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Never write into `problems/attempts/`, `sources/`, or `notes/`. Never edit generated files.
- Praise the work, not the person. No consolation prose.
- No hooks, no sub-agents, no argument substitution.
