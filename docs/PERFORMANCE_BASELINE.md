# Performance Baseline & Batch Tracking

## Current baseline (local dry run)
- TTFB target (marketing pages): `< 500ms` on warm cache.
- LCP target (marketing pages): `< 2500ms` on 4G / mid-tier device profile.

## How metrics are collected
1. `TTFB` is tracked from:
   - Next web-vitals (`TTFB`) in `PerformanceMonitor`.
   - navigation timing fallback (`responseStart - requestStart`) as approximate value.
2. `LCP` is tracked from Next web-vitals (`LCP`).
3. Metrics are stored in browser `localStorage` key: `agritech-perf-snapshots` and logged in console under `[perf]`.

## Batch follow-up process
After **every release batch**:
1. Set `NEXT_PUBLIC_RELEASE_BATCH` to batch name (example: `2026-03-batch-1`).
2. Open key pages (`/`, `/pricing`, `/docs`, `/app/fields/[id]`).
3. Export localStorage snapshots and append summary to release notes.
4. If LCP or TTFB regress >15% from previous batch, block release and optimize before rollout.

## Quick extraction snippet
Run in browser console:

```js
JSON.parse(localStorage.getItem('agritech-perf-snapshots') ?? '[]')
```
