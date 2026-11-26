#!/usr/bin/env bash
# Verifies the installed regression-auditor skill is byte-identical to Richelin's original.
set -euo pipefail
cd "$(dirname "$0")/.."
if diff -r docs/my-work/regression-auditor .claude/skills/regression-auditor >/dev/null; then
  echo "OK: .claude/skills/regression-auditor matches docs/my-work/regression-auditor"
else
  echo "MISMATCH: .claude/skills/regression-auditor differs from docs/my-work/regression-auditor" >&2
  diff -r docs/my-work/regression-auditor .claude/skills/regression-auditor >&2 || true
  exit 1
fi
