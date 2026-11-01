import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Post, Scene } from '../core/models';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Avatar, SceneView, Toast } from '../shared/ui';

const AUDIENCES: Post['audience'][] = ['Friends', 'Public', 'Family', 'Only me'];
const AUDIENCE_HINT: Record<Post['audience'], string> = {
  Friends: 'Only your friends',
  Public: 'Anyone on or off Connect',
  Family: 'Only people in your Family list',
  'Only me': 'Just you — like a diary',
};
const PHOTOS: Scene[] = [
  { from: '#f59e0b', to: '#fde68a', emoji: '🪔', label: 'Diwali' },
  { from: '#0e7490', to: '#67e8f9', emoji: '🏖️', label: 'Vizag beach' },
  { from: '#c2410c', to: '#fed7aa', emoji: '🍛', label: 'Sunday biryani' },
  { from: '#15803d', to: '#86efac', emoji: '🌴', label: 'Araku valley' },
];
const FEELINGS = ['😊 happy', '🙏 blessed', '🥳 celebrating', '😋 hungry', '😴 tired', '❤️ loved'];
/** Gentle nudge for chain messages and unverified "breaking news". */
const FORWARD_RE = /forward (this|to)|share (this )?to \d+|breaking|100% true|viral/i;

@Component({
  selector: 'app-create',
  imports: [RouterLink, Icon, Avatar, SceneView],
  template: `
    <div class="mx-auto max-w-[600px] px-3 py-4 sm:px-0 lg:py-6">
      <div class="card p-4">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-bold">Create post</h1>
          <button class="icon-btn" (click)="router.navigate(['/home'])" aria-label="Cancel"><svg lucideIcon="x" [size]="20" /></button>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <app-avatar [user]="store.me" [size]="44" />
          <div>
            <p class="font-semibold">{{ store.me.name }} @if (feeling()) { <span class="font-normal text-muted">is feeling {{ feeling() }}</span> }</p>
            <label class="mt-0.5 inline-flex items-center gap-1 rounded-full bg-soft px-2 py-0.5 text-xs font-semibold">
              <svg lucideIcon="users" [size]="12" />
              <select class="bg-transparent outline-none" [value]="audience()" (change)="audience.set($any($event.target).value)" aria-label="Who can see this">
                @for (a of audiences; track a) { <option [value]="a">{{ a }}</option> }
              </select>
            </label>
          </div>
        </div>
        <p class="mt-1 pl-14 text-xs text-muted">{{ hint() }}</p>

        <textarea class="mt-3 min-h-36 w-full resize-none rounded-2xl p-1 text-lg outline-none placeholder:text-muted/70" placeholder="What’s on your mind? Write in any language — తెలుగు, हिन्दी, English…" [value]="text()" (input)="text.set($any($event.target).value)" maxlength="2000" aria-label="Post text"></textarea>

        @if (looksLikeForward()) {
          <p class="mb-3 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">
            <svg lucideIcon="warning" [size]="16" class="shrink-0" />
            Is this verified? Forwards and “breaking news” often turn out false. Check on factcheck.pib.gov.in before sharing.
          </p>
        }

        @if (photo(); as ph) {
          <div class="relative overflow-hidden rounded-2xl">
            <app-scene [scene]="ph" [emoji]="80" class="aspect-[4/3]" />
            <button class="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white" (click)="photo.set(null)" aria-label="Remove photo"><svg lucideIcon="x" [size]="16" /></button>
          </div>
        }

        @if (panel() === 'photo') {
          <div class="mt-3 grid grid-cols-4 gap-2">
            @for (p of photos; track p.label) {
              <button class="overflow-hidden rounded-xl" (click)="photo.set(p); panel.set(null)" [attr.aria-label]="p.label"><app-scene [scene]="p" [emoji]="28" [caption]="false" class="aspect-square" /></button>
            }
          </div>
          <p class="mt-1 text-xs text-muted">Sample photos for the preview. Photos are compressed for low data.</p>
        }
        @if (panel() === 'feeling') {
          <div class="mt-3 flex flex-wrap gap-2">
            @for (f of feelings; track f) { <button class="chip" [class.chip-on]="feeling() === f" (click)="feeling.set(f); panel.set(null)">{{ f }}</button> }
          </div>
        }
        @if (panel() === 'place') {
          <input class="input mt-3" placeholder="Add a place, e.g. Tirupati" [value]="place()" (input)="place.set($any($event.target).value)" aria-label="Place" />
        }

        <div class="mt-4 flex items-center justify-between rounded-2xl border border-line p-2">
          <span class="pl-2 text-sm font-semibold">Add to your post</span>
          <div class="flex">
            <button class="icon-btn text-emerald-600" (click)="toggle('photo')" aria-label="Add photo"><svg lucideIcon="image" [size]="22" /></button>
            <button class="icon-btn text-amber-500" (click)="toggle('feeling')" aria-label="Add feeling"><svg lucideIcon="smile" [size]="22" /></button>
            <button class="icon-btn text-rose-500" (click)="toggle('place')" aria-label="Add place"><svg lucideIcon="map-pin" [size]="22" /></button>
          </div>
        </div>

        <button class="btn btn-primary mt-4 w-full" [disabled]="!canPost()" (click)="post()">Post</button>
        <p class="mt-3 text-center text-xs text-muted">Be kind. Posts that break our <a routerLink="/guidelines" class="font-semibold text-brand">community guidelines</a> are removed.</p>
      </div>
    </div>
  `,
})
export class Create {
  protected readonly store = inject(Store);
  protected readonly router = inject(Router);
  private readonly toast = inject(Toast);

  protected readonly audiences = AUDIENCES;
  protected readonly photos = PHOTOS;
  protected readonly feelings = FEELINGS;
  protected readonly text = signal('');
  protected readonly audience = signal<Post['audience']>('Friends');
  protected readonly photo = signal<Scene | null>(null);
  protected readonly feeling = signal('');
  protected readonly place = signal('');
  protected readonly panel = signal<'photo' | 'feeling' | 'place' | null>(null);

  protected readonly hint = computed(() => AUDIENCE_HINT[this.audience()]);
  protected readonly canPost = computed(() => !!this.text().trim() || !!this.photo());
  protected readonly looksLikeForward = computed(() => FORWARD_RE.test(this.text()));

  toggle(p: 'photo' | 'feeling' | 'place') {
    this.panel.set(this.panel() === p ? null : p);
  }

  post() {
    const feeling = this.feeling() ? ` — feeling ${this.feeling()}` : '';
    this.store.addPost({
      text: this.text().trim() + feeling,
      audience: this.audience(),
      media: this.photo() ? [this.photo()!] : undefined,
      place: this.place().trim() || undefined,
    });
    this.toast.show('Posted! 🎉');
    this.router.navigate(['/home']);
  }
}
