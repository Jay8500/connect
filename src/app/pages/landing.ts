import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/ui';

const WHY = [
  { icon: 'lock', title: 'No ads in chats. Ever.', text: 'Your family chats stay just that. No ads, no “sponsored” messages.' },
  { icon: 'check-check', title: 'A calm feed', text: 'Friends and groups first, newest first. When you’ve seen everything, we say so — no endless scrolling.' },
  { icon: 'languages', title: 'Your language', text: 'Use the app in తెలుగు, हिन्दी or English. One tap translates posts. More Indian languages coming.' },
  { icon: 'gauge', title: 'Light on data', text: 'Data Saver mode for 2G/3G and small data packs. Works well on budget phones.' },
  { icon: 'shield-alert', title: 'Scam warnings', text: 'Messages asking for UPI PIN, OTP or “prize money” get a clear warning and one-tap Block & report.' },
  { icon: 'search', title: 'Fewer fake forwards', text: '“Forwarded many times” labels and a Check-the-fact link. A gentle nudge before you share rumours.' },
  { icon: 'eye-off', title: 'Number stays private', text: 'People see your name and photo, never your phone number. Strangers land in Requests first.' },
  { icon: 'heart-handshake', title: 'Family & local groups', text: 'Family, apartment, college, village and hobby groups — the way India actually connects.' },
];

