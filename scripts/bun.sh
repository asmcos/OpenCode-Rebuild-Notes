#!/usr/bin/env bash
# Prefer Bun 1.4.x for Zen free gate (same requirement as zen-free-agent).
# Override: BUN_BIN=/path/to/bun ./scripts/bun.sh ...

set -euo pipefail

pick_bun() {
  if [[ -n "${BUN_BIN:-}" && -x "${BUN_BIN}" ]]; then
    echo "${BUN_BIN}"
    return
  fi
  if [[ -x "${HOME}/.bun/bin/bun" ]]; then
    echo "${HOME}/.bun/bin/bun"
    return
  fi
  if command -v bun >/dev/null 2>&1; then
    command -v bun
    return
  fi
  echo "bun not found; install Bun 1.4+ from https://bun.sh" >&2
  exit 1
}

version_ok() {
  local v major minor
  v="$("$1" --version 2>/dev/null | head -n1 | tr -d '\r')"
  major="${v%%.*}"
  minor="${v#*.}"
  minor="${minor%%.*}"
  [[ "${major}" -gt 1 ]] || { [[ "${major}" -eq 1 && "${minor}" -ge 4 ]]; }
}

BUN="$(pick_bun)"
if ! version_ok "${BUN}"; then
  echo "need Bun ≥ 1.4.x for this project (Zen free); got: $("${BUN}" --version) (${BUN})" >&2
  echo "install/upgrade: curl -fsSL https://bun.sh/install | bash -s \"bun-v1.4.4\"" >&2
  echo "then ensure ${HOME}/.bun/bin is first on PATH, or set BUN_BIN=${HOME}/.bun/bin/bun" >&2
  exit 1
fi

exec "${BUN}" "$@"
