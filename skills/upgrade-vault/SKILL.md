---
name: upgrade-vault
description: In an lstack learning vault (a folder containing lstack.yaml), bring an existing vault up to the installed lstack version by refreshing .lstack/ and merging template changes into AGENTS.md, keeping the user's edits. Use for "/upgrade-vault", "update this vault to the new lstack", "lint says .lstack/VERSION is older", "refresh the vault's script". Skip when the folder has no lstack.yaml (/setup-vault), when the user wants to update the installed skills themselves (npx skills add or claude plugins update), or when "upgrade" refers to a package, dependency, or app.
disable-model-invocation: true
---

# Upgrade vault

Bring this vault's pack-owned files up to the installed lstack version. Nothing the user studies or writes is touched: no node, source, note, log, or attempt.

Every write follows show-before-write: show the exact change to every file, then wait for an explicit yes. Never write on an implied yes.

## Preconditions

- Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`.
- Read `MISSION.md`, `kb/today.md`, and the newest file in `log/`. Open with one line on where the user is, then move straight to the upgrade.
- Find the installed pack. It is the folder that contains this skill's folder. The new files live in its `setup-vault/` sibling: `setup-vault/scripts/lstack.mjs`, `setup-vault/references/node-schema.md`, `setup-vault/references/card-writing.md`, `setup-vault/references/VERSION`, `setup-vault/references/agents-md-template.md`, `setup-vault/references/lstack-yaml-template.md`. This is the one skill allowed to read another skill's folder, because the upgrade source is the installed pack itself. If `setup-vault/` is missing, stop: say the upgrade needs it and give the install line `npx skills add sscw32/lstack -s setup-vault` (or the full pack). Do not fetch files from the network.

## Steps, in order

1. **Versions.** Read three values: the vault's `.lstack/VERSION` (missing counts as `0.0.0`), `lstack:` in `lstack.yaml`, and the pack's `setup-vault/references/VERSION`. Show them as one line.
   - Vault newer than the pack: stop. Say the installed pack is older than the vault and suggest updating the install.
   - Same version and the three `.lstack/` files byte-identical to the pack's: say the vault is current, then still run step 4 once, since a template change can ship without a version bump. If step 4 finds nothing, stop.
2. **Pack files.** For `lstack.mjs`, `node-schema.md`, and `card-writing.md`, run `diff -u .lstack/<file> <pack file>`. These files are pack-owned and are replaced whole. Show each unified diff in full, then one sentence per file saying what changed in plain words. If the user hand-edited one of them, say so and say the edit will be lost; offer to copy their old version to `notes/lstack-<file>.bak` first. That is the only write to `notes/` this skill may make, and only on a yes.
3. **Dry run.** Before writing anything, run the new script against the vault without installing it: `node <pack>/setup-vault/scripts/lstack.mjs lint` from the vault root. Compare with `node .lstack/lstack.mjs lint`. Report findings that are new under the new version, one line each. These are usually schema changes that existing nodes now fail. Do not fix nodes in this skill; say that after the upgrade the user can fix them one node at a time, each with its own preview, or with `/lint-vault`.
4. **AGENTS.md.** Compare the vault's `AGENTS.md` with the fenced block in `setup-vault/references/agents-md-template.md`. Sort every difference into one of three kinds:
   - **Template change.** A rule, heading, or line the new template has and the vault lacks, or a pack line whose wording the template has since changed. Propose bringing it in.
   - **User choice.** The subject title, the Voice paragraph, and any "Testing me" line the user weakened or removed at setup or through `/voice`. Keep it as it is. List the weakened lines so the user sees them, but never restore one silently.
   - **Unclear.** Ask about each one by itself.

   Draft the merged `AGENTS.md` and show it as a unified diff against the current file. Also confirm `CLAUDE.md` and `GEMINI.md` each hold exactly `@AGENTS.md`, and propose that line if either drifted.
5. **lstack.yaml.** Compare its keys with `setup-vault/references/lstack-yaml-template.md`. For each key the template has and the vault lacks, propose adding it with the template default and one line on what it does. Never change existing values. Leave `lstack:` alone, because it records the version that created the vault.
6. **One preview.** Show the full batch as a numbered list: each `.lstack/` file to be replaced, `.lstack/VERSION` old → new, the `AGENTS.md` diff, any shim fix, any `lstack.yaml` additions, and any backup to `notes/`. Accept yes, no, or per-item edits ("skip 3").
7. **Write.** Copy the pack files over `.lstack/`, write `.lstack/VERSION`, and apply the approved `AGENTS.md`, shim, and `lstack.yaml` changes. Then run `node .lstack/lstack.mjs build` and `node .lstack/lstack.mjs lint`. Report one line: old version → new version, files changed, and the lint count. If `node_available: false` in `lstack.yaml`, say the script was refreshed but not run, and rebuild `kb/index.md` and `kb/today.md` by hand.

## Rules

- Never write into `sources/`, `kb/` nodes, `log/`, or `problems/`. Write to `notes/` only for the backup in step 2.
- Never edit the generated `kb/` files by hand; `build` rewrites them.
- Never weaken or strengthen a "Testing me" line on your own. Template changes there are proposed and need their own yes.
- No hooks, no sub-agents, no argument substitution. Everything runs in this thread.