const LAWS = [
  { title: 'DPDP Act, 2023', text: 'Clear consent, download or delete your data any time, nominate a family member.' },
  { title: 'IT Rules, 2021', text: 'A Grievance Officer in India. Complaints acknowledged in 24 hours, resolved in 15 days.' },
  { title: '24-hour takedown', text: 'Private or intimate images shared without consent are removed within 24 hours of a report.' },
  { title: '18+ at launch', text: 'Adults only for now, so no child’s data is collected without a parent’s consent.' },
];

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Icon, Logo],
  template: `
    <div class="min-h-dvh bg-white">
      <header class="sticky top-0 z-20 border-b border-line/70 bg-white/90 backdrop-blur">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <app-logo />
          <nav class="flex items-center gap-2">
            <a routerLink="/login" class="btn btn-ghost btn-sm hidden sm:inline-flex">Log in</a>
            <a routerLink="/signup" class="btn btn-primary btn-sm">Create account</a>
          </nav>
        </div>
      </header>

      <section class="relative overflow-hidden">
        <div class="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-100/70 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-rose-100/70 blur-3xl"></div>
        <div class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 lg:grid-cols-2 lg:py-24">
          <div>
            <span class="chip"><span class="h-2 w-2 rounded-full bg-amber-400"></span>Preview · Coming soon</span>
            <h1 class="mt-5 text-4xl leading-[1.08] font-extrabold sm:text-6xl">India’s own <span class="bg-gradient-to-r from-brand to-rose-500 bg-clip-text text-transparent">social app</span>.</h1>
            <p class="mt-5 max-w-lg text-lg text-muted">Friends, family, photos, reels, groups and chats — in your language, light on data, and with your privacy first. Made for India, by Indians.</p>
            <div class="mt-8 flex flex-wrap gap-3">
              <a routerLink="/home" class="btn btn-primary h-12 px-6 text-base">Try the preview<svg lucideIcon="chevron-right" [size]="18" /></a>
              <a routerLink="/signup" class="btn btn-ghost h-12 px-6 text-base">Create account</a>
            </div>
            <p class="mt-4 text-sm text-muted">తెలుగు · हिन्दी · English — more Indian languages coming</p>
          </div>

          <!-- Phone mock-up -->
          <div class="mx-auto w-full max-w-[300px] rounded-[2.5rem] border-8 border-ink bg-soft p-3 shadow-2xl">
            <div class="flex items-center justify-between px-1"><app-logo [size]="24" [word]="false" /><svg lucideIcon="bell" [size]="18" /></div>
            <div class="mt-3 flex gap-2">
              @for (e of storyEmojis; track e) { <span class="grid h-14 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-3 to-amber-200 text-xl">{{ e }}</span> }
            </div>
            <div class="mt-3 rounded-2xl bg-white p-3 shadow-sm">
              <p class="text-xs font-bold">Lakshmi Devi <span class="font-normal text-muted">· 1h</span></p>
              <p class="mt-1 text-[13px]">ఈ సంక్రాంతికి మా ఇంటి ముందు ముగ్గు 🌼</p>
              <p class="mt-1 text-[11px] font-semibold text-brand">See translation</p>
              <div class="mt-2 grid h-24 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-100 text-4xl">🌼</div>
              <p class="mt-2 text-[11px] text-muted">❤️ 86 · 2 comments</p>
            </div>
            <div class="mt-3 rounded-2xl bg-white p-3 text-center shadow-sm">
              <p class="text-xs font-bold">You’re all caught up ✓</p>
              <p class="text-[11px] text-muted">Time for chai? ☕</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-soft py-16">
        <div class="mx-auto max-w-6xl px-4">
          <p class="eyebrow">Why Connect</p>
          <h2 class="mt-2 text-3xl font-extrabold sm:text-4xl">Everything you like about social apps. Without the parts you don’t.</h2>
          <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            @for (w of why; track w.title) {
              <div class="card p-5">
                <span class="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand"><svg [lucideIcon]="w.icon" [size]="22" /></span>
                <h3 class="mt-4 font-bold">{{ w.title }}</h3>
                <p class="mt-1 text-sm text-muted">{{ w.text }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="py-16">
        <div class="mx-auto max-w-6xl px-4">
          <p class="eyebrow">Made for India’s laws</p>
          <h2 class="mt-2 text-3xl font-extrabold sm:text-4xl">Your rights, built in from day one.</h2>
          <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            @for (l of laws; track l.title) {
              <div class="rounded-2xl border-l-4 border-brand bg-brand-50/60 p-5">
                <h3 class="font-bold">{{ l.title }}</h3>
                <p class="mt-1 text-sm text-muted">{{ l.text }}</p>
              </div>
            }
          </div>
          <p class="mt-6 text-sm text-muted">Read the <a routerLink="/privacy" class="font-semibold text-brand">privacy policy</a>, <a routerLink="/guidelines" class="font-semibold text-brand">community guidelines</a> and how to reach our <a routerLink="/grievance" class="font-semibold text-brand">Grievance Officer</a>.</p>
        </div>
      </section>

      <section class="px-4 pb-16">
        <div class="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-brand to-teal-700 p-8 text-center text-white sm:p-14">
          <h2 class="text-3xl font-extrabold sm:text-4xl">Your people are waiting. 🙏</h2>
          <p class="mx-auto mt-3 max-w-xl text-brand-100">Take a look around the preview — every screen works with demo content.</p>
          <a routerLink="/home" class="btn mt-7 h-12 bg-white px-7 text-base text-brand hover:bg-brand-50">Open the preview</a>
        </div>
      </section>

      <footer class="border-t border-line py-8">
        <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row">
          <p>© 2026 Connect · Powered by <b class="text-ink">Spread Apps™</b> · Made with ❤️ in India</p>
          <nav class="flex flex-wrap justify-center gap-4">
            <a routerLink="/privacy" class="hover:text-ink">Privacy</a>
            <a routerLink="/terms" class="hover:text-ink">Terms</a>
            <a routerLink="/guidelines" class="hover:text-ink">Guidelines</a>
            <a routerLink="/grievance" class="hover:text-ink">Grievance</a>
          </nav>
        </div>
      </footer>
    </div>
  `,
})
export class Landing {
  protected readonly why = WHY;
  protected readonly laws = LAWS;
  protected readonly storyEmojis = ['🌼', '🕌', '💃', '⛰️'];
}
