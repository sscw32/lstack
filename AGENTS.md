# Working on the lstack repo

This file is for agents editing lstack itself. A vault's own `AGENTS.md` is a different file, written by `/setup-vault`.

## What this repo is

A pack of 23 markdown skills plus one zero-dependency Node script. `docs/LSTACK-SPEC.md` is the contract. Every on-disk format, rule, and skill body comes from it. Do not change a stated decision without flagging it in the commit message.

## Layout

- `skills/<name>/SKILL.md`. One folder per skill, flat. Every folder also has `agents/openai.yaml`.
- `.agents/skills/<name>` and `.claude/skills/<name>`. Relative symlinks to `skills/<name>`, so Cursor, Codex, Copilot, OpenCode, Amp, Gemini CLI, and Claude Code find the pack on clone. Recreate with `node scripts/link-agent-skills.mjs`.
- `skills/setup-vault/scripts/lstack.mjs`. The build script. `setup-vault` copies it into a vault as `.lstack/lstack.mjs`. No other skill references this path.
- `skills/setup-vault/references/`. Templates copied into a vault's `.lstack/`.
- `skills/setup-vault/tests/`. `node --test` suite over `examples/linear-algebra`.
- `examples/linear-algebra/`. A complete six-node vault. Fixture for tests and README.
- `scripts/check-skills.mjs`. Repo lint over every skill folder (frontmatter keys, description prefix, line cap, openai.yaml).
- `docs/decisions.tsv`. Build decision trail, append-only.

## How to test

```bash
./scripts/verify.sh              # runs everything below
node scripts/check-skills.mjs
cd examples/linear-algebra && node ../../skills/setup-vault/scripts/lstack.mjs build --today 2026-09-15 && git diff --exit-code kb
```

The third command must leave `git diff` empty. The checked-in generated files are the expected output.

## Conventions

- Skills: frontmatter keys are only `name`, `description`, and `disable-model-invocation`. Description starts with `In an lstack learning vault (a folder containing lstack.yaml), `. Name matches `^[a-z0-9]+(?:-[a-z0-9]+)*$` and is at most 64 characters. Description is 1-1024 characters. Under 200 lines. No `$ARGUMENTS`, no hooks, no sub-agents. After adding a skill folder, run `node scripts/link-agent-skills.mjs`.
- Script: single ES module, Node 18+, no npm dependencies, under 600 lines.
- Generated vault files start with the `<!-- GENERATED ... -->` line and are never hand-edited.
- Commit messages use Conventional Commits, `type(scope): subject`.

## Status

- Phase 0 skeleton: done. `npx skills add` installs 23, `claude plugins validate` passes.
- Phase 1 script: done. 16 tests green, build byte-identical, serve renders index, graph, node.
- Phase 2 vault creation skills: written, check-skills green. Real-vault use pending (owner's private vault, later).
- Phase 3 explaining and hints: written, check-skills green. Real-vault use pending.
- Phase 4 testing skills: written, check-skills green. Real-vault use pending.
- Phase 5 sessions and extras: written, check-skills green. Real-vault use pending.
- Phase 6 docs: README with serve screenshots done. Cross-agent smoke in `docs/portability.md`.
