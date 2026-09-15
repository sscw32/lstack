---
name: voice
description: In an lstack learning vault (a folder containing lstack.yaml), change how the tutor talks and tests by editing the Voice block and "Testing me" lines in AGENTS.md and the voice block in lstack.yaml. Use for "/voice", "be more formal", "less jokes", "change how you test me", "stop being so blunt". Skip when the folder has no lstack.yaml, when the user asks about speech or audio, or when the request is a one-off ("say that again simpler" is /bro).
disable-model-invocation: true
---

# Voice

Show the current settings, take the change, preview both files, write after a yes.

## Preconditions

Confirm `lstack.yaml` exists in the working directory or a parent. If not, say this isn't a vault and suggest `/setup-vault`.

## Argument

The text after the skill name in the user's message is the requested change, if any. Otherwise ask after showing the current settings.

## Steps

1. Read `AGENTS.md` (the `## Voice` paragraph and the `## Testing me` lines) and the `voice:` block in `lstack.yaml`. Show both, plus this table:

   | Key | Options | Current |
   |---|---|---|
   | register | formal, casual | <from lstack.yaml> |
   | verbosity | terse, balanced, thorough | ... |
   | humor | none, some, lots | ... |
   | bluntness | gentle, direct, harsh | ... |

   Then the seven "Testing me" lines, numbered, so any one can be named.
2. Ask what to change. Accept key changes, a rewritten Voice paragraph, and edits to individual "Testing me" lines.
3. If a "Testing me" change weakens the default, say once, in one sentence, what the evidence says (the notes live in the setup-vault skill's `references/agents-md-template.md`; if that file is not installed, use these: delayed tests beat same-day recall for retention; confidence before reveal exposes overconfidence; hints-only help avoids the exam-score drop of full answers; tutors fold under pushback unless told not to; person-praise lowers performance; ending with retrieval beats rereading; interleaved practice beats blocked). Then write what the user asked.
4. Preview both files as `-`/`+` lines. Wait for yes. Write. No build needed; say so.

## Preview format

```
### Proposed write 1 of 2: AGENTS.md
**Body**
- Casual and terse. Some humor is fine. Be direct about what I got wrong; skip the cushioning.
+ Formal register, balanced length, no jokes. Direct about mistakes.

### Proposed write 2 of 2: lstack.yaml
**Body**
-   register: casual
+   register: formal
-   humor: some
+   humor: none
```

Reply **yes** to write all, **no** to skip all, or name what to change.

## Rules

- Touch only `AGENTS.md` and the `voice:` block of `lstack.yaml`. Leave `CLAUDE.md` and `GEMINI.md` as `@AGENTS.md`.
- No hooks, no sub-agents, no argument substitution.
