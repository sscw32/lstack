#!/usr/bin/env bash
# The repo's done check. Every line must print ok.
set -u
cd "$(dirname "$0")/.."
status=0
check() { if "$@" >/tmp/lstack-verify.log 2>&1; then echo "ok    $*"; else echo "FAIL  $*"; tail -20 /tmp/lstack-verify.log; status=1; fi; }

check node --test 'skills/setup-vault/tests/*.test.mjs'
check node scripts/check-skills.mjs
check bash -c "cd examples/linear-algebra && node ../../skills/setup-vault/scripts/lstack.mjs build --today 2026-09-15 && cd ../.. && git diff --exit-code --quiet -- examples/linear-algebra/kb"
check bash -c "cd examples/linear-algebra && node ../../skills/setup-vault/scripts/lstack.mjs lint --today 2026-09-15 | grep -qv '^ERROR'"
check bash -c "test \$(ls skills | wc -l) -eq 23"
check bash -c "cmp -s skills/setup-vault/scripts/lstack.mjs examples/linear-algebra/.lstack/lstack.mjs"
exit $status
