# Privacy and retention

- Foreground device coordinates: used in memory to search nearby places and never persisted.
- Rejected/failed quarantine uploads: 24 hours; moderation-rejected evidence: 30 days unless legal hold applies.
- Ready media: until replacement/account deletion; only sanitized derivatives are public.
- Data exports: seven days, private, five-minute download URL.
- Expired sessions: removed on each retention run; revoked push devices after 30 days.
- Declined connection requests: 180 days.
- Resolved report detail: redacted after two years unless `legalHoldUntil` is active.
- Security audit: two years, append-only until the authorized retention worker removes expired records.
- Account deletion: fourteen-day recovery window; then credentials/devices/pets/media/check-ins are removed, messages/reviews needed by other participants are anonymized, and safety evidence remains pseudonymized under its retention/legal-hold rule.

Retention changes require privacy/legal review, a migration if fields change, and an audited configuration event.
