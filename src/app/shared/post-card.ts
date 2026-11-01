import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';
import { Post } from '../core/models';
import { Store, compact } from '../core/store';
import { Icon } from './icon';
import { Report } from './report';
import { Avatar, Dropdown, Name, SceneView, Toast } from './ui';

const AUDIENCE_ICON: Record<Post['audience'], string> = { Public: 'globe', Friends: 'users', Family: 'heart-handshake', 'Only me': 'lock' };

@Component({
  selector: 'app-post-card',
  imports: [Icon, Avatar, Name, SceneView, Dropdown, RouterLink],
  host: { class: 'block' },
  template: `
    @let p = post();
    @let u = store.user(p.userId);
    <article class="card overflow-hidden">
      <header class="flex items-center gap-3 px-4 pt-4 pb-3">
        <a [routerLink]="['/profile', u.username]"><app-avatar [user]="u" [size]="40" /></a>
        <div class="min-w-0 flex-1 leading-tight">
          <div class="flex flex-wrap items-center gap-x-1 text-[15px]">
            <app-name [user]="u" />
            @if (group(); as g) { <span class="text-muted">in</span><a routerLink="/groups" class="truncate font-semibold hover:underline">{{ g.name }}</a> }
          </div>
          <div class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span>{{ p.at }}</span>
            @if (p.place) { <span>·</span><span class="truncate">{{ p.place }}</span> }
            <span>·</span><svg [lucideIcon]="audienceIcon()" [size]="12" [attr.aria-label]="p.audience" />
          </div>
        </div>
        <app-dropdown label="Post options">
          <button class="menu-item" (click)="copy()"><svg lucideIcon="copy" [size]="17" />Copy link</button>
          @if (mine()) {
            <button class="menu-item text-love" (click)="remove()"><svg lucideIcon="trash" [size]="17" />Delete post</button>
          } @else {
            <button class="menu-item" (click)="hidden.set(true)"><svg lucideIcon="eye-off" [size]="17" />Hide this post</button>
            <button class="menu-item text-love" (click)="report.open('post')"><svg lucideIcon="flag" [size]="17" />Report post</button>
          }
        </app-dropdown>
      </header>

      @if (hidden()) {
        <div class="mx-4 mb-4 flex items-center justify-between rounded-2xl bg-soft p-3 text-sm">
          <span class="text-muted">Post hidden. You’ll see fewer like this.</span>
          <button class="font-semibold text-brand" (click)="hidden.set(false)">Undo</button>
        </div>
      } @else {
        @if (p.text) {
          <p class="px-4 pb-3 text-[15px] leading-relaxed whitespace-pre-line">{{ showTranslation() && p.translation ? p.translation : p.text }}</p>
        }
        @if (p.translation) {
          <button class="-mt-1 mb-3 ml-4 inline-flex items-center gap-1 text-xs font-semibold text-brand" (click)="translated.set(!showTranslation())">
            <svg lucideIcon="languages" [size]="14" />{{ showTranslation() ? 'Show original' : i18n.t('seeTranslation') }}
          </button>
        }

        @if (p.media?.length) {
          <!-- double-tap a photo to like it -->
          <div class="relative grid gap-0.5" [class.grid-cols-2]="p.media!.length > 1" (dblclick)="doubleTap()">
            @for (m of p.media!; track $index; let i = $index) {
              <app-scene [scene]="m" [class]="mediaClass(i)" [emoji]="p.media!.length > 1 ? 52 : 84" />
            }
            @if (burst()) {
              <span class="burst pointer-events-none absolute inset-0 grid place-items-center"><svg lucideIcon="heart" [size]="96" class="fill-white text-white drop-shadow-xl" /></span>
            }
          </div>
        }

        @if (p.poll; as poll) {
          <div class="mx-4 mb-3 space-y-2">
            <p class="text-sm font-semibold">{{ poll.question }}</p>
            @for (o of poll.options; track $index; let i = $index) {
              <button type="button" (click)="store.vote(p.id, i)" class="relative block w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm" [class]="vote() === i ? 'border-brand' : 'border-line hover:border-brand-3'">
                @if (vote() !== undefined) { <span class="absolute inset-y-0 left-0 bg-brand-100" [style.width.%]="percent(i)"></span> }
                <span class="relative flex justify-between gap-2">
                  <span class="font-medium">{{ o.text }} @if (vote() === i) { ✓ }</span>
                  @if (vote() !== undefined) { <span class="font-semibold text-muted">{{ percent(i) }}%</span> }
                </span>
              </button>
            }
            <p class="text-xs text-muted">{{ totalVotes() }} votes</p>
          </div>
        }

        <!-- One row: actions with their counts -->
        <div class="flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-muted">
          <button class="action" [class.text-love]="liked()" (click)="store.toggleLike(p.id)" [attr.aria-pressed]="liked()" [attr.aria-label]="i18n.t('like')">
            <svg lucideIcon="heart" [size]="21" [class.fill-love]="liked()" />{{ likes() }}
          </button>
          <button class="action" [class.text-ink]="open()" (click)="open.set(!open())" [attr.aria-label]="i18n.t('comment')"><svg lucideIcon="message" [size]="21" />{{ p.comments.length }}</button>
          <button class="action" (click)="share()" [attr.aria-label]="i18n.t('share')"><svg lucideIcon="share" [size]="20" />{{ compact(p.shares) }}</button>
          <button class="action ml-auto" [class.text-brand]="saved()" (click)="save()" [attr.aria-pressed]="saved()" aria-label="Save"><svg lucideIcon="bookmark" [size]="21" [class.fill-brand]="saved()" /></button>
        </div>

        @if (open()) {
          <div class="space-y-3 border-t border-line px-4 py-3">
            @for (c of p.comments; track $index) {
              @let cu = store.user(c.userId);
              <div class="flex gap-2">
                <app-avatar [user]="cu" [size]="30" />
                <div class="min-w-0">
                  <div class="rounded-2xl bg-soft px-3 py-2 text-sm"><app-name [user]="cu" class="text-[13px]" /><p>{{ c.text }}</p></div>
                  <span class="ml-3 text-[11px] text-muted">{{ c.at }}</span>
                </div>
              </div>
            }
            <div class="no-scrollbar flex gap-1.5 overflow-x-auto">
              @for (q of quickComments; track q) { <button class="chip py-1!" (click)="addComment(q)">{{ q }}</button> }
            </div>
            <form class="flex items-center gap-2" (submit)="$event.preventDefault(); addComment(box.value); box.value = ''">
              <input #box class="input min-h-10! rounded-full! text-sm" placeholder="Write a kind comment…" aria-label="Write a comment" maxlength="500" />
              <button class="icon-btn text-brand" aria-label="Send comment"><svg lucideIcon="send" [size]="18" /></button>
            </form>
          </div>
        } @else if (p.comments.length) {
          <button class="block px-4 pb-3 text-left text-sm text-muted" (click)="open.set(true)">
            <b class="text-ink">{{ store.user(p.comments[p.comments.length - 1].userId).name.split(' ')[0] }}</b> {{ p.comments[p.comments.length - 1].text }}
            @if (p.comments.length > 1) { <span class="block text-xs">View all {{ p.comments.length }} comments</span> }
          </button>
        }
      }
    </article>
  `,
  styles: `
    .action { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 9999px; padding: 0.45rem 0.7rem; transition: background 0.2s, color 0.2s; }
    .action:hover { background: var(--color-soft); }
    .burst { animation: burst 0.8s ease-out forwards; }
    @keyframes burst { 0% { opacity: 0; transform: scale(0.4); } 20% { opacity: 1; transform: scale(1.1); } 70% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1); } }
  `,
})
export class PostCard {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  private readonly toast = inject(Toast);
  protected readonly report = inject(Report);
  readonly post = input.required<Post>();

