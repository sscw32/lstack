---
name: today
description: In an lstack learning vault (a folder containing lstack.yaml), show today's review queue with reasons and the session budget, then hand off to the skill the user picks. Use for "/today", "what should I study", "what's due", "plan my session". Skip when the folder has no lstack.yaml, when the user asks for a calendar or todo app, or when they want to start testing right away (/drill).
---

# Today

Present the queue. Write nothing.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

None. Ignore any text after the skill name unless it names a node, in which case skip to step 3 with that node.

## Steps

1. Run `node .lstack/lstack.mjs due --json`. If `lstack.yaml` says `node_available: false`, read `kb/today.md` instead and say the queue may be stale.
2. Present, in this order and with the reasons from the JSON:
   - **Due**, numbered, gap items first. For each: title, overdue days or "due today", confidence versus last result when there is a gap (`⚠`), hint count when above zero.
   - **Never tested**: nodes past `new` with no test on record.
   - **Frontier**: new nodes whose prerequisites are all `reviewing` or better. Say "nothing on the frontier yet" if empty.
   - **Blocked**: new nodes and the prerequisite that blocks each.
   - **Budget**: `minutes_per_session` and the suggested split (reviews plus new). Call it a heuristic.
   Tie the plan to `MISSION.md` in one sentence if a date there is close.
3. Ask which item to start. Hand off by name: `/drill` for the due list, `/explain <id>` for a frontier node, `/recall <id>` or `/quiz <id>` for a never-tested node. Do not start the other skill's work inside this one.

## Rules

- No writes. Not to nodes, not to logs.
- No hooks, no sub-agents, no argument substitution.
