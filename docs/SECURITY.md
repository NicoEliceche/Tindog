# Tindog production security

## Required before public launch

The code-enforced controls below are complete. These external activation gates cannot be created or attested by application code; before public launch an owner must:

- provision Upstash Redis; private quarantine/export and processed-media buckets; malware scanning; automated moderation; immutable log storage; and urgent alert delivery;
- restrict each Google/Maps/storage key in the relevant provider console and set every variable from `.env.example` in Render/EAS;
- enable GitHub secret scanning, push protection, Dependabot alerts, branch protection and required `Security gates` checks;
- schedule `tindog-security-workers`, run and record a restore drill, connect alerts to an on-call recipient, and exercise the session/key revocation runbook;
- commission the independent penetration test. This cannot be self-certified by the implementation team.

The authenticated web application should be served from the API origin, or from first-party custom domains that share the same site. Cross-site previews such as GitHub Pages may be used for UI review, but browser third-party-cookie policies make them unsuitable as the canonical authenticated production origin.

## Implemented controls

1. **Distributed rate limits:** production uses atomic Upstash Redis sliding windows. The process-local limiter exists only for development; production fails closed when Redis is absent.
2. **Private media pipeline:** authenticated five-minute S3-compatible upload URLs target a private quarantine bucket. Finalization checks declared size, SHA-256, file signature, MIME, frame count and pixel bounds; calls malware scanning; strips metadata/GPS; converts to bounded WebP; moderates the image; and publishes only the processed derivative on `MEDIA_PUBLIC_BASE_URL`. Rejected originals expire from quarantine.
3. **Moderation and appeals:** chat text, location reviews and uploaded images pass automated moderation. Reports create durable queue cases; animal-welfare reports trigger an urgent webhook. Evidence is AES-256-GCM encrypted, cases support legal holds, moderators require role + recent Google step-up + a separate admin access key, and affected users can appeal.
4. **Step-up and account lifecycle:** a Google ID token must match the linked Google `sub` and email before sensitive operations. Step-up lasts ten minutes. Data export is asynchronous and private. Account deletion has a fourteen-day recovery window, revokes other sessions, then pseudonymizes or erases personal data in a background worker.
5. **Private push worker:** notification jobs are persisted, retried and sent by a worker. Lock-screen text is generic, precise location/medical/message content is never queued, user preferences are honored, and invalid Expo tokens are revoked.
6. **Immutable security audit:** security events are redacted, IP/user-agent values are HMAC-hashed, each record is integrity-hashed, and PostgreSQL rejects updates/deletes outside the retention worker. Events can also be copied to a separately controlled sink. Login, logout, profile/settings, device, connection, message, block, report, appointment, check-in, review, upload, export, deletion and moderator events are covered.
7. **Automated security gates:** CI runs secret-pattern checks, ESLint, TypeScript, unit tests, Prisma validation plus migrations against isolated PostgreSQL, Expo Doctor, production dependency audits, a production build, dependency review and CodeQL. Dependabot covers root, mobile and GitHub Actions.
8. **Retention and recovery:** expired sessions, revoked devices, rejected requests, quarantined media, exports, resolved reports and audit records have explicit lifecycles. Exact foreground coordinates are not persisted. A guarded backup/restore drill script refuses targets whose database name does not contain `restore_drill`.
9. **Independent key boundaries:** browser, Android, iOS, server Places, Redis, storage, moderation, scanning, worker, admin, audit and alert credentials are separate. `/api/health` returns 503 in production until all required security dependencies are configured.
10. **Penetration-test readiness:** the authorization/abuse matrix and required independent test scope are documented in `docs/PENETRATION_TEST_SCOPE.md`; no public launch is approved until an independent tester signs off and high/critical findings are closed.

## Deployment order

1. Apply `prisma/migrations/20260731233000_production_security/migration.sql` to a Neon preview branch and run the CI migration job.
2. Provision providers and configure all secrets. Verify `/api/health` returns `200` and `securityReady: true` in production.
3. Deploy API/web, then run the push and retention workers manually once.
4. Build and install a new Expo development client because SDK/native configuration changed.
5. Execute `docs/PENETRATION_TEST_SCOPE.md`, the restore drill and incident tabletop before store/public release.

Operational details are in `docs/SECURITY_OPERATIONS.md`, retention rules in `docs/PRIVACY_RETENTION.md`, and incident handling in `docs/INCIDENT_RESPONSE.md`.
