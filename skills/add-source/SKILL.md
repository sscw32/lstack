---
name: add-source
description: In an lstack learning vault (a folder containing lstack.yaml), read a new file in sources/ and propose new nodes, new prereq edges, and edits to existing nodes. Use for "/add-source", "I added a new chapter to sources", "propose nodes from this file", "what's uncited in sources". Skip when the folder has no lstack.yaml, when the user wants to check a source for errors (/check-source), or when the file is a code dependency.
---

# Add source

Turn one new source file into proposed tree changes, then write only after a yes.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is a file in `sources/`. If there is none, run `node .lstack/lstack.mjs lint` and list the `sources/` files it reports as cited by no node. Ask which one to add.

## Steps

1. Read the file. Read `kb/index.md` and the existing nodes in the branch it most likely belongs to.
2. Propose, as one table with columns id, title, kind, parent, prereqs, source:
   - new nodes, each with `status: new` and a two-sentence Summary ending `(agent draft)`;
   - edits to existing nodes: new `## Terms` entries, new cards, new `prereqs` edges, a new `sources` citation;
   - where each new node goes in the tree (top level or under which parent).
3. Show a Mermaid `flowchart LR` of the branch with new nodes and new edges marked (`:::new` class and a `%% new` comment).
4. Iterate until the user says yes.
5. Preview every write per the format below. Wait for yes. Write.
6. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of N: kb/<path>.md (new file)
<full contents>

### Proposed write 2 of N: kb/<path>.md
**Frontmatter**
- prereqs: [a] → [a, b]
- sources: 2 entries → 3 entries (+ "chapter-4.md 4.2")
**Body**
+ - new term :: definition
```

Reply **yes** to write all, **no** to skip all, or name what to change. Never summarise a write as "updated X".

## Rules

- Cite the file by name in `sources` so lint stops reporting it. Never invent a citation.
- Node ids are unique, lowercase, `a-z0-9-`, equal to the filename. Children go in a folder beside the parent file.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
