# TimeCommunication

Production-grade real-time chat with AI summaries and audio/video calls.

## Tech Stack
- Next.js App Router + TypeScript (strict)
- Tailwind CSS + shadcn/ui + Lucide
- Convex for realtime data + subscriptions
- Clerk authentication (email + social)
- LiveKit for audio/video
- OpenAI API for AI summaries

## Features
- User directory with search + direct or group chats
- Real-time messaging with unread counts
- Presence + typing indicators
- Smart timestamps and auto-scroll
- AI summary for missed messages
- Audio and video calls via LiveKit

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` using `.env.example`:
```bash
cp .env.example .env.local
```

3. Configure Clerk:
- Create a Clerk app and copy keys into `.env.local`
- Enable social providers as needed

4. Configure Convex:
```bash
npx convex dev
```
Follow prompts to create a Convex project. This generates `convex/_generated`.

5. Configure LiveKit:
- Create a LiveKit project
- Set `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, and `NEXT_PUBLIC_LIVEKIT_URL`

6. Configure OpenAI:
- Set `OPENAI_API_KEY`

7. Run the app:
```bash
npm run dev
```

## Scripts
- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run convex:dev` — Convex dev server
- `npm run convex:deploy` — deploy Convex functions

## Folder Structure
```
src/
  app/
  components/
    chat/
    sidebar/
    calls/
    ai/
    ui/
  hooks/
  lib/
    ai/
    livekit/
    utils/
  convex/
  types/
  providers/
convex/
```

## Notes
- Convex generates types in `convex/_generated` on first run.
- LiveKit requires a `wss://` or `https://` URL for `NEXT_PUBLIC_LIVEKIT_URL`.
- AI summaries are generated server-side in `app/api/ai/summary/route.ts`.
