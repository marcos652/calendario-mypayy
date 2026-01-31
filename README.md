# Scheduler Meeting

Web app for authenticated users to manage availability, schedule meetings without conflicts, and view calendar/list views.

## Tech
- Next.js App Router + TypeScript
- TailwindCSS
- Firebase Auth + Firestore
- React Hook Form + Zod
- date-fns

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with Firebase config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Run dev server:

```bash
npm run dev
```

## Firestore Rules
A baseline rules file is included at `firestore.rules`.

## Notes
- Meetings are stored with `date` (YYYY-MM-DD) and `startTime`/`endTime` (HH:mm).
- Conflicts are blocked via transaction in `meetings.service.ts`.
