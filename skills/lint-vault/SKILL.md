---
name: lint-vault
description: In an lstack learning vault (a folder containing lstack.yaml), run the script's lint and then read the nodes for contradictions, doubly defined terms, and backwards prereqs. Use for "/lint-vault", "check the vault", "anything broken in kb", "find contradictions in my notes". Skip when the folder has no lstack.yaml, when the user means a code linter (eslint, ruff), or when the question is about one source file (/check-source).
---

# Lint vault

Report structural findings from the script, then the findings only a reader can see. Fix nothing without a yes.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is.

## Argument

The text after the skill name in the user's message is an optional branch (a top-level node id). With no argument, cover the whole vault.

## Steps

1. Run `node .lstack/lstack.mjs lint`. Show its output verbatim. Explain each ERROR in one line. If `lstack.yaml` says `node_available: false`, do this pass by hand against `.lstack/node-schema.md`: duplicate ids, dangling prereqs, id not matching filename, folders without a sibling file, cycles.
2. Read the nodes in the branch (or every branch, one at a time). Report:
   - contradictions between two Summaries;
   - a term defined differently in two `## Terms` sections (check `kb/glossary.md` for duplicates first);
   - prereq edges that look backwards (the dependent is simpler than its prerequisite);
   - a Summary still marked `(agent draft)` on a node with `status: reviewing` or better.
   One line each: `kb/<path>.md: <finding>`.
3. For each finding you can fix, propose the fix as a per-node preview. Skip findings that need the user's judgement and say why.
4. Wait for yes. Write. Run `node .lstack/lstack.mjs build`, then `lint` again. Report one line.

## Preview format

```
### Proposed write 1 of N: kb/<path>.md
**Frontmatter**
- prereqs: [basis] → [span]
**Body**
- - basis :: an independent list
+ - basis :: a linearly independent spanning list
```

Reply **yes** to write all, **no** to skip all, or name what to change.

## Rules

- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- Never change `status`, `confidence`, or scheduling fields here.
- No hooks, no sub-agents, no argument substitution.
