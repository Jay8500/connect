import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { PostCard } from '../shared/post-card';
import { Avatar, SceneView, Toast } from '../shared/ui';

type FeedFilter = 'All' | 'Friends' | 'Groups' | 'Saved';
const STORY_MS = 5000;

@Component({
  selector: 'app-feed',
  imports: [RouterLink, Icon, Avatar, SceneView, PostCard],
  template: `
    <div class="mx-auto max-w-[600px] space-y-4 px-3 py-4 sm:px-0 lg:py-6">
      <!-- Stories -->
      <section class="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 sm:mx-0 sm:px-0" aria-label="Stories">
        <a routerLink="/create" class="story-tile border border-line bg-white">
          <div class="relative grid h-2/3 place-items-center bg-brand-50"><app-avatar [user]="store.me" [size]="52" /></div>
          <span class="absolute top-[58%] left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-brand text-white ring-4 ring-white"><svg lucideIcon="plus" [size]="18" /></span>
          <span class="absolute inset-x-0 bottom-2 text-center text-xs font-semibold">Your story</span>
        </a>
        @for (s of store.stories; track s.userId; let i = $index) {
          @let u = store.user(s.userId);
          <button type="button" class="story-tile" (click)="openStory(i)" [attr.aria-label]="'Story by ' + u.name">
            <app-scene [scene]="s.scene" [emoji]="40" [caption]="false" class="h-full" />
            <app-avatar [user]="u" [size]="34" [ring]="!seen().has(i)" class="absolute top-2 left-2" />
            <span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-2 text-left text-xs font-semibold text-white">{{ u.name.split(' ')[0] }}</span>
          </button>
        }
      </section>

      <!-- Composer -->
      <section class="card p-3">
        <div class="flex items-center gap-3">
          <app-avatar [user]="store.me" [size]="42" />
          <a routerLink="/create" class="flex-1 rounded-full bg-soft px-4 py-2.5 text-[15px] text-muted hover:bg-line/60">{{ i18n.t('mind') }}</a>
        </div>
        <div class="mt-2 grid grid-cols-3 border-t border-line pt-2 text-sm font-semibold text-muted">
          <a routerLink="/create" class="quick"><svg lucideIcon="image" [size]="20" class="text-emerald-600" />Photo</a>
          <a routerLink="/create" class="quick"><svg lucideIcon="smile" [size]="20" class="text-amber-500" />Feeling</a>
          <a routerLink="/create" class="quick"><svg lucideIcon="chart" [size]="20" class="text-sky-600" />Poll</a>
        </div>
      </section>

      <!-- Filters -->
      <div class="no-scrollbar flex gap-2 overflow-x-auto">
        @for (f of filters; track f) {
          <button class="chip" [class.chip-on]="filter() === f" (click)="filter.set(f)">{{ f }}</button>
        }
        <span class="chip ml-auto border-dashed text-muted"><svg lucideIcon="clock" [size]="14" />Latest first, no tricks</span>
      </div>

      @for (p of posts(); track p.id) {
        <app-post-card [post]="p" />
      } @empty {
        <div class="card p-8 text-center text-sm text-muted">Nothing here yet.</div>
      }

      <section class="card p-6 text-center">
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand"><svg lucideIcon="check-check" [size]="24" /></span>
        <h2 class="mt-3 font-bold">{{ i18n.t('caughtUp') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ i18n.t('caughtUpSub') }}</p>
        <a routerLink="/explore" class="btn btn-ghost btn-sm mt-4">Explore more</a>
      </section>
    </div>

    <!-- Story viewer -->
    @if (storyIndex() !== null) {
      @let s = store.stories[storyIndex()!];
      @let u = store.user(s.userId);
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black" role="dialog" aria-modal="true" [attr.aria-label]="'Story by ' + u.name">
        <div class="relative h-full w-full max-w-md overflow-hidden sm:h-[92dvh] sm:rounded-3xl">
          <app-scene [scene]="s.scene" [emoji]="120" [caption]="false" class="h-full" />
          <div class="absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 p-3">
            <div class="flex gap-1">
              @for (x of store.stories; track $index; let i = $index) {
                <span class="h-0.5 flex-1 overflow-hidden rounded bg-white/40">
                  <span class="block h-full bg-white" [class.progress]="i === storyIndex()" [style.width.%]="i < storyIndex()! ? 100 : i === storyIndex() ? null : 0"></span>
                </span>
              }
            </div>
            <div class="mt-3 flex items-center gap-2 text-white">
              <app-avatar [user]="u" [size]="34" />
              <span class="text-sm font-semibold">{{ u.name }}</span><span class="text-xs text-white/70">{{ s.at }}</span>
              <button class="ml-auto rounded-full p-2 hover:bg-white/10" (click)="closeStory()" aria-label="Close story"><svg lucideIcon="x" [size]="22" /></button>
            </div>
          </div>
          @if (s.scene.label) { <p class="absolute inset-x-0 top-1/3 text-center text-2xl font-bold text-white drop-shadow">{{ s.scene.label }}</p> }
          <button class="absolute inset-y-16 left-0 w-1/3" (click)="step(-1)" aria-label="Previous story"></button>
          <button class="absolute inset-y-16 right-0 w-1/3" (click)="step(1)" aria-label="Next story"></button>
          <form class="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/60 p-3" (submit)="$event.preventDefault(); reply(box)">
            <input #box class="input rounded-full! border-white/40! bg-white/10! text-white placeholder:text-white/70" [placeholder]="'Reply to ' + u.name.split(' ')[0] + '…'" (focus)="pause()" aria-label="Reply to story" />
            <button class="rounded-full p-2 text-white" aria-label="Send reply"><svg lucideIcon="send" [size]="22" /></button>
          </form>
        </div>
      </div>
    }
  `,
  styles: `
    .story-tile { position: relative; height: 11rem; width: 6.5rem; flex-shrink: 0; overflow: hidden; border-radius: 1.1rem; }
    .quick { display: flex; align-items: center; justify-content: center; gap: 0.45rem; border-radius: 0.75rem; padding: 0.5rem 0; }
    .quick:hover { background: var(--color-soft); }
    .progress { animation: grow 5s linear forwards; }
    @keyframes grow { from { width: 0; } to { width: 100%; } }
  `,
})
export class Feed implements OnDestroy {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  private readonly toast = inject(Toast);

