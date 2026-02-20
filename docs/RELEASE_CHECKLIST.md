# RELEASE CHECKLIST

## 1) ENV
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured (server only).
- [ ] `NEXT_PUBLIC_RELEASE_BATCH` set for this deployment batch.
- [ ] Verify production domain + TLS certificate.

## 2) MIGRATIONS
- [ ] Confirm migration diff is reviewed.
- [ ] Run migrations in staging first.
- [ ] Backup database snapshot before production migration.
- [ ] Apply production migrations.
- [ ] Validate critical tables/functions after migration.

## 3) CRON
- [ ] Validate `fetch-weather-daily` schedule.
- [ ] Validate `generate-report-monthly` schedule.
- [ ] Validate failure alerts for cron jobs.
- [ ] Run one manual trigger for each critical function.

## 4) SMOKE TESTS
- [ ] Marketing pages load: `/`, `/about`, `/pricing`, `/docs`.
- [ ] Auth page loads: `/sign-in`.
- [ ] Dashboard shell loads: `/app`.
- [ ] Heavy page loads without crash: `/app/fields/[fieldId]` (map + chart).
- [ ] Reports page loads: `/app/reports`.
- [ ] Public report page loads: `/r/[publicToken]`.

## 5) ROLLBACK PLAN
- [ ] Keep last stable deployment tag ready (`release-previous`).
- [ ] Keep DB backup created pre-migration and verified.
- [ ] Rollback sequence documented and owner assigned.

### Rollback procedure
1. Disable incoming traffic (maintenance mode / edge rule).
2. Re-deploy last stable application artifact (`release-previous`).
3. Revert incompatible env var changes.
4. If schema issues occurred, restore DB backup or apply rollback migration.
5. Re-enable traffic gradually (10% → 50% → 100%).
6. Run smoke tests and verify cron health.
7. Publish incident summary with root-cause + prevention action.

## 6) DRY-RUN BEFORE REAL RELEASE
- [ ] Execute `scripts/release-dry-run.sh` on staging.
- [ ] Attach dry-run output to release notes.
- [ ] Confirm no blocking errors remain.
