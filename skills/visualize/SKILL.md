---
name: visualize
description: In an lstack learning vault (a folder containing lstack.yaml), start the read-only local server that renders the index, prereq graph, and node pages in a browser. Use for "/visualize", "show me the graph", "open the vault in a browser", "serve the vault". Skip when the folder has no lstack.yaml, when the user wants a chart of data in their code, or when they ask for a diagram inline in chat.
disable-model-invocation: true
---

# Visualize

Start `serve` and hand over the URL. Write nothing.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

Optional port number. Default 4173.

## Steps

1. If `lstack.yaml` says `node_available: false`, or `node --version` fails, say the server needs Node and point the user at `kb/index.md` and `kb/graph.md` instead (the graph renders in any Mermaid-capable viewer such as Obsidian or GitHub). Stop.
2. Run `node .lstack/lstack.mjs build` first so the pages are current.
3. Run `node .lstack/lstack.mjs serve --port <port>` in the background. If it reports the port is in use, retry with the next port.
4. Tell the user: the URL, that `/` is the index, `/graph` the prereq graph, `/today` the queue, `/glossary` the terms, and `/node/<id>` any node. Say it is read-only and how to stop it (Ctrl-C or kill the process).

## Rules

- No writes to the vault beyond the `build` rebuild of generated files.
- No hooks, no sub-agents, no argument substitution.
