import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { I18n, WordKey } from '../core/i18n';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Avatar, Logo, Toast } from '../shared/ui';

interface NavItem {
  path: string;
  icon: string;
  word: WordKey;
  badge?: 'chats' | 'notifications';
}

const SIDE_NAV: NavItem[] = [
  { path: '/home', icon: 'home', word: 'home' },
  { path: '/chats', icon: 'message', word: 'chats', badge: 'chats' },
  { path: '/reels', icon: 'film', word: 'reels' },
  { path: '/explore', icon: 'search', word: 'search' },
  { path: '/notifications', icon: 'bell', word: 'notifications', badge: 'notifications' },
  { path: '/friends', icon: 'users', word: 'friends' },
  { path: '/groups', icon: 'heart-handshake', word: 'groups' },
];

const BOTTOM_NAV: NavItem[] = [
  { path: '/home', icon: 'home', word: 'home' },
  { path: '/reels', icon: 'film', word: 'reels' },
  { path: '/create', icon: 'square-plus', word: 'create' },
  { path: '/chats', icon: 'message', word: 'chats', badge: 'chats' },
  { path: '/menu', icon: 'user', word: 'profile' },
];

const BANNER_KEY = 'connect.previewNoteHidden';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Logo, Avatar],
  template: `
    <!-- Mobile top bar -->
    @if (!fullScreen()) {
      <header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/95 px-3 backdrop-blur lg:hidden">
        <app-logo link="/home" [size]="30" />
        <nav class="flex items-center">
          <a routerLink="/explore" class="icon-btn" [attr.aria-label]="i18n.t('search')"><svg lucideIcon="search" [size]="22" /></a>
          <a routerLink="/notifications" class="icon-btn relative" [attr.aria-label]="i18n.t('notifications')">
            <svg lucideIcon="bell" [size]="22" />
            @if (store.unreadNotifications()) { <span class="dot">{{ store.unreadNotifications() }}</span> }
          </a>
        </nav>
      </header>
    }

    <div class="mx-auto flex max-w-[1240px] gap-8 lg:px-6">
      <!-- Desktop sidebar -->
      <aside class="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col py-6 lg:flex">
        <app-logo link="/home" class="px-3" />
        <nav class="no-scrollbar mt-8 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          @for (n of sideNav; track n.path) {
            <a [routerLink]="n.path" routerLinkActive="active" class="nav">
              <span class="relative">
                <svg [lucideIcon]="n.icon" [size]="21" />
                @if (badge(n); as b) { <span class="dot">{{ b }}</span> }
              </span>
              {{ i18n.t(n.word) }}
            </a>
          }
          <a routerLink="/create" class="btn btn-primary mt-5 w-full"><svg lucideIcon="plus" [size]="18" />{{ i18n.t('create') }}</a>
        </nav>
        <div class="flex items-center gap-1 border-t border-line pt-3">
          <a [routerLink]="['/profile', store.me.username]" class="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1.5 hover:bg-white">
            <app-avatar [user]="store.me" [size]="34" />
            <span class="truncate text-sm font-semibold">{{ store.me.name }}</span>
          </a>
          <a routerLink="/settings" class="icon-btn" [attr.aria-label]="i18n.t('settings')"><svg lucideIcon="settings" [size]="19" /></a>
        </div>
      </aside>

      <main class="min-w-0 flex-1 lg:pb-10" [class.pb-24]="!fullScreen()">
        @if (banner() && !fullScreen()) {
          <div class="mx-auto mt-3 flex max-w-[560px] items-center gap-2 rounded-full bg-amber-50 py-1.5 pr-1.5 pl-4 text-xs text-amber-900 max-sm:mx-4 lg:mt-6">
            <span class="flex-1">Preview with demo content — nothing is saved.</span>
            <button class="rounded-full p-1 hover:bg-amber-100" (click)="hideBanner()" aria-label="Hide preview note"><svg lucideIcon="x" [size]="14" /></button>
          </div>
        }
        <router-outlet />
      </main>

      <!-- Desktop right column: only what needs action (chats get the full width instead) -->
      @if (!onChats()) {
        <aside class="sticky top-0 hidden h-dvh w-72 shrink-0 space-y-6 overflow-y-auto py-8 xl:block">
          @for (id of birthdays(); track id) {
            @let b = store.user(id);
            <div class="flex items-center gap-3 rounded-2xl bg-white p-3">
              <span class="grid h-10 w-10 place-items-center rounded-full bg-rose-50 text-love"><svg lucideIcon="cake" [size]="20" /></span>
              <p class="flex-1 text-sm leading-snug"><b>{{ b.name.split(' ')[0] }}</b>’s birthday today</p>
              <button class="btn btn-primary btn-sm min-h-8!" (click)="wish(id)">Wish 🎉</button>
            </div>
          }

          @if (requestIds().length) {
            <section>
              <div class="mb-2 flex items-center justify-between px-1"><h2 class="text-sm font-bold text-muted">Friend requests</h2><a routerLink="/friends" class="text-xs font-semibold text-brand">See all</a></div>
              @for (id of requestIds(); track id) {
                @let u = store.user(id);
                <div class="flex items-center gap-3 rounded-2xl p-2 hover:bg-white">
                  <app-avatar [user]="u" [size]="40" />
                  <div class="min-w-0 flex-1 leading-tight">
                    <p class="truncate text-sm font-semibold">{{ u.name }}</p>
                    <p class="text-xs text-muted">{{ u.mutual }} mutual</p>
                  </div>
                  <button class="grid h-8 w-8 place-items-center rounded-full bg-brand text-white" (click)="store.acceptRequest(id)" aria-label="Confirm"><svg lucideIcon="check" [size]="16" /></button>
                  <button class="grid h-8 w-8 place-items-center rounded-full bg-soft text-muted hover:bg-line" (click)="store.declineRequest(id)" aria-label="Delete"><svg lucideIcon="x" [size]="16" /></button>
                </div>
              }
            </section>
          }

          <section>
            <h2 class="mb-2 px-1 text-sm font-bold text-muted">Online now</h2>
            <div class="flex flex-wrap gap-3 px-1">
              @for (id of store.online; track id) {
                @let u = store.user(id);
                <button class="relative" (click)="openChat(id)" [attr.aria-label]="'Chat with ' + u.name" [title]="u.name">
                  <app-avatar [user]="u" [size]="44" />
                  <span class="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-soft"></span>
                </button>
              }
            </div>
          </section>

          <footer class="px-1 text-[11px] leading-relaxed text-muted">
            <a routerLink="/privacy" class="hover:underline">Privacy</a> · <a routerLink="/terms" class="hover:underline">Terms</a> ·
            <a routerLink="/guidelines" class="hover:underline">Guidelines</a> · <a routerLink="/grievance" class="hover:underline">Grievance</a>
            <p class="mt-1">Powered by <b>Spread Apps™</b> · Made with ❤️ in India</p>
          </footer>
        </aside>
      }
    </div>

    <!-- Mobile bottom nav -->
    @if (!fullScreen()) {
      <nav class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Main">
        @for (n of bottomNav; track n.path) {
          <a [routerLink]="n.path" routerLinkActive="text-brand" class="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted">
            <span class="relative">
              <svg [lucideIcon]="n.icon" [size]="24" />
              @if (badge(n); as b) { <span class="dot">{{ b }}</span> }
            </span>
            {{ i18n.t(n.word) }}
          </a>
        }
      </nav>
    }
  `,
  styles: `
    .nav { display: flex; align-items: center; gap: 0.9rem; border-radius: 0.9rem; padding: 0.6rem 0.75rem; font-size: 0.95rem; font-weight: 500; color: rgb(11 17 32 / 0.75); transition: background 0.2s, color 0.2s; }
    .nav:hover { background: #fff; }
    .nav.active { background: #fff; color: var(--color-brand); font-weight: 600; }
    .dot { position: absolute; top: -6px; right: -8px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9999px; background: var(--color-love); color: #fff; font-size: 10px; font-weight: 700; line-height: 18px; text-align: center; box-shadow: 0 0 0 2px #fff; }
  `,
})
export class Shell {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  protected readonly sideNav = SIDE_NAV;
  protected readonly bottomNav = BOTTOM_NAV;
  protected readonly banner = signal(!readFlag(BANNER_KEY));
  protected readonly wished = signal(new Set<string>());
  protected readonly birthdays = computed(() => this.store.birthdays.filter((id) => !this.wished().has(id)));

  private readonly url = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)), { initialValue: this.router.url });
  /** An open chat uses the whole phone screen. */
  protected readonly fullScreen = computed(() => /^\/chats\/./.test(this.url()));
  protected readonly onChats = computed(() => this.url().startsWith('/chats'));
  protected readonly requestIds = computed(() => [...this.store.requests()]);

  badge(n: NavItem): number {
    if (n.badge === 'chats') return this.store.unreadChats();
    if (n.badge === 'notifications') return this.store.unreadNotifications();
    return 0;
  }

  openChat(userId: string) {
    this.router.navigate(['/chats', this.store.chatWith(userId)]);
  }

  /** One-tap birthday wish, straight into their chat. */
  wish(userId: string) {
    const first = this.store.user(userId).name.split(' ')[0];
    this.store.send(this.store.chatWith(userId), `Happy birthday ${first}! 🎂🎉 Have a wonderful year!`);
    this.wished.update((s) => new Set(s).add(userId));
    this.toast.show(`Birthday wish sent to ${first} 🎉`);
  }

  hideBanner() {
    this.banner.set(false);
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch {
      /* private mode */
    }
  }
}

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
