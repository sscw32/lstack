---
name: why-care
description: In an lstack learning vault (a folder containing lstack.yaml), write the "Why it matters" section of one node from the prereq graph and the mission. Use for "/why-care", "why does this matter", "what does kernel unlock", "motivate this topic for me". Skip when the folder has no lstack.yaml, when the user wants the concept explained (/explain), or when the question is about a product or business decision.
---

# Why care

Write one node's `## Why it matters` from what it unlocks in this vault and outside it.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id. If there is none, ask.

## Steps

1. Read the node, `kb/graph.md`, and `MISSION.md`. Collect the nodes that list this one in `prereqs` (its dependents).
2. Draft `## Why it matters` in three to six sentences covering:
   - what this node unlocks, naming the dependents from the graph by title;
   - what breaks or becomes impossible without it;
   - where it shows up outside this vault, tied to the `## Why` in `MISSION.md` when possible.
3. Preview the edit. If the section exists, show `-`/`+` lines. If not, add it in the position `node_sections` in `lstack.yaml` gives it.
4. Wait for yes. Write. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of 1: kb/linear-maps/kernel.md
**Body**
+ ## Why it matters
+ Rank-nullity and every injectivity argument in this vault start by asking what the kernel is. ...
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Do not change frontmatter here. Sessions are appended at `/wrap-up`.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
