# AI Handoff Notes (FCM Sender)

## Project Overview
- Repo path: `/Users/darrenchiangmbp2024/Desktop/worksapce/pwa/functions`
- Purpose: Firebase Cloud Functions backend for FCM + a Vite React GUI to send test notifications.
- Key backend function: `sendTestNotification` (HTTP) in `src/index.ts`
- Frontend app: `frontend/` (React + MUI)

## Current Behavior (as of this handoff)
- GUI supports target types: `token`, `topic`, or `condition` (exactly one required).
- Payload supports `notification` (title/body/imageUrl), `data` (string values), and platform options (`android`, `webpush`, `apns`).
- Data-only messages are allowed (notification block omitted if empty).
- Frontend sender includes `data.status` (default `SUCCESS`) for receiver UI styling.

## FCM Request Payload Format (for receiver implementations)
`sendTestNotification` expects a JSON body with exactly one target and optional payload blocks.

Required target (exactly one):
- `token: string` OR `topic: string` OR `condition: string`

Optional blocks:
- `notification?: { title?: string; body?: string; imageUrl?: string }`
- `data?: { [key: string]: string }` (all values must be strings, includes `status`)
- `extraOptions?: { android?: AndroidConfig; webpush?: WebpushConfig; apns?: ApnsConfig }`

Supported combinations:
- Target only (no `notification`, no `data`)
- Notification-only (target + `notification`)
- Data-only (target + `data`)
- Notification + data (target + `notification` + `data`)
- Any of the above plus `extraOptions` for platform overrides

Notes for receivers:
- `notification` is only sent if at least one of `title`, `body`, `imageUrl` is provided.
- `data` is omitted if empty.
- `data.status` is included by the sender UI (default `SUCCESS`), and is case-sensitive.
- Platform options are passed through as-is to FCM (`android`, `webpush`, `apns`).

## Files Touched / Changes Made
- Backend validation and targeting:
  - `src/index.ts`
    - Added `topic` and `condition` targets alongside `token`.
    - Enforced exactly one target provided.
    - Added `notification.imageUrl` validation.
    - Refactored to build a `BaseMessage` type alias then create correct `Message` union to satisfy TS types.
- Backend tests:
  - `src/index.test.ts`
    - Updated validation expectation for target.
    - Added a topic send test.
- Frontend UI/logic:
  - `frontend/src/components/NotificationForm.tsx`
    - Added target type selector (token/topic/condition).
    - Added inputs for topic/condition with localStorage persistence.
    - Only includes `notification` in payload if any notification fields are present.
    - Updated helper text to valid JSON examples.
    - Added `status` selector that writes to `data.status` (default `SUCCESS`).
  - `frontend/src/App.tsx`
    - Updated description to mention token/topic/condition.
  - `frontend/src/services/api.ts`
    - Default base URL updated to local emulator for project `c2-test-1786d`.
    - Still overrideable via `VITE_FCM_FUNCTION_URL`.

## How to Run (local)
- Backend (functions emulator): `npm run serve` from repo root.
- Frontend: `cd frontend && npm run dev`
- If using non-local backend, set `VITE_FCM_FUNCTION_URL` to your Functions base URL.

## Known Notes / Risks
- Service account file is committed in `src/` and used in `admin.initializeApp`.
- CORS is `origin: true` (allow all).
- `firebase-debug.log` shows warning about outdated firebase-functions version; no upgrade done.

## Open Questions / Next Steps
- Do we need auth protection for the GUI (Firebase Auth or other)?
- Should topic/condition be exposed only in advanced mode (safety)?
- Consider adding more tests for condition targeting and mixed invalid targets.