  protected readonly filters: FeedFilter[] = ['All', 'Friends', 'Groups', 'Saved'];
  protected readonly filter = signal<FeedFilter>('All');
  protected readonly storyIndex = signal<number | null>(null);
  protected readonly seen = signal(new Set<number>());
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly posts = computed(() => {
    const all = this.store.posts();
    switch (this.filter()) {
      case 'Friends': return all.filter((p) => this.store.friends().has(p.userId) && !p.groupId);
      case 'Groups': return all.filter((p) => p.groupId);
      case 'Saved': return all.filter((p) => this.store.saved().has(p.id));
      default: return all;
    }
  });

  openStory(i: number) {
    this.storyIndex.set(i);
    this.seen.update((s) => new Set(s).add(i));
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.step(1), STORY_MS);
  }

  step(d: number) {
    const next = this.storyIndex()! + d;
    if (next < 0 || next >= this.store.stories.length) this.closeStory();
    else this.openStory(next);
  }

  pause() {
    clearTimeout(this.timer);
  }

  reply(box: HTMLInputElement) {
    if (!box.value.trim()) return;
    const s = this.store.stories[this.storyIndex()!];
    this.store.send(this.store.chatWith(s.userId), '↩️ Story reply: ' + box.value.trim());
    box.value = '';
    this.toast.show('Reply sent in chat');
    this.closeStory();
  }

  closeStory() {
    clearTimeout(this.timer);
    this.storyIndex.set(null);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}
