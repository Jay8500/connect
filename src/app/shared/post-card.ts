import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';
import { Post } from '../core/models';
import { ME_ID } from '../core/data';
import { Store, compact } from '../core/store';
import { Icon } from './icon';
import { Report } from './report';
import { Avatar, Name, SceneView, Toast } from './ui';

const AUDIENCE_ICON: Record<Post['audience'], string> = { Public: 'globe', Friends: 'users', Family: 'heart-handshake', 'Only me': 'lock' };

@Component({
  selector: 'app-post-card',
  imports: [Icon, Avatar, Name, SceneView, RouterLink],
  host: { class: 'block' },
  template: `
    @let p = post();
    @let u = store.user(p.userId);
    <article class="card overflow-hidden">
      <header class="flex items-start gap-3 p-4 pb-2">
        <a [routerLink]="['/profile', u.username]"><app-avatar [user]="u" [size]="42" /></a>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-1 text-[15px]">
            <app-name [user]="u" />
            @if (group(); as g) { <span class="text-muted">▸</span><a routerLink="/groups" class="truncate font-semibold hover:underline">{{ g.name }}</a> }
          </div>
          <div class="flex items-center gap-1.5 text-xs text-muted">
            <span>{{ p.at }}</span>
            @if (p.place) { <span>·</span><svg lucideIcon="map-pin" [size]="12" /><span class="truncate">{{ p.place }}</span> }
            <span>·</span><svg [lucideIcon]="audienceIcon()" [size]="12" [attr.aria-label]="p.audience" />
          </div>
        </div>
        <div class="relative">
          <button class="icon-btn" (click)="menu.set(!menu())" aria-label="Post options"><svg lucideIcon="more" [size]="20" /></button>
          @if (menu()) {
            <div class="fixed inset-0 z-10" (click)="menu.set(false)"></div>
            <div class="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-line bg-white py-1 text-sm shadow-xl">
              <button class="menu-item" (click)="save()"><svg lucideIcon="bookmark" [size]="17" />{{ saved() ? 'Unsave post' : 'Save post' }}</button>
              <button class="menu-item" (click)="copy()"><svg lucideIcon="copy" [size]="17" />Copy link</button>
              @if (mine()) {
                <button class="menu-item text-love" (click)="remove()"><svg lucideIcon="trash" [size]="17" />Delete post</button>
              } @else {
                <button class="menu-item" (click)="hide()"><svg lucideIcon="eye-off" [size]="17" />Hide this post</button>
                <button class="menu-item text-love" (click)="reportIt()"><svg lucideIcon="flag" [size]="17" />Report post</button>
              }
            </div>
          }
        </div>
      </header>

      @if (hidden()) {
        <div class="mx-4 mb-4 flex items-center justify-between rounded-2xl bg-soft p-3 text-sm">
          <span class="text-muted">Post hidden. You’ll see fewer like this.</span>
          <button class="font-semibold text-brand" (click)="hidden.set(false)">Undo</button>
        </div>
      } @else {
        @if (p.text) {
          <p class="px-4 pb-2 text-[15px] leading-relaxed whitespace-pre-line">{{ p.text }}</p>
        }
        @if (p.translation) {
          <div class="px-4 pb-3">
            @if (showTranslation()) {
              <p class="rounded-xl border-l-4 border-brand-3 bg-brand-50/60 px-3 py-2 text-sm text-ink/80">{{ p.translation }}</p>
              <button class="mt-1 text-xs font-semibold text-muted" (click)="translated.set(false)">Show original</button>
            } @else {
              <button class="inline-flex items-center gap-1 text-xs font-semibold text-brand" (click)="translated.set(true)"><svg lucideIcon="languages" [size]="14" />{{ i18n.t('seeTranslation') }}</button>
            }
          </div>
        }

        @if (p.media?.length) {
          <div class="grid gap-0.5" [class.grid-cols-2]="p.media!.length > 1">
            @for (m of p.media!; track $index; let i = $index) {
              <app-scene [scene]="m" [class]="mediaClass(i)" [emoji]="p.media!.length > 1 ? 52 : 84" />
            }
          </div>
        }

        @if (p.poll; as poll) {
          <div class="mx-4 mb-3 space-y-2 rounded-2xl border border-line p-3">
            <p class="flex items-center gap-2 text-sm font-semibold"><svg lucideIcon="chart" [size]="16" class="text-brand" />{{ poll.question }}</p>
            @for (o of poll.options; track $index; let i = $index) {
              <button type="button" (click)="store.vote(p.id, i)" class="relative block w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-sm" [class]="vote() === i ? 'border-brand' : 'border-line hover:border-brand-3'">
                @if (vote() !== undefined) { <span class="absolute inset-y-0 left-0 bg-brand-100" [style.width.%]="percent(i)"></span> }
                <span class="relative flex justify-between gap-2">
                  <span class="font-medium">{{ o.text }} @if (vote() === i) { ✓ }</span>
                  @if (vote() !== undefined) { <span class="font-semibold text-muted">{{ percent(i) }}%</span> }
                </span>
              </button>
            }
            <p class="text-xs text-muted">{{ totalVotes() }} votes · Results show after you vote</p>
          </div>
        }

        <div class="flex items-center justify-between px-4 py-2 text-xs text-muted">
          <span class="inline-flex items-center gap-1">
            <span class="grid h-4.5 w-4.5 place-items-center rounded-full bg-love text-white"><svg lucideIcon="heart" [size]="10" /></span>
            {{ likes() }}
          </span>
          <span>{{ p.comments.length }} {{ p.comments.length === 1 ? 'comment' : 'comments' }} · {{ compact(p.shares) }} shares</span>
        </div>

        <div class="mx-2 grid grid-cols-3 border-t border-line py-1 text-sm font-semibold text-muted">
          <button class="action" [class.text-love]="liked()" (click)="store.toggleLike(p.id)" [attr.aria-pressed]="liked()">
            <svg lucideIcon="heart" [size]="19" [class.fill-love]="liked()" />{{ i18n.t('like') }}
          </button>
          <button class="action" (click)="showComments.set(!showComments())"><svg lucideIcon="message" [size]="19" />{{ i18n.t('comment') }}</button>
          <button class="action" (click)="share()"><svg lucideIcon="share" [size]="19" />{{ i18n.t('share') }}</button>
        </div>

        @if (showComments() || p.comments.length) {
          <div class="space-y-3 border-t border-line px-4 py-3">
            @for (c of visibleComments(); track $index) {
              @let cu = store.user(c.userId);
              <div class="flex gap-2">
                <app-avatar [user]="cu" [size]="30" />
                <div class="min-w-0">
                  <div class="rounded-2xl bg-soft px-3 py-2 text-sm"><app-name [user]="cu" class="text-[13px]" /><p>{{ c.text }}</p></div>
                  <span class="ml-3 text-[11px] text-muted">{{ c.at }}</span>
                </div>
              </div>
            }
            @if (!showComments() && p.comments.length > 1) {
              <button class="text-xs font-semibold text-muted" (click)="showComments.set(true)">View all {{ p.comments.length }} comments</button>
            }
            <form class="flex items-center gap-2" (submit)="$event.preventDefault(); addComment(box)">
              <app-avatar [user]="store.me" [size]="30" />
              <input #box class="input min-h-9! rounded-full! text-sm" placeholder="Write a kind comment…" aria-label="Write a comment" maxlength="500" />
              <button class="icon-btn text-brand" aria-label="Send comment"><svg lucideIcon="send" [size]="18" /></button>
            </form>
          </div>
        }
      }
    </article>
  `,
  styles: `
    .action { display: flex; align-items: center; justify-content: center; gap: 0.4rem; border-radius: 0.75rem; padding: 0.55rem 0; transition: background 0.2s; }
    .action:hover { background: var(--color-soft); }
    .menu-item { display: flex; width: 100%; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem; text-align: left; }
    .menu-item:hover { background: var(--color-soft); }
  `,
})
export class PostCard {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  private readonly toast = inject(Toast);
  private readonly report = inject(Report);
  readonly post = input.required<Post>();

