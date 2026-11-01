import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { I18n, WordKey } from '../core/i18n';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Avatar, Logo, Name } from '../shared/ui';

interface NavItem {
  path: string;
  icon: string;
  word: WordKey;
  badge?: 'chats' | 'notifications';
}

const SIDE_NAV: NavItem[] = [
  { path: '/home', icon: 'home', word: 'home' },
  { path: '/reels', icon: 'film', word: 'reels' },
  { path: '/explore', icon: 'compass', word: 'explore' },
  { path: '/chats', icon: 'message', word: 'chats', badge: 'chats' },
  { path: '/notifications', icon: 'bell', word: 'notifications', badge: 'notifications' },
  { path: '/friends', icon: 'users', word: 'friends' },
  { path: '/groups', icon: 'heart-handshake', word: 'groups' },
  { path: '/settings', icon: 'settings', word: 'settings' },
];

const BOTTOM_NAV: NavItem[] = [
  { path: '/home', icon: 'home', word: 'home' },
  { path: '/reels', icon: 'film', word: 'reels' },
  { path: '/create', icon: 'square-plus', word: 'create' },
  { path: '/chats', icon: 'message', word: 'chats', badge: 'chats' },
  { path: '/menu', icon: 'user', word: 'profile' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Logo, Avatar, Name],
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

    <div class="mx-auto flex max-w-[1320px] gap-6 lg:px-4">
      <!-- Desktop sidebar -->
      <aside class="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col py-5 lg:flex">
        <app-logo link="/home" class="px-3" />
        <nav class="mt-6 flex-1 space-y-1">
          @for (n of sideNav; track n.path) {
            <a [routerLink]="n.path" routerLinkActive="bg-white text-brand shadow-sm" class="flex items-center gap-3.5 rounded-2xl px-3 py-2.5 font-medium text-ink/80 transition-colors hover:bg-white">
              <span class="relative">
                <svg [lucideIcon]="n.icon" [size]="22" />
                @if (badge(n); as b) { <span class="dot">{{ b }}</span> }
              </span>
              {{ i18n.t(n.word) }}
            </a>
          }
          <a routerLink="/create" class="btn btn-primary mt-4 w-full"><svg lucideIcon="plus" [size]="18" />{{ i18n.t('create') }}</a>
        </nav>
        <a [routerLink]="['/profile', store.me.username]" class="flex items-center gap-3 rounded-2xl p-2 hover:bg-white">
          <app-avatar [user]="store.me" [size]="38" />
          <span class="min-w-0 text-sm leading-tight"><span class="block truncate font-semibold">{{ store.me.name }}</span><span class="text-muted">&#64;{{ store.me.username }}</span></span>
        </a>
      </aside>

      <main class="min-w-0 flex-1 lg:pb-10" [class.pb-24]="!fullScreen()">
        @if (banner() && !fullScreen()) {
          <div class="mx-auto flex max-w-[680px] items-center gap-2 bg-ink px-4 py-2 text-xs text-white lg:mt-4 lg:rounded-2xl">
            <svg lucideIcon="sparkles" [size]="14" class="shrink-0 text-brand-3" />
            <span class="flex-1">Preview with demo content — nothing you do here is saved or sent.</span>
            <button class="shrink-0 rounded-full p-1 hover:bg-white/10" (click)="banner.set(false)" aria-label="Hide preview note"><svg lucideIcon="x" [size]="14" /></button>
          </div>
        }
        <router-outlet />
      </main>

      <!-- Desktop right column (chats get the full width instead) -->
      @if (!onChats()) {
      <aside class="sticky top-0 hidden h-dvh w-72 shrink-0 overflow-y-auto py-5 xl:block">
        <section class="card p-4">
          <h2 class="flex items-center gap-2 text-sm font-bold"><svg lucideIcon="cake" [size]="17" class="text-love" />Birthdays</h2>
          <p class="mt-2 text-sm"><b>Sneha Patil</b> has a birthday today. Send her a wish! 🎉</p>
        </section>

        @if (store.requests().size) {
          <section class="card mt-4 p-4">
            <div class="flex items-center justify-between"><h2 class="text-sm font-bold">Friend requests</h2><a routerLink="/friends" class="text-xs font-semibold text-brand">See all</a></div>
            @for (id of requestIds(); track id) {
              @let u = store.user(id);
              <div class="mt-3 flex items-center gap-3">
                <app-avatar [user]="u" [size]="40" />
                <div class="min-w-0 flex-1 text-sm">
                  <app-name [user]="u" />
                  <p class="text-xs text-muted">{{ u.mutual }} mutual friends</p>
                  <div class="mt-1.5 flex gap-2">
                    <button class="btn btn-primary btn-sm min-h-8!" (click)="store.acceptRequest(id)">Confirm</button>
                    <button class="btn btn-ghost btn-sm min-h-8!" (click)="store.declineRequest(id)">Delete</button>
                  </div>
                </div>
              </div>
            }
          </section>
        }

        <section class="card mt-4 p-4">
          <h2 class="text-sm font-bold">Friends online</h2>
          @for (id of onlineIds; track id) {
            @let u = store.user(id);
            <button class="mt-2 flex w-full items-center gap-3 rounded-xl p-1 text-left text-sm hover:bg-soft" (click)="openChat(id)">
              <span class="relative"><app-avatar [user]="u" [size]="34" /><span class="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span></span>
              {{ u.name }}
            </button>
          }
        </section>

        <footer class="mt-4 px-2 text-[11px] leading-relaxed text-muted">
          <a routerLink="/privacy" class="hover:underline">Privacy</a> · <a routerLink="/terms" class="hover:underline">Terms</a> ·
          <a routerLink="/guidelines" class="hover:underline">Community guidelines</a> · <a routerLink="/grievance" class="hover:underline">Grievance officer</a>
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
    .dot { position: absolute; top: -6px; right: -8px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9999px; background: var(--color-love); color: #fff; font-size: 10px; font-weight: 700; line-height: 18px; text-align: center; box-shadow: 0 0 0 2px #fff; }
  `,
})
export class Shell {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  private readonly router = inject(Router);

  protected readonly sideNav = SIDE_NAV;
  protected readonly bottomNav = BOTTOM_NAV;
  protected readonly onlineIds = ['u3', 'u2', 'u9', 'u8'];
  protected readonly banner = signal(true);

  private readonly url = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)), { initialValue: this.router.url });
  /** An open chat or reels use the whole phone screen. */
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
}
