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
src/app/shared/   icon, ui (logo, avatar, name, scene, toast, dropdown, switch), post-card, photo, report sheet
src/app/pages/    landing, auth (login/signup), legal + grievance form
netlify/functions grievance.mts (complaints → Blobs + Resend email)
src/app/main/     shell (sidebar + bottom nav), feed, reels, explore, chats, notifications,
                  friends, groups, create, profile, settings, menu
```

## Rules for this codebase

- **Only `core/store.ts` reads `core/data.ts`.** Pages and components get every list from `Store`. Going live = swap the demo arrays in `Store` for Supabase queries; no page changes. Then delete `data.ts` — nothing in the UI may be hard-coded.
- **Reuse before writing:** `app-avatar`, `app-name`, `app-scene`, `app-dropdown` (⋯ menus), `app-switch`, `app-post-card`, `app-photo-button`, `Toast` (with Undo), `Report`. Shared styles (`.btn`, `.chip`, `.card`, `.input`, `.menu-item`, `.icon-btn`) live in `styles.css`.
- **Icons:** register in `shared/icons.ts` — only listed icons are bundled.
- **Words:** UI words go through `I18n.t()` (`core/i18n.ts`); languages in `LANGS`.
- **State:** signals only; no RxJS except router events.
- **Unused code fails the build** (`noUnusedLocals`, `noUnusedParameters`).
- Every page is lazy-loaded and preloaded after the first screen.

See [docs/ROADMAP.md](docs/ROADMAP.md) for what's next.
