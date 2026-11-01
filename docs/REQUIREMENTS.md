# Connect — must-have requirements (owner, 1 Nov 2026)

These apply to every feature from now on. Check each new page/feature against this list.

## 1. Clean URLs — no parameters or IDs visible
- No ids, usernames, query strings or tokens in the address bar on any page (today `/chats/c2`, `/profile/kiran.kumar` show them).
- In-app navigation passes ids through router state / the store, not the URL.
- Refresh, back button and deep links must still work → keep the last opened item in session state; shareable links use short opaque tokens that the server resolves and checks permission for (never raw DB ids).

## 2. Security from front end to database
- **Chats end-to-end encrypted** (keys only on users' devices, Signal-protocol style / libsodium); the server stores only ciphertext. Encrypted backups with the user's key.
- **Sensitive fields encrypted at rest** in Postgres (phone, DOB, reports, grievances) with pgcrypto / Supabase Vault; keys never in the browser.
- HTTPS everywhere + HSTS (done), strict **Content-Security-Policy**, no inline secrets, all keys server-side only.
- **Supabase RLS on every table**; anon access only through checked RPCs; server re-validates every input; amounts/permissions computed on the server.
- Auth: OTP login, 2-step verification, new-login alerts, device list + log out others, session expiry, rate limits on login/OTP.
- Protect against OWASP Top 10: XSS (no `innerHTML` with user text), CSRF, injection, IDOR (never trust an id from the client), file-upload checks (type/size, strip EXIF location), brute force, bots (rate limits, honeypots).
- Audit log of sensitive actions; alerts on abuse; regular dependency updates; security review / pen test before launch.

## 3. AI features — open-source models only (no Claude / Anthropic)
Self-hosted or own fine-tuned open models, data kept in India:
- **Translation** between Indian languages — AI4Bharat IndicTrans2.
- **Speech-to-text** (voice posts, voice search, voice → chat text) — Whisper / AI4Bharat IndicConformer.
- **Read aloud** (text-to-speech in Telugu, Hindi…) — AI4Bharat Indic Parler-TTS.
- **Scam & abuse detection** in chats/posts, fake-news hints, NSFW image filter — open classifiers, fine-tuned on Indian data.
- **Smart helpers**: reply suggestions, caption writing, simple "explain this" in the user's language — open LLMs (Llama / Gemma / Sarvam / Mistral family) fine-tuned for Connect.
- Users must be told when AI is used and can turn it off (DPDP consent).

## 4. Easy for everyone — literate and non-literate
- **Voice first**: speak to search, post, message; every screen can read itself aloud.
- Big clear icons + pictures with short words; "Simple mode" with bigger text and fewer buttons.
- All Indian languages, auto-detect the phone language; numbers and dates in Indian format.
- Works on cheap phones and slow networks (Data Saver, small app size — keep first load < 100 KB).
- Accessibility: screen readers, contrast, large tap targets (WCAG 2.1 AA).
- Short video/voice tutorials inside the app; help in the user's language.

## 5. Indian compliance (keep in every feature)
DPDP Act 2023 (consent, rights, nominee, data in India), IT Rules 2021 (Grievance Officer, 24h ack / 15-day resolve, 24h intimate-image takedown), 18+ at launch, CERT-In 6-hour incident reporting, logs kept 180 days where required.

## 6. Smooth experience
Instant navigation (preloaded pages), no layout jumps, skeleton loaders, offline-friendly PWA, fewest taps for common actions, no dark patterns.
