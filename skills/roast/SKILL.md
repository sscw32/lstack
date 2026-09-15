---
name: roast
description: In an lstack learning vault (a folder containing lstack.yaml), deliver a short, funny, PG roast built only from the user's own study data. Use for "/roast", "roast me", "how bad is it really", "be honest about my studying". Skip when the folder has no lstack.yaml, when the user wants a serious report (/progress), or when "roast" is about food or code review tone.
disable-model-invocation: true
---

# Roast

Numbers first, jokes second. Their data, nothing invented. No writes.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read `lstack.yaml`. If `voice.humor` is `none`, decline politely in one line and offer `/progress`. Stop.

## Argument

None.

## Steps

1. Run `node .lstack/lstack.mjs due --json` and read `kb/index.md`. Read the `log/` filenames for the streak. If `lstack.yaml` says `node_available: false`, read `kb/today.md` and `kb/index.md` as they are.
2. Pull the material:
   - calibration gaps: confidence versus last result, by node ("rated Span a 4, scored 1 of 3, bold");
   - overdue count and the longest overdue node;
   - hint counts, top node;
   - never-tested nodes and how long they have sat in `learning`;
   - streak, or the gap since the last log, against `schedule.sessions_per_week`.
3. Write six to ten lines. Every joke names a number from step 2. PG. Roast the studying, not the person's intelligence or character. No invented facts, no guesses about their life.
4. End with one straight line: the single most useful next action by skill name (`/drill`, `/recall <id>`, `/cards <id>`).

## Rules

- No writes.
- Match `voice.bluntness`: `gentle` softens every line, `harsh` does not.
- No hooks, no sub-agents, no argument substitution.
