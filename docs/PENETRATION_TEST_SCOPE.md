# Independent penetration test scope

The tester receives dedicated web, Android and iOS test accounts plus a non-production environment with representative data. High/critical findings require a reproducible proof, remediation and retest.

- BOLA/IDOR across pets, connection requests, conversations, messages, appointments, check-ins, locations, reviews, media, exports, moderation and admin APIs.
- OAuth account linking, audience/platform confusion, session fixation/theft, step-up bypass, deletion recovery and cross-platform token reuse.
- CSRF/CORS/origin/content-type/body-size handling, stored/reflected XSS and CSP bypass.
- Upload polyglots, spoofed MIME/checksum/length, decompression/parser abuse, EXIF/GPS leakage, quarantine/public-bucket bypass and malicious SVG/animation.
- Redis/provider failure behavior, distributed rate-limit races, Places/storage/push quota exhaustion and worker replay.
- Block/report races, chat-after-block, appointment state/check-in/review forgery and duplicate connection acceptance.
- Notification privacy, invalid-token revocation, deep-link authorization and Android/iOS backup/storage inspection.
- Moderator/admin access, evidence confidentiality, audit mutation/deletion, log injection, alert suppression and retention-worker privilege escalation.
- Automated moderation evasion, appeal abuse, urgent animal-welfare escalation and report evidence/legal holds.

The final report must include scope, dates, methodology, tested build/commit, findings, severity rationale, evidence, remediation and retest status.
