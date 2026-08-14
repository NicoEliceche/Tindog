# Incident response

1. **Triage:** classify severity, preserve audit/moderation evidence, record incident lead and timeline. Never paste tokens, message text, emails or coordinates into chat/tickets.
2. **Contain:** revoke affected sessions; block abusive users/devices; disable compromised provider credentials; lower rate limits; pause uploads or messages if their dependencies are involved.
3. **Credential compromise:** run `CONFIRM_REVOKE_ALL=REVOKE_ALL_TINDOG_SESSIONS npm run security:revoke-sessions`, rotate `JWT_SECRET`, then rotate the affected provider secret. Rotation of JWT invalidates every session and requires re-login.
4. **Eradicate and recover:** patch, run security CI, verify migrations, restore from a known-good point when required, and monitor audit/alert sinks for recurrence.
5. **Notify:** involve privacy/legal and providers according to jurisdiction and contracts. User communication must state known impact without exposing another user’s data.
6. **Post-incident:** complete root cause, missed-control analysis, corrective actions, owner/due dates, and a regression test. Re-run relevant pentest cases.
