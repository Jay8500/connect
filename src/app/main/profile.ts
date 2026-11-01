import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store, compact } from '../core/store';
import { Icon } from '../shared/icon';
import { PostCard } from '../shared/post-card';
import { Report } from '../shared/report';
import { Avatar, SceneView, Toast } from '../shared/ui';

type Tab = 'Posts' | 'Photos' | 'About';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, Icon, Avatar, SceneView, PostCard],
  template: `
    @if (user(); as u) {
      <div class="mx-auto max-w-[680px] lg:py-6">
        <section class="overflow-hidden bg-white sm:card">
          <app-scene [scene]="cover()" [emoji]="56" [caption]="false" class="h-36 sm:h-48" />
          <div class="px-4 pb-4">
            <div class="relative z-10 -mt-12 flex items-end justify-between gap-3">
              <app-avatar [user]="u" [size]="104" class="rounded-full ring-4 ring-white" />
              <div class="flex gap-2 pb-1">
                @if (isMe()) {
                  <button class="btn btn-primary btn-sm" (click)="toast.show('Edit profile (real app)')">Edit profile</button>
                  <a routerLink="/settings" class="btn btn-ghost btn-sm" aria-label="Settings"><svg lucideIcon="settings" [size]="16" /></a>
                } @else if (!blocked()) {
                  @if (store.isFriend(u.id)) {
                    <button class="btn btn-ghost btn-sm"><svg lucideIcon="user-check" [size]="16" />Friends</button>
                  } @else {
                    <button class="btn btn-primary btn-sm" (click)="store.sendRequest(u.id)"><svg [lucideIcon]="store.sent().has(u.id) ? 'check' : 'user-plus'" [size]="16" />{{ store.sent().has(u.id) ? 'Requested' : 'Add friend' }}</button>
                  }
                  <button class="btn btn-ghost btn-sm" (click)="message()"><svg lucideIcon="message" [size]="16" />Message</button>
                  <div class="relative">
                    <button class="btn btn-ghost btn-sm px-2.5!" (click)="menu.set(!menu())" aria-label="More"><svg lucideIcon="more" [size]="16" /></button>
                    @if (menu()) {
                      <div class="fixed inset-0 z-10" (click)="menu.set(false)"></div>
                      <div class="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-2xl border border-line bg-white py-1 text-sm shadow-xl">
                        <button class="menu-item" (click)="copy()"><svg lucideIcon="copy" [size]="17" />Copy profile link</button>
                        <button class="menu-item text-love" (click)="block()"><svg lucideIcon="ban" [size]="17" />Block</button>
                        <button class="menu-item text-love" (click)="report.open('profile'); menu.set(false)"><svg lucideIcon="flag" [size]="17" />Report profile</button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
            <h1 class="mt-3 flex items-center gap-1.5 text-2xl font-extrabold">{{ u.name }} @if (u.verified) { <svg lucideIcon="badge-check" [size]="22" class="text-sky-500" /> }</h1>
            <p class="text-sm text-muted">&#64;{{ u.username }}</p>
            <p class="mt-2 text-[15px]">{{ u.bio }}</p>
            <div class="mt-3 flex gap-5 text-sm">
              <span class="text-muted"><b class="text-ink">{{ posts().length }}</b> posts</span>
              <span class="text-muted"><b class="text-ink">{{ compact(u.followers) }}</b> followers</span>
              <span class="text-muted"><b class="text-ink">{{ compact(u.following) }}</b> following</span>
            </div>
          </div>
          @if (!blocked()) {
            <nav class="flex border-t border-line px-2">
              @for (t of tabs; track t) {
                <button class="flex-1 border-b-2 py-3 text-sm font-semibold" [class]="tab() === t ? 'border-brand text-brand' : 'border-transparent text-muted'" (click)="tab.set(t)">{{ t }}</button>
              }
            </nav>
          }
        </section>

        <div class="mt-3 space-y-3 px-3 sm:px-0">
          @if (blocked()) {
            <div class="card p-6 text-center text-sm">
              <p>You blocked {{ u.name }}. They can’t see your profile or message you.</p>
              <button class="btn btn-ghost btn-sm mt-3" (click)="store.unblock(u.id)">Unblock</button>
            </div>
          } @else {
            @switch (tab()) {
              @case ('Posts') {
                @for (p of posts(); track p.id) { <app-post-card [post]="p" /> } @empty { <p class="card p-8 text-center text-sm text-muted">No posts yet.</p> }
              }
              @case ('Photos') {
                <div class="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl">
                  @for (s of photos(); track $index) { <app-scene [scene]="s" [emoji]="36" [caption]="false" class="aspect-square" /> }
                  @empty { <p class="col-span-3 card p-8 text-center text-sm text-muted">No photos yet.</p> }
                </div>
              }
              @case ('About') {
                <ul class="card space-y-3 p-4 text-[15px]">
                  <li class="flex gap-3"><svg lucideIcon="map-pin" [size]="20" class="text-muted" />Lives in <b>{{ u.city }}</b></li>
                  @if (u.work) { <li class="flex gap-3"><svg lucideIcon="sparkles" [size]="20" class="text-muted" />{{ u.work }}</li> }
                  @if (u.study) { <li class="flex gap-3"><svg lucideIcon="users" [size]="20" class="text-muted" />Studied at <b>{{ u.study }}</b></li> }
                  <li class="flex gap-3"><svg lucideIcon="languages" [size]="20" class="text-muted" />Speaks {{ u.langs.join(', ') }}</li>
                  @if (u.birthday && isMe()) { <li class="flex gap-3"><svg lucideIcon="cake" [size]="20" class="text-muted" />Birthday {{ u.birthday }} <span class="text-xs text-muted">(only friends)</span></li> }
                  <li class="flex gap-3 text-sm text-muted"><svg lucideIcon="lock" [size]="20" />Phone number and email are always private.</li>
                </ul>
              }
            }
          }
        </div>
      </div>
    } @else {
      <div class="mx-auto max-w-md p-10 text-center">
        <h1 class="text-lg font-bold">Profile not found</h1>
        <p class="mt-1 text-sm text-muted">This account may have been deleted or the link is wrong.</p>
        <a routerLink="/home" class="btn btn-primary mt-4">Go home</a>
      </div>
    }
  `,
  styles: `
    .menu-item { display: flex; width: 100%; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem; text-align: left; }
    .menu-item:hover { background: var(--color-soft); }
  `,
})
export class Profile {
  protected readonly store = inject(Store);
  protected readonly toast = inject(Toast);
  protected readonly report = inject(Report);
  private readonly router = inject(Router);

