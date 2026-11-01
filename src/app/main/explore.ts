import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n';
import { Store, compact } from '../core/store';
import { Icon } from '../shared/icon';
import { Avatar, Name, SceneView } from '../shared/ui';

@Component({
  selector: 'app-explore',
  imports: [RouterLink, Icon, Avatar, Name, SceneView],
  template: `
    <div class="mx-auto max-w-[680px] space-y-5 px-3 py-4 sm:px-0 lg:py-6">
      <label class="relative block">
        <svg lucideIcon="search" [size]="19" class="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <input class="input rounded-full! pl-11!" [placeholder]="i18n.t('search') + ' people, groups, #tags'" [value]="q()" (input)="q.set($any($event.target).value)" aria-label="Search" />
      </label>

      @if (q().trim()) {
        <section class="card divide-y divide-line">
          @for (u of people(); track u.id) {
            <a [routerLink]="['/profile', u.username]" class="flex items-center gap-3 p-3 hover:bg-soft">
              <app-avatar [user]="u" [size]="44" />
              <span class="min-w-0 text-sm"><app-name [user]="u" /><span class="block text-muted">{{ u.city }}</span></span>
            </a>
          }
          @for (g of groups(); track g.id) {
            <a routerLink="/groups" class="flex items-center gap-3 p-3 hover:bg-soft">
              <app-scene [scene]="g.scene" [emoji]="22" class="h-11 w-11 overflow-hidden rounded-xl" />
              <span class="text-sm"><b>{{ g.name }}</b><span class="block text-muted">Group · {{ compact(g.members) }} members</span></span>
            </a>
          }
          @if (!people().length && !groups().length) { <p class="p-6 text-center text-sm text-muted">No results for “{{ q() }}”.</p> }
        </section>
      } @else {
        <section>
          <h2 class="mb-2 font-bold">Trending in India</h2>
          <div class="flex flex-wrap gap-2">
            @for (t of store.trending; track t) { <button class="chip text-brand" (click)="q.set(t)">{{ t }}</button> }
          </div>
        </section>

        <section>
          <h2 class="mb-2 font-bold">People you may know</h2>
          <div class="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
            @for (u of suggestions(); track u.id) {
              <div class="card w-40 shrink-0 p-4 text-center">
                <a [routerLink]="['/profile', u.username]"><app-avatar [user]="u" [size]="64" /></a>
                <p class="mt-2 truncate text-sm font-semibold">{{ u.name }}</p>
                <p class="truncate text-xs text-muted">{{ u.city.split(',')[0] }} · {{ u.mutual ?? 0 }} mutual</p>
                <button class="btn btn-sm mt-3 w-full" [class]="store.sent().has(u.id) ? 'btn-ghost' : 'btn-primary'" (click)="store.sendRequest(u.id)">
                  <svg [lucideIcon]="store.sent().has(u.id) ? 'check' : 'user-plus'" [size]="15" />{{ store.sent().has(u.id) ? 'Sent' : 'Add' }}
                </button>
              </div>
            }
          </div>
        </section>

        <section>
          <h2 class="mb-2 font-bold">Photos & reels</h2>
          <div class="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl">
            @for (s of tiles(); track $index; let i = $index) {
              <a [routerLink]="i % 4 === 0 ? '/reels' : '/home'" class="relative" [class]="i % 7 === 0 ? 'col-span-2 row-span-2' : ''">
                <app-scene [scene]="s" [emoji]="i % 7 === 0 ? 72 : 40" [caption]="false" class="aspect-square h-full" />
                @if (i % 4 === 0) { <svg lucideIcon="film" [size]="18" class="absolute top-2 right-2 text-white drop-shadow" /> }
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class Explore {
  protected readonly store = inject(Store);
  protected readonly i18n = inject(I18n);
  protected readonly compact = compact;
  protected readonly q = signal('');

  private readonly needle = computed(() => this.q().trim().toLowerCase().replace(/^#/, ''));
  protected readonly people = computed(() =>
    this.store.people.filter((u) => (u.name + ' ' + u.username + ' ' + u.city).toLowerCase().includes(this.needle())),
  );
  protected readonly groups = computed(() => this.store.groups.filter((g) => (g.name + ' ' + g.category + ' ' + g.about).toLowerCase().includes(this.needle())));
  protected readonly suggestions = computed(() => this.store.people.filter((u) => !this.store.friends().has(u.id)));
  protected readonly tiles = computed(() => [
    ...this.store.reels.map((r) => r.scene),
    ...this.store.posts().flatMap((p) => p.media ?? []),
    ...this.store.stories.map((s) => s.scene),
  ]);
}
