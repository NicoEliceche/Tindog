# Security provider contracts

## Moderation API

`POST MODERATION_API_URL` with bearer auth and JSON `{ "kind": "text|image", "content": "..." }`.

Successful response:

```json
{ "allowed": true, "labels": [], "severity": "low", "provider": "vendor", "providerVersion": "v1", "urgentAnimalWelfare": false }
```

Production fails closed on timeout, non-2xx or malformed responses. Image content is a bounded WebP data URL after antivirus and metadata stripping.

## Malware scanner

`POST MALWARE_SCANNER_URL` with bearer auth, `application/octet-stream`, and at most 6 MiB. It must return `{ "clean": true }`. Any other result fails closed.

## Security sink and urgent alert

Both accept bearer-authenticated JSON over HTTPS. The log sink receives redacted audit records; the alert endpoint receives case ID, category and severity only—never report/message content.
