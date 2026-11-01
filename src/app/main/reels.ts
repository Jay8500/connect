import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store, compact } from '../core/store';
import { Icon } from '../shared/icon';
import { Report } from '../shared/report';
import { Avatar, SceneView, Toast } from '../shared/ui';

@Component({
  selector: 'app-reels',
  imports: [RouterLink, Icon, Avatar, SceneView],
  template: `
    <div class="mx-auto max-w-[440px] lg:py-6">
      <div class="reels no-scrollbar snap-y snap-mandatory overflow-y-auto lg:rounded-3xl">
        @for (r of store.reels; track r.id) {
          @let u = store.user(r.userId);
          @let liked = store.liked().has(r.id);
          <section class="reel relative snap-start snap-always overflow-hidden bg-black">
            <button type="button" class="absolute inset-0" (click)="togglePlay(r.id)" [attr.aria-label]="paused().has(r.id) ? 'Play' : 'Pause'">
              <app-scene [scene]="r.scene" [emoji]="110" [caption]="false" class="h-full" />
              @if (paused().has(r.id)) {
                <span class="absolute inset-0 grid place-items-center"><span class="grid h-16 w-16 place-items-center rounded-full bg-black/40 text-white"><svg lucideIcon="play" [size]="30" /></span></span>
              }
            </button>

            <div class="absolute right-2 bottom-24 flex flex-col items-center gap-4 text-white">
              <button class="reel-action" (click)="store.toggleLike(r.id)" [attr.aria-pressed]="liked" aria-label="Like">
                <svg lucideIcon="heart" [size]="28" [class.fill-love]="liked" [class.text-love]="liked" />{{ compact(r.likes + (liked ? 1 : 0)) }}
              </button>
              <button class="reel-action" (click)="toast.show('Comments open in the real app')" aria-label="Comments"><svg lucideIcon="message" [size]="28" />{{ compact(r.comments) }}</button>
              <button class="reel-action" (click)="toast.show('Share sheet opens in the real app')" aria-label="Share"><svg lucideIcon="send" [size]="26" />Share</button>
              <button class="reel-action" (click)="report.open('reel')" aria-label="More"><svg lucideIcon="more" [size]="26" /></button>
            </div>

            <div class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 pr-16 text-white">
              <div class="pointer-events-auto flex items-center gap-2">
                <a [routerLink]="['/profile', u.username]" class="flex items-center gap-2"><app-avatar [user]="u" [size]="34" /><span class="text-sm font-semibold">{{ u.name }}</span></a>
                @if (!store.isFriend(u.id)) {
                  <button class="rounded-full border border-white/70 px-3 py-1 text-xs font-semibold" (click)="store.sendRequest(u.id)">{{ store.sent().has(u.id) ? 'Requested' : 'Follow' }}</button>
                }
              </div>
              <p class="mt-2 text-sm">{{ r.caption }}</p>
              <p class="mt-1.5 flex items-center gap-1.5 text-xs text-white/80"><svg lucideIcon="music" [size]="13" />{{ r.audio }}</p>
            </div>
          </section>
        }
        <section class="reel grid snap-start place-items-center bg-ink p-8 text-center text-white">
          <div>
            <svg lucideIcon="check-check" [size]="36" class="mx-auto text-brand-3" />
            <h2 class="mt-3 text-lg font-bold">That’s all for now</h2>
            <p class="mt-1 text-sm text-white/70">No endless scrolling here. Go call someone you love 💚</p>
            <a routerLink="/home" class="btn btn-primary mt-5">Back to Home</a>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: `
    .reels, .reel { height: calc(100dvh - 7.5rem); }
    @media (min-width: 1024px) { .reels, .reel { height: calc(100dvh - 3rem); } }
    .reel-action { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; font-size: 0.72rem; font-weight: 600; filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.5)); }
  `,
})
export class Reels {
  protected readonly store = inject(Store);
  protected readonly toast = inject(Toast);
  protected readonly report = inject(Report);
  protected readonly compact = compact;
  protected readonly paused = signal(new Set<string>());

  togglePlay(id: string) {
    this.paused.update((s) => {
      const n = new Set(s);
      if (!n.delete(id)) n.add(id);
      return n;
    });
  }
}
