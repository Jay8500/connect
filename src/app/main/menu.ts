import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n, WordKey } from '../core/i18n';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { PhotoButton } from '../shared/photo';
import { Avatar } from '../shared/ui';

const SHORTCUTS: { path: string; icon: string; word: WordKey; cls: string }[] = [
  { path: '/friends', icon: 'users', word: 'friends', cls: 'text-sky-600' },
  { path: '/groups', icon: 'heart-handshake', word: 'groups', cls: 'text-brand' },
  { path: '/explore', icon: 'compass', word: 'explore', cls: 'text-violet-600' },
  { path: '/notifications', icon: 'bell', word: 'notifications', cls: 'text-amber-500' },
  { path: '/reels', icon: 'film', word: 'reels', cls: 'text-love' },
  { path: '/settings', icon: 'settings', word: 'settings', cls: 'text-slate-600' },
];

/** Phone-only "You" tab: profile, shortcuts and legal links. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, Icon, Avatar, PhotoButton],
  template: `
    <div class="mx-auto max-w-[600px] space-y-4 px-3 py-4">
      <div class="card flex items-center gap-3 p-4">
        <span class="relative">
          <app-avatar [user]="store.me" [size]="56" />
          <span class="absolute -right-1 -bottom-1"><app-photo-button cls="grid h-7 w-7 place-items-center rounded-full bg-brand text-white ring-2 ring-white" [iconSize]="14" /></span>
        </span>
        <a [routerLink]="['/profile', store.me.username]" class="flex flex-1 items-center">
          <span class="flex-1"><b class="block text-lg">{{ store.me.name }}</b><span class="text-sm text-muted">See your profile</span></span>
          <svg lucideIcon="chevron-right" [size]="20" class="text-muted" />
        </a>
      </div>
      <div class="grid grid-cols-2 gap-3">
        @for (s of shortcuts; track s.path) {
          <a [routerLink]="s.path" class="card flex flex-col gap-2 p-4 font-semibold"><svg [lucideIcon]="s.icon" [size]="24" [class]="s.cls" />{{ i18n.t(s.word) }}</a>
        }
      </div>
      <div class="card divide-y divide-line text-sm">
        <a routerLink="/grievance" class="flex items-center gap-3 p-4"><svg lucideIcon="flag" [size]="18" />Complaints & Grievance Officer</a>
        <a routerLink="/guidelines" class="flex items-center gap-3 p-4"><svg lucideIcon="users" [size]="18" />Community guidelines</a>
        <a routerLink="/privacy" class="flex items-center gap-3 p-4"><svg lucideIcon="lock" [size]="18" />Privacy policy</a>
        <a routerLink="/terms" class="flex items-center gap-3 p-4"><svg lucideIcon="info" [size]="18" />Terms of use</a>
      </div>
      <a routerLink="/" class="btn btn-ghost w-full text-love"><svg lucideIcon="log-out" [size]="18" />Log out</a>
      <p class="text-center text-xs text-muted">Powered by Spread Apps™ · Made with ❤️ in India</p>
    </div>
  `,
})
export class Menu {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  protected readonly shortcuts = SHORTCUTS;
}
