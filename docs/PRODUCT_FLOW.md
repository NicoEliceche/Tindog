# Tindog social and meetup flow

## Connection and chat

1. Home shows a pet profile and the actions Pass, Connect, and Save.
2. Connect creates a pending request and notifies the other tutor.
3. The receiver can accept, decline, block, or report. A conversation is created only by an atomic acceptance transaction.
4. Both participants can message while neither has blocked the other. The API derives the sender from the authenticated session; clients cannot choose a sender ID.
5. A meeting can only be created from a two-party conversation by one of its members.

This deliberately differs from unrestricted direct messages. It follows the same safety boundary used by Tinder: messages become available after mutual consent.

## Meetings

The canonical statuses are:

- `scheduled` — Agendada.
- `in_progress` — En progreso. A check-in inside the allowed time window moves the persisted appointment to this state; the UI can also derive it while the agreed window is active.
- `completed` — Finalizada. Required to distinguish a real past meeting from a cancellation and to unlock verified reviews.
- `cancelled` — Cancelada. It remains visible in history.

The meeting point selector requests foreground location only after an explicit action. Tindog never needs continuous or background location for this flow. A trusted-contact share contains who, when, and the public meeting point, not a live route or home address.

## Public meeting points

Safe-point ranking should combine public/staffed venue type, opening hours, lighting and visibility, transit/accessibility, dog friendliness, recent Tindog attendance, and verified Tindog reviews. The UI says “punto público recomendado”; it never promises that a place is safe.

Google Places results are live and use a minimal field mask. The backend does not request or copy Google reviews. Place IDs may be retained; other Google Places content must follow Google Maps Platform storage and attribution rules. Tindog reviews are first-party data linked to a completed appointment and verified check-in.

## Review policy

Public location reviews require the author to be an appointment participant, a completed appointment at that location, and a recorded check-in. A cancelled meeting can receive private cancellation feedback later, but it cannot create a public place review. This limits review bombing and fabricated venue histories.
