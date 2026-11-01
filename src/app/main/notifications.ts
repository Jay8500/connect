import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationKind } from '../core/models';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Avatar } from '../shared/ui';

const KIND_ICON: Record<NotificationKind, { icon: string; cls: string }> = {
  like: { icon: 'heart', cls: 'bg-love' },
  comment: { icon: 'message', cls: 'bg-emerald-500' },
  friend: { icon: 'user-plus', cls: 'bg-sky-500' },
  group: { icon: 'users', cls: 'bg-brand' },
  birthday: { icon: 'cake', cls: 'bg-amber-500' },
  safety: { icon: 'shield-check', cls: 'bg-ink' },
  memory: { icon: 'history', cls: 'bg-violet-500' },
};

@Component({
  selector: 'app-notifications',
  imports: [RouterLink, Icon, Avatar],
  template: `
    <div class="mx-auto max-w-[600px] px-3 py-4 sm:px-0 lg:py-6">
      <div class="mb-3 flex items-center justify-between">
        <h1 class="text-xl font-bold">Notifications</h1>
        <button class="text-sm font-semibold text-brand" (click)="store.markAllRead()">Mark all as read</button>
      </div>
      <ul class="card divide-y divide-line overflow-hidden">
        @for (n of store.notifications(); track n.id) {
          <li>
            <a [routerLink]="n.link" class="flex items-start gap-3 p-4 hover:bg-soft" [class.bg-brand-50]="!n.read">
              <span class="relative shrink-0">
                @if (n.userId) {
                  <app-avatar [user]="store.user(n.userId)" [size]="46" />
                } @else {
                  <span class="grid h-[46px] w-[46px] place-items-center rounded-full bg-soft text-brand"><svg [lucideIcon]="kind[n.kind].icon" [size]="22" /></span>
                }
                <span class="absolute -right-1 -bottom-1 grid h-6 w-6 place-items-center rounded-full text-white ring-2 ring-white" [class]="kind[n.kind].cls"><svg [lucideIcon]="kind[n.kind].icon" [size]="12" /></span>
              </span>
              <span class="min-w-0 flex-1 text-[15px]">
                {{ n.text }}
                <span class="mt-0.5 block text-xs" [class]="n.read ? 'text-muted' : 'font-semibold text-brand'">{{ n.at }}</span>
              </span>
              @if (!n.read) { <span class="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand"></span> }
            </a>
          </li>
        }
      </ul>
      <p class="mt-4 text-center text-xs text-muted">Only things that matter. Turn types on or off in <a routerLink="/settings" class="font-semibold text-brand">Settings</a>.</p>
    </div>
  `,
})
export class Notifications {
  protected readonly store = inject(Store);
  protected readonly kind = KIND_ICON;
}
