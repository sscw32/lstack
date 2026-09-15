# Cross-agent smoke test

Run on 2026-09-15 against a scratch copy of `examples/linear-algebra/` with the 23 skills installed by `npx skills add <local path>` (which writes `.agents/skills/<name>` and symlinks `.claude/skills/<name>`). Each agent ran non-interactively for one turn with read-only tools, so every run shows the skill's first move. None of the runs wrote a file (checked with `diff -rq kb` against the fixture and `ls log`).

| Agent | Version | Reads skills from | `/today` | `/drill` | `/explain kernel intuition` | `/setup-vault` |
|---|---|---|---|---|---|---|
| Claude Code | 2.1.267 | `.claude/skills/` (symlinks) | fired, same queue | fired, 12 questions planned, topic-blind | fired, analogy first, paused for recall | not run |
| Codex CLI | `codex exec` | `.agents/skills/` | fired via `$today`, same queue | fired via `$drill`, "1/12" topic-blind | not run | not run |
| Cursor CLI | `cursor-agent -p` | `.agents/skills/` | fired, same queue | not run | not run | fired, `node --version`, slug proposed, waits for yes |

"Same queue" means the four due nodes in the same order (Span with the gap first, then Vector spaces, Kernel, Image), Basis under never tested, empty frontier, Rank-nullity blocked behind Image and Basis, budget 4 reviews and 0 new. All three agents read that from `node .lstack/lstack.mjs due --json` rather than from `today.md`, as the skill asks.

## Differences observed

- **Invocation syntax.** Claude Code and Cursor take `/today`. Codex takes `$today` or a plain sentence naming the skill. Both forms fired.
- **Opening line.** All three opened with a one-line "where you are" from the newest log, as `AGENTS.md` asks. Claude Code's was the most specific (named the open thread about Image's Summary). Codex skipped it in the `/drill` run and went straight to question 1.
- **Cursor plan mode.** `cursor-agent -p --mode plan "/setup-vault statistics"` produced no output at all. The same command without `--mode plan` ran the skill. Do not use plan mode for lstack skills in the Cursor CLI.
- **Confidence before recall.** Claude Code's `/explain` asked "confidence 1-4 first" before its mid-explanation recall question, reading the `AGENTS.md` line about confidence before reveals as applying there too. Harmless, and consistent with the rule.
- **Source honesty.** Claude Code's `/explain` said out loud that the only source was a table of contents and that the explanation was anchored on the node rather than the book's text. That is the behaviour the skill asks for.
- **Codex output echo.** `codex exec` echoes the files it reads (including `.lstack/card-writing.md`) into stdout before the reply. Cosmetic.

## Discovery after a clone

The source of each skill is `skills/<name>/`. That path is what `npx skills add` and the Claude Code plugin loader scan. It is not what a cloned working copy exposes to the other agents.

Committed relative symlinks fill the gap:

| Tree | Who reads it |
|---|---|
| `.agents/skills/<name>` → `../../skills/<name>` | Cursor, Codex, Copilot, OpenCode, Amp, Gemini CLI |
| `.claude/skills/<name>` → `../../skills/<name>` | Claude Code (does not read `.agents/skills/`) |

`.agents/` and `.claude/` stay in `.gitignore` so a local `npx skills add` of some other pack does not ship. The 23 lstack links are force-added. Recreate them with `node scripts/link-agent-skills.mjs`. `scripts/check-skills.mjs` fails if a link is missing or points at the wrong folder.

Repo-root always-on files: `AGENTS.md` (Cursor, Codex, Copilot, OpenCode, Amp), `CLAUDE.md` (`@AGENTS.md`), `GEMINI.md` (`@AGENTS.md`).

## Not covered here

- Gemini CLI, Copilot, OpenCode, Amp: not installed on this machine. Their skill directories match the `.agents/skills/` layout the installer writes (spec section 3), so discovery should work, but that is inferred, not observed.
- Multi-turn flows (a full `/drill` to the node write, a full `/setup-vault` to the file write). Those need a live session with a human saying yes. The owner's private vault (spec 12.8) is where that gets checked.
- The Claude Code plugin install path (`claude plugins install lstack@sscw32/lstack`). `claude plugins validate` passes on the marketplace manifest, the plugin manifest, and the skills directory. The install itself needs the repo pushed.
