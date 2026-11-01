import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { USERS } from '../core/data';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Avatar, Name, Toast } from '../shared/ui';

type Tab = 'Requests' | 'Your friends' | 'Suggestions';

@Component({
  selector: 'app-friends',
  imports: [RouterLink, Icon, Avatar, Name],
  template: `
    <div class="mx-auto max-w-[680px] px-3 py-4 sm:px-0 lg:py-6">
      <h1 class="text-xl font-bold">Friends</h1>
      <div class="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        @for (t of tabs; track t) {
          <button class="chip" [class.chip-on]="tab() === t" (click)="tab.set(t)">{{ t }} @if (t === 'Requests' && store.requests().size) { <span class="text-love">{{ store.requests().size }}</span> }</button>
        }
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        @for (id of ids(); track id) {
          @let u = store.user(id);
          <div class="card flex items-center gap-3 p-3">
            <a [routerLink]="['/profile', u.username]"><app-avatar [user]="u" [size]="56" /></a>
            <div class="min-w-0 flex-1">
              <app-name [user]="u" />
              <p class="truncate text-xs text-muted">{{ u.city }} · {{ u.mutual ?? 0 }} mutual</p>
              <div class="mt-2 flex gap-2">
                @switch (tab()) {
                  @case ('Requests') {
                    <button class="btn btn-primary btn-sm min-h-8! flex-1" (click)="accept(id)">Confirm</button>
                    <button class="btn btn-ghost btn-sm min-h-8! flex-1" (click)="store.declineRequest(id)">Delete</button>
                  }
                  @case ('Your friends') {
                    <button class="btn btn-ghost btn-sm min-h-8! flex-1" (click)="message(id)"><svg lucideIcon="message" [size]="15" />Message</button>
                    <button class="btn btn-ghost btn-sm min-h-8!" (click)="unfriend(id)" aria-label="Unfriend"><svg lucideIcon="user-check" [size]="15" /></button>
                  }
                  @default {
                    <button class="btn btn-sm min-h-8! flex-1" [class]="store.sent().has(id) ? 'btn-ghost' : 'btn-primary'" (click)="store.sendRequest(id)">
                      {{ store.sent().has(id) ? 'Cancel request' : 'Add friend' }}
                    </button>
                  }
                }
              </div>
            </div>
          </div>
        } @empty {
          <p class="card p-8 text-center text-sm text-muted sm:col-span-2">Nothing here right now.</p>
        }
      </div>
      <p class="mt-6 flex items-start gap-2 rounded-2xl bg-white p-4 text-xs text-muted">
        <svg lucideIcon="lock" [size]="15" class="mt-0.5 shrink-0 text-brand" />
        We never upload your phone contacts without asking. Suggestions come only from mutual friends, your college/work and groups you join.
      </p>
    </div>
  `,
})
export class Friends {
  protected readonly store = inject(Store);
  private readonly toast = inject(Toast);
  private readonly router = inject(Router);
  protected readonly tabs: Tab[] = ['Requests', 'Your friends', 'Suggestions'];
  protected readonly tab = signal<Tab>(this.store.requests().size ? 'Requests' : 'Your friends');

  protected readonly ids = computed(() => {
    switch (this.tab()) {
      case 'Requests': return [...this.store.requests()];
      case 'Your friends': return [...this.store.friends()];
      default: return USERS.filter((u) => u.id !== 'u0' && u.id !== 'sa' && !this.store.friends().has(u.id) && !this.store.requests().has(u.id)).map((u) => u.id);
    }
  });

  accept(id: string) {
    this.store.acceptRequest(id);
    this.toast.show(`You and ${this.store.user(id).name} are now friends 🎉`);
  }

  unfriend(id: string) {
    this.store.unfriend(id);
    this.toast.show(`Removed ${this.store.user(id).name} from friends`);
  }

  message(id: string) {
    this.router.navigate(['/chats', this.store.chatWith(id)]);
  }
}
