---
name: explain
description: In an lstack learning vault (a folder containing lstack.yaml), explain one node from its sources in plain, intuition, or formal mode, pausing for recall questions and ending with one retrieval question. Use for "/explain", "explain kernel", "teach me X", "walk me through this node", "I don't get Y". Skip when the folder has no lstack.yaml, when the user wants to be tested (/quiz, /drill), or when they ask to explain code or an error message.
---

# Explain

Teach one node at a time, from its sources, with retrieval built in. Mark the node as studied only after a yes.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id or a phrase, plus an optional mode `plain`, `intuition`, or `formal`. Resolve a phrase to a node by title or `## Terms`. If nothing matches, say "no node yet" and offer `/add-source`. If there is no argument, ask. Default mode: `plain`, or `formal` when `lstack.yaml` voice has `verbosity: thorough` and `register: formal`.

## Steps

1. Read the node file, its `sources` entries in `sources/`, and its prereqs' Summaries. Do not explain from memory alone when a source exists; cite the source section you used.
2. Explain in at most about five paragraphs.
   - `plain`: the idea in everyday words, one worked example, one common confusion.
   - `intuition`: lead with the node's `## Analogies` entry (or propose one), then "when would you reach for this", then the idea.
   - `formal`: the source's definitions and notation, one theorem or property with its conditions stated, one example.
3. Every three to five paragraphs stop and ask one recall or self-explanation question ("say back the definition", "why did that step need the prereq?"). Wait for the answer. Correct it if wrong; never confirm a wrong answer.
4. End with exactly one retrieval question about the node. Wait for the answer and judge it. This is not a test for status; say so if asked.
5. Propose the node edit, preview, yes, write:
   - `status: new → learning` if the node was `new`.
   - `last_studied: <old> → <today>`.
   - `sessions`: append today if not present.
   - Any analogy, term, or heuristic that came up and is worth keeping, as `+` body lines under the right section.
6. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of 1: kb/linear-maps/kernel.md
**Frontmatter**
- status: new → learning
- last_studied: null → 2026-09-15
- sessions: [] → [2026-09-15]
**Body**
+ ## Analogies
+ - The kernel is what the map flattens to a point.
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Never change `status` beyond `new → learning`, and never touch `confidence`, `last_tested`, `last_result`, `next_review`, or `passes_in_a_row`.
- Praise the work, not the person.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
