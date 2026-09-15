---
name: check-source
description: In an lstack learning vault (a folder containing lstack.yaml), read one source file, note, or node against the other sources and report suspected errors with confidence levels, without editing the file. Use for "/check-source", "is this chapter wrong anywhere", "check my notes for mistakes", "does this node contradict the book". Skip when the folder has no lstack.yaml, when the user wants structural lint (/lint-vault), or when the file is source code.
---

# Check source

Find what looks wrong in one file. Report. Never edit the file.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a file in `sources/` or `notes/`, or a node id. If there is none, ask.

## Steps

1. Read the file. Read every other file in `sources/` that covers the same topic (match by the nodes' `sources` citations and by terms). Read the related nodes' Summaries and Terms.
2. For each suspected error report, in this shape, one block per claim:
   - **Claim**: the sentence or formula, quoted.
   - **Why it looks wrong**: one or two sentences.
   - **What the other source says**: quote and cite, or "no other source covers this; from my own knowledge".
   - **Confidence**: low, medium, or high.
   Report nothing if nothing looks wrong, and say which sources you compared.
3. If the file is in `notes/`, also flag text that would make a good node addition and say `/add-source` or a node edit could take it. Do not write it here.
4. Offer to add each medium or high finding as an `## Open questions` entry on the related node. Preview per node. Wait for yes. Write. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of 1: kb/vector-spaces/span.md
**Body**
+ - lecture-2.md says a spanning list is always independent; Axler 2.A gives (1,0),(0,1),(1,1) as a spanning dependent list. Which is right?
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Never edit anything in `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- Never claim a source is wrong at high confidence from memory alone. Memory-only findings are low or medium.
- No hooks, no sub-agents, no argument substitution.
