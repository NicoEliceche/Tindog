# Security operations

## Provider setup

- Upstash: create a production database, scope its REST token to Tindog and configure both `UPSTASH_REDIS_REST_*` values.
- Object storage: use three private origins (`quarantine`, `processed`, `exports`). Only the processed bucket may be reachable through `MEDIA_PUBLIC_BASE_URL`; deny executable content types and bucket listing. The API principal needs object access only to these prefixes.
- Scanner/moderation: expose HTTPS service-to-service endpoints matching `docs/SECURITY_PROVIDER_CONTRACTS.md`. They must not train on or retain Tindog content beyond the contracted processing window.
- Logs/alerts: the security event sink must be append-only to the application principal. Alert delivery must reach a monitored on-call channel.
- Admin: keep `ADMIN_API_ACCESS_KEY` in a server-side admin gateway, never browser JavaScript. Moderator APIs also require a moderator/admin session and fresh Google step-up.

## Key restrictions

- Places server key: allow only Places API (New), restrict by workload/IP where supported, set quota alerts.
- Android Maps/OAuth: package `com.nicoeliceche.tindog` plus production signing SHA-1/SHA-256.
- iOS Maps/OAuth: bundle ID `com.nicoeliceche.tindog` and the registered URL scheme.
- Browser OAuth/Embed: exact HTTPS origins/referrers; no wildcard subdomains.
- Storage, Redis, moderation, scanner and sinks: unique least-privilege credentials per environment. Never use `NEXT_PUBLIC_`/`EXPO_PUBLIC_` for secrets.

## Scheduled operations

- Every five minutes: execute `node scripts/run-security-workers.mjs`.
- Weekly: review failed push/export jobs, critical moderation cases, alert delivery and dependency findings.
- Monthly: verify least-privilege credentials and purge stale access.
- Quarterly: run `scripts/backup-restore-drill.ps1`, record RTO/RPO and test `npm run security:revoke-sessions` in staging.
- Annually or after major auth/upload changes: independent penetration test.

## Release evidence

Keep the CI URL, dependency audit, migration status, `/api/health` result, restore-drill record, pentest report and remediation links with each production release. A green build without those external attestations is not a public-launch approval.
