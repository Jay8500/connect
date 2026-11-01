import { Component, Injectable, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';
import { Scene, User } from '../core/models';
import { Store } from '../core/store';

/** Connect mark (public/connect-icon.svg): a chat bubble with a heart — talk to the people you love. */
@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  host: { class: 'inline-flex' },
  template: `
    <a [routerLink]="link()" class="inline-flex items-center gap-2" aria-label="Connect home">
      <img src="connect-icon.svg" [attr.width]="size()" [attr.height]="size()" alt="" />
      @if (word()) {
        <span class="leading-none">
          <span class="block font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight">connect</span>
          <span class="mt-0.5 block text-[10px] font-semibold tracking-wide text-muted">by Spread Apps™</span>
        </span>
      }
    </a>
  `,
})
export class Logo {
  readonly size = input(34);
  readonly word = input(true);
  readonly link = input('/');
}

/** Initials in a coloured circle, with an optional story ring. */
@Component({
  selector: 'app-avatar',
  host: { class: 'inline-flex shrink-0' },
  template: `
    <span class="inline-flex items-center justify-center rounded-full" [class]="ring() ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-brand p-[2.5px]' : ''">
      <span
        class="grid place-items-center rounded-full font-bold text-white"
        [class.ring-2]="ring()"
        [class.ring-white]="ring()"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [style.font-size.px]="size() * 0.38"
        [style.background]="bg()"
        [attr.aria-label]="user().name"
        role="img"
      >
        @if (photo(); as src) {
          <img [src]="src" alt="" class="h-full w-full rounded-full object-cover" />
        } @else {
          {{ initials() }}
        }
      </span>
    </span>
  `,
})
export class Avatar {
  private readonly store = inject(Store);
  readonly user = input.required<User>();
  /** Only the signed-in user can have a real photo in the preview. */
  protected readonly photo = computed(() => (this.user().id === this.store.me.id ? this.store.myPhoto() : null));
  readonly size = input(40);
  readonly ring = input(false);
  protected readonly initials = computed(() => {
    const p = this.user().name.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/);
    return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase();
  });
  protected readonly bg = computed(() => {
    const h = this.user().hue;
    return `linear-gradient(135deg, hsl(${h} 70% 45%), hsl(${(h + 40) % 360} 75% 60%))`;
  });
}

/** Name + blue tick. */
@Component({
  selector: 'app-name',
  imports: [Icon, RouterLink],
  host: { class: 'inline-flex min-w-0 items-center gap-1' },
  template: `
    <a [routerLink]="['/profile', user().username]" class="truncate font-semibold hover:underline">{{ user().name }}</a>
    @if (user().verified) { <svg lucideIcon="badge-check" [size]="15" class="text-sky-500" aria-label="Verified" /> }
  `,
})
export class Name {
  readonly user = input.required<User>();
}

/** A "photo" made from a gradient and emoji. In Data Saver mode it stays a light placeholder until tapped. */
@Component({
  selector: 'app-scene',
  imports: [Icon],
  host: { class: 'block' },
  template: `
    @if (saver() && !loaded()) {
      <button type="button" (click)="loaded.set(true)" class="flex h-full w-full flex-col items-center justify-center gap-1 bg-soft text-muted">
        <svg lucideIcon="image" [size]="22" />
        <span class="text-xs font-semibold">Data Saver · tap to load</span>
      </button>
    } @else {
      <div class="relative flex h-full w-full items-center justify-center overflow-hidden" [style.background]="bg()" role="img" [attr.aria-label]="scene().label || 'Photo'">
        <span [style.font-size.px]="emoji()" class="drop-shadow-lg select-none">{{ scene().emoji }}</span>
        @if (scene().label && caption()) {
          <span class="absolute bottom-2 left-2 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{{ scene().label }}</span>
        }
      </div>
    }
  `,
})
export class SceneView {
  private readonly store = inject(Store);
  readonly scene = input.required<Scene>();
  readonly emoji = input(64);
  readonly caption = input(true);
  protected readonly loaded = signal(false);
  protected readonly saver = computed(() => this.store.settings().dataSaver);
  protected readonly bg = computed(() => `linear-gradient(135deg, ${this.scene().from}, ${this.scene().to})`);
}

/** Small toast at the bottom of the screen, with an optional action like "Undo". */
@Injectable({ providedIn: 'root' })
export class Toast {
  readonly text = signal('');
  readonly action = signal<{ label: string; run: () => void } | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  show(text: string, action?: { label: string; run: () => void }) {
    this.text.set(text);
    this.action.set(action ?? null);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.text.set(''), action ? 5000 : 2600);
  }

  runAction() {
    this.action()?.run();
    this.text.set('');
  }
}

@Component({
  selector: 'app-toast-host',
  template: `
    @if (toast.text()) {
      <div class="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-8" role="status" aria-live="polite">
        <div class="pointer-events-auto flex items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-xl">
          {{ toast.text() }}
          @if (toast.action(); as a) { <button class="font-bold text-brand-3" (click)="toast.runAction()">{{ a.label }}</button> }
        </div>
      </div>
    }
  `,
})
export class ToastHost {
  protected readonly toast = inject(Toast);
}

/** ⋯ button with a pop-up menu. Put `<button class="menu-item">` inside; any tap closes it. */
@Component({
  selector: 'app-dropdown',
  imports: [Icon],
  host: { class: 'relative inline-flex' },
  template: `
    <button type="button" [class]="buttonClass()" (click)="open.set(!open())" [attr.aria-label]="label()" [attr.aria-expanded]="open()"><svg lucideIcon="more" [size]="20" /></button>
    @if (open()) {
      <div class="fixed inset-0 z-10" (click)="open.set(false)"></div>
      <div class="menu" role="menu" (click)="open.set(false)"><ng-content /></div>
    }
  `,
})
export class Dropdown {
  readonly label = input('More options');
  readonly buttonClass = input('icon-btn');
  protected readonly open = signal(false);
}

/** On/off switch. */
@Component({
  selector: 'app-switch',
  host: { class: 'inline-flex' },
  template: `
    <button type="button" role="switch" [attr.aria-checked]="on()" [attr.aria-label]="label()" (click)="toggle()"
      class="relative h-6 w-11 rounded-full transition-colors" [class]="on() ? 'bg-brand' : 'bg-slate-300'">
      <span class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" [class.translate-x-5]="on()"></span>
    </button>
  `,
})
export class Switch {
  readonly on = input(false);
  readonly label = input('');
  readonly changed = output<boolean>();
  toggle() {
    this.changed.emit(!this.on());
  }
}
