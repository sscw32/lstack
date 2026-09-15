---
name: setup-vault
description: In an lstack learning vault (a folder containing lstack.yaml), or in an empty folder that should become one, create the vault for one subject from the user's sources. Use for "/setup-vault", "set up a vault", "start learning X with lstack", "turn this folder into a study vault". Skip when lstack.yaml already exists (use /add-source), when the user wants to study rather than set up, or when the request is about a code project's setup.
disable-model-invocation: true
---

# Setup vault

Create an lstack vault in the current folder through a short series of exchanges, then write everything in one confirmed batch. Refuse if `lstack.yaml` already exists here and point to `/add-source`.

The text after the skill name in the user's message is the subject name. If there is none, ask in step 2.

Every write in this skill follows show-before-write: show the exact content of every file, then wait for an explicit yes. Never write on an implied yes.

## Steps, in order

1. **Node.** Run `node --version`. Record `node_available: true` or `false`. If missing, say the vault still works but index rebuilding will be done by hand and is slower and less reliable.
2. **Subject.** Ask the subject name. Derive `subject` (lowercase slug, `a-z0-9-`) and `title`. Confirm both.
3. **Sources.** Create `sources/`. Ask the user to put their material in it now (syllabus, table of contents, lecture list, notes, PDFs, a `.md` of links). Wait. List what you found, one line per file. If nothing: say the tree will be agent-proposed and every node's `sources` will carry `agent-proposed`, and continue.
4. **Mission.** Ask why they are learning this, what success looks like, and any dates. Draft `MISSION.md` with the three headings `## Why`, `## What success looks like`, `## Constraints and dates`. Preview, yes.
5. **Schedule.** Ask sessions per week and minutes per session.
6. **Division.** Ask: "How should the content be divided? (a) follow the sources' own chapters and sections (default), (b) by concept, (c) you tell me." Then derive the tree, two levels by default. For each node decide `id`, `title`, `kind` (`concept` for ideas, `fact` for definitions and formulas, `procedure` for methods), `prereqs`, and `sources` (cite the file name plus section, or `agent-proposed`). Show the tree as a table with columns id, title, kind, prereqs, source, plus a Mermaid `flowchart LR` of the prereq edges. Iterate until the user says yes. Ask whether any subtopic should be split further now.
7. **Voice.** Show the voice table and the "Testing me" lines from `references/agents-md-template.md`. Record any changes. If a change weakens a "Testing me" line, give the one-sentence evidence note from the template once, then write what the user asked.

   | Key | Options | Default |
   |---|---|---|
   | register | formal, casual | casual |
   | verbosity | terse, balanced, thorough | terse |
   | humor | none, some, lots | some |
   | bluntness | gentle, direct, harsh | direct |

8. **Sections.** Show the default `node_sections` list (Summary, Why it matters, Terms, Analogies, Heuristics, Aha, Open questions, Cards). Allow add, remove, rename. Summary and Cards stay.
9. **Overview.** Ask whether to create `notes/overview.md`, a hand-written narrative page. Say it is the user's file and never authoritative.
10. **Plan preview.** Show the complete plan as one preview: the folder tree, then the full contents of `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `lstack.yaml`, `MISSION.md`, every node file, and the `.lstack/` file list. One yes writes all of it.
11. **Write.** Create the files below. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line. Print next steps: `/today`, `/explain <node>`, `/drill`.

## Files to write

Templates live in this skill's `references/` folder. Read them before drafting.

- `AGENTS.md` from `references/agents-md-template.md`. Fill the subject title and one Voice paragraph from the recorded voice.
- `CLAUDE.md` and `GEMINI.md`, each exactly one line: `@AGENTS.md`.
- `lstack.yaml` from `references/lstack-yaml-template.md`. `lstack: 0.1.0`, `created:` today, the schedule, the voice, `overview`, `node_available`.
- `MISSION.md` from step 4.
- `sources/` (already exists), `notes/`, `log/`, `problems/attempts/`. Create `notes/overview.md` only if asked in step 9.
- One node file per row of the step 6 table, at `kb/<id>.md` for top level and `kb/<parent>/<id>.md` for children. Frontmatter per `references/node-schema.md` with `status: new`, `confidence: null`, all date fields `null`, `passes_in_a_row: 0`, `hint_count: 0`, `sessions: []`. Body: `# Title`, then `## Summary` holding two or three sentences drafted from the sources and ending with `(agent draft)`, then the remaining section headings from step 8, empty. No cards yet.
- `.lstack/lstack.mjs`, `.lstack/node-schema.md`, `.lstack/card-writing.md`: copy `scripts/lstack.mjs`, `references/node-schema.md`, and `references/card-writing.md` from this skill's folder (the directory that contains this SKILL.md). `.lstack/VERSION` holds `0.1.0`.

## Rules

- Never write into `sources/`, `notes/`, or `problems/attempts/`.
- Do not invent sources. A node whose material you did not see cites `agent-proposed`.
- Node ids are unique, lowercase, `a-z0-9-`, and equal the filename.
- No hooks, no sub-agents, no argument substitution. Everything runs in this thread.