  protected readonly compact = compact;
  protected readonly menu = signal(false);
  protected readonly hidden = signal(false);
  protected readonly showComments = signal(false);
  protected readonly translated = signal<boolean | null>(null);

  protected readonly mine = computed(() => this.post().userId === ME_ID);
  protected readonly liked = computed(() => this.store.liked().has(this.post().id));
  protected readonly saved = computed(() => this.store.saved().has(this.post().id));
  protected readonly likes = computed(() => compact(this.post().likes + (this.liked() ? 1 : 0)));
  protected readonly group = computed(() => this.store.groups.find((g) => g.id === this.post().groupId));
  protected readonly audienceIcon = computed(() => AUDIENCE_ICON[this.post().audience]);
  protected readonly vote = computed(() => this.store.votes().get(this.post().id));
  protected readonly showTranslation = computed(() => this.translated() ?? this.store.settings().autoTranslate);
  protected readonly visibleComments = computed(() => (this.showComments() ? this.post().comments : this.post().comments.slice(-1)));
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

  addComment(box: HTMLInputElement) {
    const text = box.value.trim();
    if (!text) return;
    this.store.addComment(this.post().id, text);
    box.value = '';
    this.showComments.set(true);
  }

  save() {
    this.store.toggleSave(this.post().id);
    this.menu.set(false);
    this.toast.show(this.saved() ? 'Saved to your collection' : 'Removed from saved');
  }

  copy() {
    this.menu.set(false);
    navigator.clipboard?.writeText(`${location.origin}/post/${this.post().id}`).catch(() => {});
    this.toast.show('Link copied');
  }

  hide() {
    this.menu.set(false);
    this.hidden.set(true);
  }

  remove() {
    this.menu.set(false);
    this.store.deletePost(this.post().id);
    this.toast.show('Post deleted');
  }

  reportIt() {
    this.menu.set(false);
    this.report.open('post');
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
