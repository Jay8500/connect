import { Component, computed, inject, signal } from '@angular/core';
import { Store, compact } from '../core/store';
import { Icon } from '../shared/icon';
import { PostCard } from '../shared/post-card';
import { SceneView, Toast } from '../shared/ui';

@Component({
  selector: 'app-groups',
  imports: [Icon, SceneView, PostCard],
  template: `
    <div class="mx-auto max-w-[680px] space-y-5 px-3 py-4 sm:px-0 lg:py-6">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">Groups</h1>
        <button class="btn btn-primary btn-sm" (click)="toast.show('Create group: name, privacy, rules (real app)')"><svg lucideIcon="plus" [size]="16" />New group</button>
      </div>
      <p class="-mt-3 text-sm text-muted">Family, apartment, college, village, hobby — your people, in one place.</p>

      <div class="no-scrollbar flex gap-2 overflow-x-auto">
        @for (c of categories(); track c) { <button class="chip" [class.chip-on]="cat() === c" (click)="cat.set(c)">{{ c }}</button> }
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        @for (g of list(); track g.id) {
          @let joined = store.joined().has(g.id);
          <article class="card overflow-hidden">
            <app-scene [scene]="g.scene" [emoji]="44" class="h-24" />
            <div class="p-4">
              <h2 class="font-bold">{{ g.name }}</h2>
              <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <svg [lucideIcon]="g.privacy === 'Private' ? 'lock' : 'globe'" [size]="12" />{{ g.privacy }} · {{ compact(g.members) }} members @if (g.city) { · {{ g.city }} }
              </p>
              <p class="mt-2 line-clamp-2 text-sm text-ink/80">{{ g.about }}</p>
              <button class="btn btn-sm mt-3 w-full" [class]="joined ? 'btn-ghost' : 'btn-primary'" (click)="toggle(g.id, g.privacy, joined)">
                <svg [lucideIcon]="joined ? 'check' : 'plus'" [size]="15" />{{ joined ? 'Joined' : g.privacy === 'Private' ? 'Ask to join' : 'Join group' }}
              </button>
            </div>
          </article>
        }
      </div>

      @if (groupPosts().length) {
        <h2 class="pt-2 font-bold">Recent from your groups</h2>
        @for (p of groupPosts(); track p.id) { <app-post-card [post]="p" /> }
      }
    </div>
  `,
})
export class Groups {
  protected readonly store = inject(Store);
  protected readonly toast = inject(Toast);
  protected readonly compact = compact;
  protected readonly cat = signal('All');
  protected readonly categories = computed(() => ['All', 'Joined', ...new Set(this.store.groups.map((g) => g.category))]);
  protected readonly list = computed(() => {
    const c = this.cat();
    if (c === 'All') return this.store.groups;
    if (c === 'Joined') return this.store.groups.filter((g) => this.store.joined().has(g.id));
    return this.store.groups.filter((g) => g.category === c);
  });
  protected readonly groupPosts = computed(() => this.store.posts().filter((p) => p.groupId && this.store.joined().has(p.groupId)));

  toggle(id: string, privacy: string, joined: boolean) {
    this.store.toggleJoin(id);
    if (!joined) this.toast.show(privacy === 'Private' ? 'Request sent to group admins' : 'Welcome to the group! 🎉');
  }
}
