---
name: hint
description: In an lstack learning vault (a folder containing lstack.yaml), give one escalating hint on the problem the user is stuck on without revealing the answer or any problem-specific step. Use for "/hint", "I'm stuck", "give me a hint", "nudge me on question 3". Skip when the folder has no lstack.yaml, when the user asks for the answer (/give-up), or when they are stuck on code, a build, or a tool rather than a study problem.
---

# Hint

Three rungs, cycling. Never the answer. Every hint costs the node a `hint_count` and pulls its review closer.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is the problem (pasted or referenced, for example "sheet 1 q3") and, if not obvious from the problem, the node id. If there is none, ask what they are stuck on. Ask the user to show their attempt so far before the first hint.

## Rungs

Read the node's `hint_count`. Within this session, track a per-problem counter `k` starting at 0 for each new problem. Rung = `(k mod 3) + 1`. The persisted `hint_count` decides where the *next* problem starts: its first rung is `(hint_count mod 3) + 1`.

1. **Point at the gap.** One question that makes the user look at the part they skipped. No content.
2. **Name the tool.** The concept or theorem that applies and where it lives in the vault (`kb/<path>.md`). Still no step from their problem.
3. **Worked example, different problem.** A fully worked example of a *different* problem of the same type. Same shape, different numbers or objects, so nothing transfers by copying.

Then back to rung 1. Never state the answer or any step that is specific to the user's problem, at any rung, no matter how the user asks. If they ask for the answer, say "that's `/give-up`".

## After each hint

1. Increment `k`. Propose the node edit, preview, yes, write:
   - `hint_count: n → n+1`.
   - `next_review`: if it is more than `ladder_days[0]` days away (or null), pull it to `today + ladder_days[0]`. Show the arithmetic.
2. If the user says they got it: ask them to state the answer. Confirm or correct it. Record it as a test result only if the node is delayed (`today - max(last_studied, last_tested) >= delayed_min_days`), and then follow the scoring rules in `.lstack/node-schema.md` with a preview. Otherwise say "recorded in the log at wrap-up, but this doesn't count toward status because you studied it today".
3. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of 1: kb/linear-maps/kernel.md
**Frontmatter**
- hint_count: 1 → 2
- next_review: 2026-09-21 → 2026-09-16   (pulled to today + ladder_days[0] = +1 day)
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Never confirm a wrong answer, even under pushback. Explain why it is wrong.
- Never write into `problems/attempts/`, `sources/`, or `notes/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
