# Connect by Spread Apps™

India's own social app — friends, family, photos, reels, groups and chats, in your language.
Live (planned): https://connect.spreadapps.in

**Status:** static UI preview with demo content. No backend yet — nothing is saved or sent.

## Run

```bash
npm install
npm start          # http://localhost:4200
npm run build      # → dist/connect/browser (Netlify publish dir)
```

## Stack

Angular 22 (standalone, signals, zoneless) · Tailwind CSS v4 · Lucide icons · Netlify (SPA).
Backend later: Supabase (Postgres, Auth = Spread ID, Realtime chat, Storage).

## Structure

```
src/app/core/     models.ts (types + APP name), data.ts (demo content), store.ts (all state), i18n.ts (EN/TE/HI)
src/app/shared/   icon, ui (logo, avatar, scene, toast, switch), post-card, report sheet
src/app/pages/    landing, auth (login/signup), legal (privacy/terms/guidelines/grievance)
src/app/main/     shell (sidebar + bottom nav), feed, reels, explore, chats, notifications,
                  friends, groups, create, profile, settings, menu
```

Pages only talk to `Store`. To go live, replace the demo arrays in `Store` with Supabase calls — the UI stays the same.

See [docs/ROADMAP.md](docs/ROADMAP.md) for what's next.
