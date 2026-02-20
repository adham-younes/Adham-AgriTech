#!/usr/bin/env bash
set -euo pipefail

echo "[dry-run] installing dependencies"
pnpm install --frozen-lockfile

echo "[dry-run] lint"
pnpm lint

echo "[dry-run] typecheck"
pnpm typecheck

echo "[dry-run] tests"
pnpm test

echo "[dry-run] build"
pnpm build

echo "[dry-run] completed successfully"
