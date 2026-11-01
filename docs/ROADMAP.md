# Connect roadmap

> Every feature must follow [REQUIREMENTS.md](REQUIREMENTS.md): clean URLs, end-to-end security & encryption,
> open-source AI only, easy for literate and non-literate users, Indian compliance, smooth UX.

## Done — Phase 1: static UI preview (Nov 2026)
- Landing page, login/signup (mobile OTP mock, 18+ check, DPDP consent), legal drafts
- Feed (stories, composer, posts, photos, polls, translation, caught-up end), Reels, Explore/search
- Chats (direct + groups, number hidden, chat requests, scam warning, “Forwarded many times”, fact-check link)
- Notifications, Friends, Groups, Create post (audience, forward nudge), Profile, Settings, Menu
- Report sheet with IT Rules 2021 reasons; block/unblock
- Settings: language EN/TE/HI, Data Saver, auto-translate, privacy, time reminder, devices, DPDP rights
- Responsive 320px → desktop; demo content in `core/data.ts`

## Next
- [ ] Netlify site + connect.spreadapps.in (badge off)
- [ ] PWA service worker + update banner
- [ ] Full-screen translations for Telugu/Hindi (now only main UI words)
- [ ] Supabase project (Spread ID shared auth) — waiting for account
- [ ] Tables + RLS: profiles, posts, comments, likes, friendships, groups, chats, messages, reports, consents
- [ ] Fully DB-driven: config tables for report reasons, complaint types, quick replies/comments, trending, languages + UI words, legal texts; then delete `core/data.ts`
- [ ] Move grievances from Netlify Blobs to a Supabase table (status tracking in Settings → Reports)
- [ ] Realtime chat, Storage for photos (compressed), push notifications
- [ ] Grievance Officer details, lawyer review of Privacy/Terms
- [ ] Clean URLs: remove ids/usernames from the address bar (router state + opaque share tokens)
- [ ] Security: chat E2E encryption, encrypted sensitive columns, CSP, rate limits, audit log, pen test
- [ ] Open-source AI: IndicTrans2 translation, Whisper/IndicConformer voice-to-text, Indic TTS read-aloud, scam/NSFW detection, reply suggestions
- [ ] Verified tick (free): optional ID check via DigiLocker / Aadhaar offline e-KYC (never compulsory, never store Aadhaar number); Official tick for businesses
- [ ] Simple mode + voice-first for non-literate users; accessibility (WCAG AA)
- [ ] Voice/video calls (LiveKit) — later