  readonly username = input.required<string>();
  protected readonly compact = compact;
  protected readonly tabs: Tab[] = ['Posts', 'Photos', 'About'];
  protected readonly tab = signal<Tab>('Posts');
  protected readonly menu = signal(false);

  protected readonly user = computed(() => this.store.byUsername(this.username()));
  protected readonly isMe = computed(() => this.user()?.id === this.store.me.id);
  protected readonly blocked = computed(() => this.store.blocked().has(this.user()?.id ?? ''));
  protected readonly posts = computed(() => this.store.posts().filter((p) => p.userId === this.user()?.id));
  protected readonly photos = computed(() => this.posts().flatMap((p) => p.media ?? []));
  protected readonly cover = computed(() => {
    const u = this.user()!;
    return u.cover ?? { from: `hsl(${u.hue} 60% 40%)`, to: `hsl(${(u.hue + 50) % 360} 70% 70%)`, emoji: '' };
  });

  message() {
    this.router.navigate(['/chats', this.store.chatWith(this.user()!.id)]);
  }

  block() {
    this.menu.set(false);
    this.store.block(this.user()!.id);
    this.toast.show(`${this.user()!.name} is blocked`);
  }

  copy() {
    this.menu.set(false);
    navigator.clipboard?.writeText(location.href).catch(() => {});
    this.toast.show('Profile link copied');
  }
}
