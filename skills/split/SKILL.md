---
name: split
description: In an lstack learning vault (a folder containing lstack.yaml), split one node into child nodes in a sibling folder, leaving the parent file unchanged. Use for "/split", "break kernel into smaller nodes", "this node is too big", "make subtopics for X". Skip when the folder has no lstack.yaml, when the user wants to add material from a source (/add-source), or when "split" refers to code, strings, or files outside kb/.
---

# Split

Propose children for one node, write them beside it, and leave the parent file byte-identical unless the user asks for a pointer line.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a node id. If there is none, ask.

## Steps

1. Read the node, its sources, and its siblings.
2. Propose children as a table: id, title, kind, prereqs among the new children, and which sentences of the parent's Summary each child covers. Two to five children is typical.
3. Show the resulting folder: `kb/<path>/<id>/<child>.md` for each child. The folder is named after the parent's id and sits beside `<id>.md`.
4. Preview every child file in full (frontmatter per `.lstack/node-schema.md` with `status: new`, `confidence: null`, dates `null`, `sessions: []`, `sources` copied from the parent or `agent-proposed`; body with `# Title`, a `## Summary` ending `(agent draft)`, the other section headings empty, no cards).
5. Offer, as a separate optional write, one line appended to the parent's `## Summary`: `Children: [Title](id/child.md), ...`. Default is no. Without that line the parent is not touched at all.
6. Wait for yes. Write. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of N: kb/linear-maps/kernel/null-space-of-a-matrix.md (new file)
<full contents>
```

Reply **yes** to write all, **no** to skip all, or name what to change.

## Rules

- Never move or rename the parent. Prereq edges pointing at the parent keep resolving.
- Child ids are unique across the whole vault, lowercase, `a-z0-9-`.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
