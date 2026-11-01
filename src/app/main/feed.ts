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
    <div class="mx-auto max-w-[560px] space-y-5 px-4 py-5 sm:px-0 lg:py-8">
      <!-- Stories: small circles, one tap to open -->
      <section class="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Stories">
        <a routerLink="/create" class="story">
          <span class="relative">
            <app-avatar [user]="store.me" [size]="62" />
            <span class="absolute -right-0.5 -bottom-0.5 grid h-6 w-6 place-items-center rounded-full bg-brand text-white ring-2 ring-soft"><svg lucideIcon="plus" [size]="14" /></span>
          </span>
          <span>Your story</span>
        </a>
        @for (s of store.stories; track s.userId; let i = $index) {
          @let u = store.user(s.userId);
          <button type="button" class="story" (click)="openStory(i)" [attr.aria-label]="'Story by ' + u.name">
            <app-avatar [user]="u" [size]="62" [ring]="!seen().has(i)" />
            <span [class.text-muted]="seen().has(i)">{{ u.name.split(' ')[0] }}</span>
          </button>
        }
      </section>

      <!-- Composer: one row -->
      <section class="card flex items-center gap-3 p-3">
        <app-avatar [user]="store.me" [size]="40" />
        <a routerLink="/create" class="flex-1 rounded-full bg-soft px-4 py-2.5 text-[15px] text-muted hover:bg-line/60">{{ i18n.t('mind') }}</a>
        <a routerLink="/create" class="icon-btn text-emerald-600" aria-label="Add photo"><svg lucideIcon="image" [size]="22" /></a>
      </section>

      <div class="no-scrollbar flex gap-2 overflow-x-auto">
        @for (f of filters; track f) {
          <button class="chip" [class.chip-on]="filter() === f" (click)="filter.set(f)">{{ f }}</button>
        }
      </div>

      @for (p of posts(); track p.id) {
        <app-post-card [post]="p" />
      } @empty {
        <div class="card p-10 text-center text-sm text-muted">{{ filter() === 'Saved' ? 'Tap the bookmark on any post to save it here.' : 'Nothing here yet.' }}</div>
      }

      <section class="py-6 text-center">
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand"><svg lucideIcon="check-check" [size]="24" /></span>
        <h2 class="mt-3 font-bold">{{ i18n.t('caughtUp') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ i18n.t('caughtUpSub') }}</p>
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
          <div class="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/60 p-3">
            <div class="flex justify-center gap-3">
              @for (e of quickReacts; track e) { <button class="text-3xl transition-transform hover:scale-125" (click)="react(e)" [attr.aria-label]="'React ' + e">{{ e }}</button> }
            </div>
            <form class="flex gap-2" (submit)="$event.preventDefault(); reply(box.value); box.value = ''">
              <input #box class="input rounded-full! border-white/40! bg-white/10! text-white placeholder:text-white/70" [placeholder]="'Reply to ' + u.name.split(' ')[0] + '…'" (focus)="pause()" aria-label="Reply to story" />
              <button class="rounded-full p-2 text-white" aria-label="Send reply"><svg lucideIcon="send" [size]="22" /></button>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .story { display: flex; width: 4.5rem; flex-shrink: 0; flex-direction: column; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 600; }
    .story > span:last-child { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .progress { animation: grow 5s linear forwards; }
    @keyframes grow { from { width: 0; } to { width: 100%; } }
  `,
})
export class Feed implements OnDestroy {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  private readonly toast = inject(Toast);

  protected readonly filters: FeedFilter[] = ['All', 'Friends', 'Groups', 'Saved'];
  protected readonly quickReacts = ['❤️', '😂', '😍', '👏', '🙏'];
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

  /** One tap: emoji reaction goes to their chat. */
  react(emoji: string) {
    this.reply(emoji);
  }

  reply(text: string) {
    if (!text.trim()) return;
    const s = this.store.stories[this.storyIndex()!];
    this.store.send(this.store.chatWith(s.userId), '↩️ Story reply: ' + text.trim());
    this.toast.show('Sent to ' + this.store.user(s.userId).name.split(' ')[0]);
    this.step(1);
  }

  closeStory() {
    clearTimeout(this.timer);
    this.storyIndex.set(null);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}
