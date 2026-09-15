# lstack.yaml template

Written by `/setup-vault`. Read by every skill and by the script. Hand-editable. Replace the angle-bracket values.

```yaml
lstack: 0.1.0                 # version of the pack that created this vault
subject: <slug>               # lowercase a-z0-9-; prefixes node ids when a hub aggregates vaults
title: <Title>
created: <YYYY-MM-DD>

schedule:                     # used by /today to size the queue
  sessions_per_week: <n>
  minutes_per_session: <n>

scheduling:
  ladder_days: [1, 3, 7, 16, 35]
  pass_threshold: 0.67
  delayed_min_days: 1
  mastered_after_passes: 3

node_sections:                # Summary and Cards are required
  - Summary
  - Why it matters
  - Terms
  - Analogies
  - Heuristics
  - Aha
  - Open questions
  - Cards

voice:
  register: casual            # formal | casual
  verbosity: terse            # terse | balanced | thorough
  humor: some                 # none | some | lots
  bluntness: direct           # gentle | direct | harsh

overview: false               # true if notes/overview.md was requested
node_available: true          # result of `node --version` at setup
```

## MISSION.md template

```markdown
# Mission

## Why
<the user's reason, in their words>

## What success looks like
<observable outcomes>

## Constraints and dates
<schedule, deadlines, exams>
```

## `.lstack/` contents

- `lstack.mjs`: copy of this skill's `scripts/lstack.mjs`.
- `node-schema.md`: copy of this skill's `references/node-schema.md`.
- `card-writing.md`: copy of this skill's `references/card-writing.md`.
- `VERSION`: the `lstack:` value, one line.
