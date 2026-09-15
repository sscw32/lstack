---
name: wrap-up
description: In an lstack learning vault (a folder containing lstack.yaml), close the session with one batch preview of the log entry and every pending node change, then write, build, and lint. Use for "/wrap-up", "I'm done for today", "wrap up", "save the session". Skip when the folder has no lstack.yaml, when the user studied away from the agent and wants that recorded (/log-session), or when "wrap up" refers to finishing a code task.
disable-model-invocation: true
---

# Wrap up

One preview. One yes. One new log file. Then build and lint.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`. Read the newest file in `log/` to get today's next session number.

## Argument

Optional: minutes spent, if the user states it. Otherwise estimate from the conversation and mark it "(estimated)".

## Steps

1. Gather everything pending from this session:
   - node edits proposed but not yet written (frontmatter and body);
   - `sessions` appends for every node touched today that does not yet list today;
   - aha moments the user voiced, as `- YYYY-MM-DD: text` lines under `## Aha` of the right node;
   - questions the user asked, with a one-line answer each;
   - test results per node, as already written or pending.
2. Build the log entry at `log/YYYY-MM-DD-<n>.md`, `<n>` starting at 1 for the first session of the day, using this layout:

   ```markdown
   ---
   date: 2026-09-15
   session: 1
   mode: agent
   skills: [drill, hint]
   nodes: [kernel, image]
   minutes: 40
   ---
   ## Covered
   ## Questions the user asked
   - "why is the kernel a subspace?" → closure under addition and scaling
   ## Results
   - kernel: 3/3 → pass (delayed) → status reviewing, next_review 2026-09-18
   - image: 1/3 → fail (delayed) → status learning, next_review 2026-09-16
   ## Aha
   - image: "the image is just the span of the columns" (also written to image.md)
   ## Changes written
   - kb/linear-maps/kernel.md (frontmatter, Aha)
   ## Open threads
   ```

   Every section heading appears even when empty. `## Changes written` lists every file this wrap-up writes plus files written earlier in the session.
3. Show ONE numbered batch preview: each pending node edit (frontmatter as `old → new`, body as `+`/`-` lines), then the log file in full as the last item. End with: "Reply **yes** to write all, **no** to skip all, or name what to change."
4. On yes, write everything. On a per-item edit, apply it and re-show only that item.
5. Run `node .lstack/lstack.mjs build`, then `node .lstack/lstack.mjs lint`. Report one line: "written N files, index rebuilt, lint clean" or the lint findings. If `lstack.yaml` says `node_available: false`, rebuild `kb/index.md` and `kb/today.md` by hand and say so.

## Preview format

```
### Proposed write 1 of 3: kb/linear-maps/kernel.md
**Frontmatter**
- sessions: [2026-09-09, 2026-09-12] → [2026-09-09, 2026-09-12, 2026-09-15]
**Body**
+ - 2026-09-15: injectivity and a trivial kernel are the same question

### Proposed write 2 of 3: kb/linear-maps/image.md
**Frontmatter**
- sessions: [2026-09-11, 2026-09-14] → [2026-09-11, 2026-09-14, 2026-09-15]

### Proposed write 3 of 3: log/2026-09-15-1.md (new file)
<full contents>
```

## Rules

- Never rewrite an existing log file. If `log/2026-09-15-1.md` exists, the new file is `-2`.
- Never change `status`, `last_result`, or `next_review` here unless a testing skill left that edit pending and unwritten.
- Never write into `sources/`, `notes/`, or `problems/attempts/`. Never edit generated files.
- No hooks, no sub-agents, no argument substitution.