  protected readonly compact = compact;
  protected readonly quickComments = ['👏 Super!', '😍', '🙏 Congrats', '😂', 'So true!'];
  protected readonly hidden = signal(false);
  protected readonly open = signal(false);
  protected readonly burst = signal(false);
  protected readonly translated = signal<boolean | null>(null);

  protected readonly mine = computed(() => this.post().userId === this.store.me.id);
  protected readonly liked = computed(() => this.store.liked().has(this.post().id));
  protected readonly saved = computed(() => this.store.saved().has(this.post().id));
  protected readonly likes = computed(() => compact(this.post().likes + (this.liked() ? 1 : 0)));
  protected readonly group = computed(() => this.store.groups.find((g) => g.id === this.post().groupId));
  protected readonly audienceIcon = computed(() => AUDIENCE_ICON[this.post().audience]);
  protected readonly vote = computed(() => this.store.votes().get(this.post().id));
  protected readonly showTranslation = computed(() => this.translated() ?? this.store.settings().autoTranslate);
  protected readonly totalVotes = computed(() => (this.post().poll?.options.reduce((n, o) => n + o.votes, 0) ?? 0) + (this.vote() !== undefined ? 1 : 0));

  mediaClass(i: number): string {
    const n = this.post().media!.length;
    if (n === 1) return 'aspect-[4/3]';
    if (n === 3 && i === 0) return 'col-span-2 aspect-[2/1]';
    return 'aspect-square';
  }

  percent(i: number): number {
    const o = this.post().poll!.options;
    const votes = o[i].votes + (this.vote() === i ? 1 : 0);
    return Math.round((votes / this.totalVotes()) * 100);
  }

  doubleTap() {
    if (!this.liked()) this.store.toggleLike(this.post().id);
    this.burst.set(true);
    setTimeout(() => this.burst.set(false), 800);
  }

  addComment(text: string) {
    if (!text.trim()) return;
    this.store.addComment(this.post().id, text.trim());
  }

  save() {
    this.store.toggleSave(this.post().id);
    this.toast.show(this.saved() ? 'Saved — find it under “Saved” on Home' : 'Removed from saved');
  }

  copy() {
    navigator.clipboard?.writeText(`${location.origin}/profile/${this.store.user(this.post().userId).username}`).catch(() => {});
    this.toast.show('Link copied');
  }

  remove() {
    this.store.deletePost(this.post().id);
    this.toast.show('Post deleted');
  }

  async share() {
    const data = { title: 'Connect', text: this.post().text.slice(0, 120), url: location.origin };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        this.toast.show('Link copied — paste it anywhere');
      }
    } catch {
      /* share sheet closed */
    }
  }
}
