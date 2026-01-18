# PWA FCM Sender

A small tool to send Firebase Cloud Messaging (FCM) test notifications. It includes:

- Firebase Cloud Functions backend (`sendTestNotification`)
- Vite + React frontend for composing and sending pushes

## Repo Structure

- `src/` - Firebase Functions (TypeScript)
- `frontend/` - React UI (Vite + MUI)
- `.spec-kit/ai-handoff.md` - AI collaboration notes

## Requirements

- Node.js 22
- Firebase CLI (`firebase`)

## Setup

```bash
npm install
```

Frontend dependencies are separate:

```bash
cd frontend
npm install
```

## Run Locally

Backend (Functions emulator):

```bash
npm run serve
```

Frontend (Vite dev server):

```bash
cd frontend
npm run dev
```

## Configuration

The frontend posts to the Functions base URL. It defaults to the local emulator:

- `frontend/src/services/api.ts` uses `http://localhost:5001/c2-test-1786d/us-central1`
- Override with `VITE_FCM_FUNCTION_URL` (e.g. in `frontend/.env.local`)

## FCM Payload Format

The HTTP function `sendTestNotification` expects a JSON body with exactly one target:

```json
{
  "token": "device_token_here",
  "notification": {
    "title": "Deposit Successful",
    "body": "Your deposit of $100 has been credited.",
    "imageUrl": "https://example.com/image.png"
  },
  "data": {
    "status": "SUCCESS"
  }
}
```

Target fields (exactly one):

- `token` (string)
- `topic` (string)
- `condition` (string)

Optional fields:

- `notification` (title/body/imageUrl)
- `data` (string values only)
- `extraOptions` (android/webpush/apns)

### Status in data payload

The frontend adds `data.status` for receiver UI styling. Supported values (case-sensitive):

- `SUCCESS` (default)
- `FAILURE`
- `WARNING`
- `PENDING`
- `INFO`

## Tests

Backend:

```bash
npm run test
```

Frontend:

```bash
cd frontend
npm run test
```

## Notes

- Service account JSON should not be committed. Store it locally and load via `GOOGLE_APPLICATION_CREDENTIALS` or keep a local copy under `src/` for development.
- The functions emulator warns if other Firebase emulators are not running.

## Service Account Credential (Local Only)

To run the Functions locally, download a Firebase service account key and keep it out of Git.

1) Go to Firebase Console → Project Settings → Service accounts  
2) Click **Generate new private key** and download the JSON  
3) Save it locally (do not commit). Recommended:

- `src/your-project-service-account.json` (local only)

Then update `src/index.ts` to point to your local JSON file, or use the default credentials via environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/your-service-account.json"
```

If you change the filename, make sure `.gitignore` keeps `src/*.json` and `lib/*.json` ignored.
