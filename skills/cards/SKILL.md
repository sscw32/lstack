---
name: cards
description: In an lstack learning vault (a folder containing lstack.yaml), propose five to fifteen spaced-repetition cards for one node in Obsidian syntax and write them under its Cards section. Use for "/cards", "make flashcards for kernel", "add cards to this node", "turn my notes into cards". Skip when the folder has no lstack.yaml, when the user wants to be quizzed now (/quiz), or when "cards" means UI cards, payment cards, or a card game.
---

# Cards

Write retrieval prompts for one node, following `.lstack/card-writing.md`.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id. If there is none, ask.

## Steps

1. Read the node's Summary, Terms, Heuristics, existing `## Cards`, and its `sources` entries. Read `.lstack/card-writing.md`.
2. Draft five to fifteen new cards. Rules from the rubric, applied literally:
   - one idea per card; no yes/no questions; no answer that is a verbatim Summary sentence;
   - `kind: concept` gets at least two lenses (definition, contrast with a neighbour node, when to use, a consequence);
   - `kind: procedure` gets at least one "given this input, what's the first step" card;
   - skip any card whose question already exists in `## Cards`;
   - if you cannot write two honest cards, say the node is probably a `fact` and propose one or two.
3. Use the four forms as fits: `Question::Answer`, `A:::B`, multi-line with a `?` line, cloze with `==text==`. Leave existing `<!--SR:...-->` comments untouched.
4. Preview as `+` lines appended to `## Cards`. Wait for yes. Write.
5. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line and fix any "card line matches none of the four forms" warning before finishing. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of 1: kb/linear-maps/kernel.md
**Body**
+ Why is ker T a subspace of V and not of W?::Its elements are inputs, and the three subspace checks pass because T is linear
+ Given T(x, y, z) = (x + y, y + z), what is the first step to find ker T?::Set both coordinates to 0 and solve the system
```

Reply **yes** to write, **no** to skip, or name what to change.

## Rules

- Do not change frontmatter here. Sessions are appended at `/wrap-up`.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
