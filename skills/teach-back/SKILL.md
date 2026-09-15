---
name: teach-back
description: In an lstack learning vault (a folder containing lstack.yaml), play a curious student who does not know the topic while the user teaches it, then grade where the explanation held and broke. Use for "/teach-back", "let me teach you kernel", "pretend you don't know this", "Feynman technique on X". Skip when the folder has no lstack.yaml, when the user wants to be taught (/explain), or when they want a role-play unrelated to a node.
---

# Teach back

The user teaches. You are the student. Stay in character until convinced or stopped, then grade.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id. If there is none, ask.

## Steps

1. Read the node, its Cards, and its sources so you know what a complete explanation contains. Then set that aside and ask, in character: "Okay, I've never heard of <title>. What is it?"
2. Stay a curious student in this same conversation. Ask naive questions. Ask for an example. Ask "why?" until the explanation bottoms out in something the student can accept. Push on anything vague ("what do you mean by 'basically'?") and anything wrong ("wait, earlier you said X, now you're saying Y"). Do not teach, do not correct, do not supply terms. If the user asks you to break character, do so.
3. Stop when the student is convinced (every key point in the Summary has been explained in a way the student could repeat) or when the user says stop.
4. Drop character. Ask "confidence 1-4?" and wait. Then report:
   - **Held**: where the explanation was clear and correct.
   - **Broke**: where it went vague, circular, or wrong, with the correction. Never confirm a wrong claim, even under pushback.
   - Pass or fail (below).
5. Preview the node edit. Wait for yes. Write. Each break point becomes one proposed card under `## Cards`, previewed as `+` lines. Yes writes them.
6. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so. Offer `/wrap-up`.

## Scoring (from `lstack.yaml` `scheduling` and `.lstack/node-schema.md`)

- Result: `pass` when the student was convinced with no uncorrected wrong claim, else `fail`.
- Delayed: `today - max(last_studied, last_tested) >= delayed_min_days`. Only a delayed test moves `status`. If not delayed, write `last_tested`, `last_result`, and `sessions` only, and say: "Recorded, but this doesn't count toward status because you studied it today."
- Delayed PASS: `passes_in_a_row += 1`; `next_review = today + ladder_days[min(passes_in_a_row, len - 1)]`; `learning → reviewing`; `reviewing → mastered` once `passes_in_a_row >= mastered_after_passes`.
- Delayed FAIL: `passes_in_a_row = 0`; `next_review = today + ladder_days[0]`; `status` drops one step.
- Record the stated confidence. Always: `last_tested = today`, `last_result = pass|fail`, append today to `sessions`.

## Preview format

```
### Proposed write: kb/linear-maps/kernel.md
**Frontmatter**
- last_tested: 2026-09-12 → 2026-09-15
- last_result: 3/3 → pass
- passes_in_a_row: 1 → 2
- next_review: 2026-09-15 → 2026-09-22   (delayed pass; ladder_days[2] = +7 days)
- sessions: [2026-09-09, 2026-09-12] → [2026-09-09, 2026-09-12, 2026-09-15]
**Body**
+ Why does T(v) = T(w) force v - w into the kernel?::Linearity gives T(v - w) = T(v) - T(w) = 0
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Praise the work, not the person.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution. The student runs in this thread.
