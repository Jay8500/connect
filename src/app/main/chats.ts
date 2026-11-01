import { Component, ElementRef, OnDestroy, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Chat } from '../core/models';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Report } from '../shared/report';
import { Avatar, SceneView, Toast } from '../shared/ui';

type ChatTab = 'All' | 'Unread' | 'Groups' | 'Requests';
const REPLIES = ['😊👍', 'Sare, ok!', 'Haha 😂', 'Will call you in the evening', 'Thanks ra 🙏', 'Done ✅'];

@Component({
  selector: 'app-chats',
  imports: [RouterLink, NgTemplateOutlet, Icon, Avatar, SceneView],
  template: `
    <div class="flex lg:h-[calc(100dvh-3rem)] lg:gap-4 lg:py-6">
      <!-- Chat list -->
      <section class="w-full lg:flex lg:w-[360px] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:rounded-3xl lg:border lg:border-line lg:bg-white" [class.hidden]="!!id()">
        <div class="space-y-3 bg-white p-3 lg:p-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold">Chats</h1>
            <button class="icon-btn" (click)="toast.show('New group: pick friends (real app)')" aria-label="New group"><svg lucideIcon="users" [size]="20" /></button>
          </div>
          <label class="relative block">
            <svg lucideIcon="search" [size]="17" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
            <input class="input min-h-10! rounded-full! bg-soft! pl-10! text-sm" placeholder="Search chats" (input)="q.set($any($event.target).value)" aria-label="Search chats" />
          </label>
          <div class="no-scrollbar flex gap-2 overflow-x-auto">
            @for (t of tabs; track t) {
              <button class="chip" [class.chip-on]="tab() === t" (click)="tab.set(t)">{{ t }} @if (t === 'Requests' && requestCount()) { <span class="text-love">{{ requestCount() }}</span> }</button>
            }
          </div>
        </div>
        <ul class="flex-1 overflow-y-auto bg-white">
          @for (c of list(); track c.id) {
            <li>
              <a [routerLink]="['/chats', c.id]" class="flex items-center gap-3 px-3 py-3 hover:bg-soft lg:px-4" [class.bg-brand-50]="c.id === id()">
                <ng-container *ngTemplateOutlet="pic; context: { $implicit: c, size: 50 }" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="truncate font-semibold">{{ title(c) }}</span>
                    <span class="shrink-0 text-xs" [class]="c.unread ? 'font-semibold text-brand' : 'text-muted'">{{ last(c)?.at }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-sm text-muted">
                    @if (last(c)?.from === 'me') { <svg lucideIcon="check-check" [size]="15" [class.text-sky-500]="last(c)?.status === 'read'" /> }
                    <span class="truncate">{{ preview(c) }}</span>
                    <span class="ml-auto flex shrink-0 items-center gap-1">
                      @if (c.muted) { <svg lucideIcon="bell-off" [size]="14" /> }
                      @if (c.pinned) { <svg lucideIcon="pin" [size]="14" /> }
                      @if (c.unread) { <span class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">{{ c.unread }}</span> }
                    </span>
                  </div>
                </div>
              </a>
            </li>
          } @empty {
            <li class="p-8 text-center text-sm text-muted">No chats here.</li>
          }
        </ul>
        <p class="flex items-center justify-center gap-1.5 bg-white p-3 text-center text-xs text-muted"><svg lucideIcon="lock" [size]="13" />No ads in chats. Ever.</p>
      </section>

      <!-- Conversation -->
      @if (chat(); as c) {
        <section class="fixed inset-0 z-40 flex flex-col bg-[#efeae2] lg:static lg:z-auto lg:flex-1 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-line">
          <header class="flex items-center gap-2 border-b border-line bg-white px-2 py-2 lg:px-4">
            <a routerLink="/chats" class="icon-btn lg:hidden" aria-label="Back to chats"><svg lucideIcon="arrow-left" [size]="22" /></a>
            <ng-container *ngTemplateOutlet="pic; context: { $implicit: c, size: 40 }" />
            <div class="min-w-0 flex-1 leading-tight">
              <p class="truncate font-semibold">{{ title(c) }}</p>
              <p class="truncate text-xs text-muted">{{ typing() ? 'typing…' : subtitle(c) }}</p>
            </div>
            <button class="icon-btn" (click)="toast.show('Voice calls are coming soon')" aria-label="Voice call"><svg lucideIcon="phone" [size]="20" /></button>
            <button class="icon-btn" (click)="toast.show('Video calls are coming soon')" aria-label="Video call"><svg lucideIcon="video" [size]="20" /></button>
            <div class="relative">
              <button class="icon-btn" (click)="menu.set(!menu())" aria-label="Chat options"><svg lucideIcon="more" [size]="20" /></button>
              @if (menu()) {
                <div class="fixed inset-0 z-10" (click)="menu.set(false)"></div>
                <div class="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-line bg-white py-1 text-sm shadow-xl">
                  <button class="menu-item" (click)="store.togglePin(c.id); menu.set(false)"><svg lucideIcon="pin" [size]="17" />{{ c.pinned ? 'Unpin chat' : 'Pin chat' }}</button>
                  <button class="menu-item" (click)="store.toggleMute(c.id); menu.set(false)"><svg lucideIcon="bell-off" [size]="17" />{{ c.muted ? 'Unmute' : 'Mute notifications' }}</button>
                  <button class="menu-item" (click)="toast.show('Disappearing messages: 24 hours (real app)'); menu.set(false)"><svg lucideIcon="clock" [size]="17" />Disappearing messages</button>
                  @if (c.kind === 'direct') {
                    <button class="menu-item text-love" (click)="blockUser(c)"><svg lucideIcon="ban" [size]="17" />Block</button>
                  }
                  <button class="menu-item text-love" (click)="report.open('chat'); menu.set(false)"><svg lucideIcon="flag" [size]="17" />Report</button>
                  <button class="menu-item text-love" (click)="deleteChat(c)"><svg lucideIcon="trash" [size]="17" />Delete chat</button>
                </div>
              }
            </div>
          </header>

          <div #scroller class="flex-1 space-y-2 overflow-y-auto px-3 py-4 lg:px-8">
            <p class="mx-auto flex max-w-sm items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
              <svg lucideIcon="lock" [size]="14" class="mt-0.5 shrink-0" />
              Your phone number stays hidden. People see only your name and photo.
            </p>

            @for (m of c.messages; track m.id) {
              @let mine = m.from === 'me';
              @if (m.risky) {
                <div class="mx-auto max-w-sm rounded-2xl border border-love/30 bg-rose-50 p-3 text-sm text-rose-900">
                  <p class="flex items-center gap-2 font-bold"><svg lucideIcon="shield-alert" [size]="18" />Possible scam</p>
                  <p class="mt-1 text-xs">Never share your UPI PIN, OTP or bank details. Banks, police and the government never ask for them in chat.</p>
                  <div class="mt-2 flex gap-2"><button class="btn btn-sm min-h-8! bg-love! text-white" (click)="blockUser(c)">Block & report</button><a href="https://cybercrime.gov.in" target="_blank" rel="noopener" class="btn btn-ghost btn-sm min-h-8!">Cyber helpline 1930</a></div>
                </div>
              }
              <div class="flex" [class.justify-end]="mine">
                <div class="max-w-[80%] rounded-2xl px-3 py-2 text-[15px] shadow-sm sm:max-w-[65%]" [class]="mine ? 'rounded-br-md bg-brand-100' : 'rounded-bl-md bg-white'">
                  @if (c.kind === 'group' && !mine) { <p class="text-xs font-semibold" [style.color]="nameColor(m.from)">{{ store.user(m.from).name }}</p> }
                  @if (m.forwardedMany) {
                    <p class="flex items-center gap-1 text-xs text-muted italic"><svg lucideIcon="share" [size]="12" />Forwarded many times</p>
                  }
                  @switch (m.kind) {
                    @case ('voice') {
                      <div class="flex w-56 items-center gap-2 py-1">
                        <button class="grid h-9 w-9 place-items-center rounded-full bg-brand text-white" aria-label="Play voice message" (click)="toast.show('Plays in the real app')"><svg lucideIcon="play" [size]="16" /></button>
                        <span class="flex h-6 flex-1 items-center gap-[3px]">@for (h of wave; track $index) { <span class="w-[3px] rounded bg-slate-400" [style.height.%]="h"></span> }</span>
                        <span class="text-xs text-muted">0:24</span>
                      </div>
                    }
                    @case ('photo') {
                      <app-scene [scene]="photo" [emoji]="56" class="my-1 aspect-[4/3] w-60 overflow-hidden rounded-xl" />
                      <p>{{ m.text }}</p>
                    }
                    @default { <p class="whitespace-pre-line">{{ m.text }}</p> }
                  }
                  @if (m.forwardedMany && !mine) {
                    <a href="https://factcheck.pib.gov.in" target="_blank" rel="noopener" class="mt-1 flex items-center gap-1 text-xs font-semibold text-brand"><svg lucideIcon="search" [size]="12" />Check this fact</a>
                  }
                  <p class="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-muted">
                    {{ m.at }}
                    @if (mine) { <svg [lucideIcon]="m.status === 'sent' ? 'check' : 'check-check'" [size]="14" [class.text-sky-500]="m.status === 'read'" /> }
                  </p>
                </div>
              </div>
            }
          </div>

          @if (c.request) {
            <div class="border-t border-line bg-white p-4 text-center text-sm">
              <p><b>{{ title(c) }}</b> is not your friend on Connect. Do you want to let them message you?</p>
              <div class="mt-3 flex justify-center gap-2">
                <button class="btn btn-ghost btn-sm text-love" (click)="blockUser(c)"><svg lucideIcon="ban" [size]="15" />Block</button>
                <button class="btn btn-primary btn-sm" (click)="store.acceptChatRequest(c.id)">Accept</button>
              </div>
            </div>
          } @else {
            @if (!draft()) {
              <div class="no-scrollbar flex gap-2 overflow-x-auto bg-white px-3 pt-2">
                @for (q of quickReplies; track q) { <button class="chip shrink-0" (click)="quick(c, q)">{{ q }}</button> }
              </div>
            }
            <form class="flex items-end gap-2 bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" (submit)="$event.preventDefault(); send(c)">
              <button type="button" class="icon-btn" (click)="toast.show('Emoji & stickers (real app)')" aria-label="Emoji"><svg lucideIcon="smile" [size]="22" /></button>
              <button type="button" class="icon-btn" (click)="toast.show('Share photo, document, location, contact (real app)')" aria-label="Attach"><svg lucideIcon="paperclip" [size]="21" /></button>
              <textarea rows="1" class="input max-h-32 min-h-11 flex-1 resize-none rounded-3xl! py-2.5!" placeholder="Message" [value]="draft()" (input)="draft.set($any($event.target).value)" (keydown.enter)="onEnter($event, c)" aria-label="Message"></textarea>
              @if (draft().trim()) {
                <button class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white" aria-label="Send"><svg lucideIcon="send" [size]="19" /></button>
              } @else {
                <button type="button" class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white" (click)="toast.show('Hold to record a voice message (real app)')" aria-label="Voice message"><svg lucideIcon="mic" [size]="20" /></button>
              }
            </form>
          }
        </section>
      } @else {
        <section class="hidden flex-1 place-items-center rounded-3xl border border-line bg-white text-center lg:grid">
          <div class="max-w-xs">
            <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand"><svg lucideIcon="message" [size]="30" /></span>
            <h2 class="mt-4 text-lg font-bold">Your chats</h2>
            <p class="mt-1 text-sm text-muted">Talk to family and friends — no ads, number hidden, scam warnings built in.</p>
          </div>
        </section>
      }
    </div>

    <ng-template #pic let-c let-size="size">
      @if (c.kind === 'group') {
        <app-scene [scene]="c.scene" [emoji]="size * 0.45" [caption]="false" class="shrink-0 overflow-hidden rounded-full" [style.width.px]="size" [style.height.px]="size" />
      } @else {
        <app-avatar [user]="store.user(c.memberIds[0])" [size]="size" />
      }
    </ng-template>
  `,
  styles: `
    .menu-item { display: flex; width: 100%; align-items: center; gap: 0.6rem; padding: 0.6rem 0.9rem; text-align: left; }
    .menu-item:hover { background: var(--color-soft); }
  `,
})
export class Chats implements OnDestroy {
  protected readonly store = inject(Store);
  protected readonly toast = inject(Toast);
  protected readonly report = inject(Report);
  private readonly router = inject(Router);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  readonly id = input<string>();
  protected readonly tabs: ChatTab[] = ['All', 'Unread', 'Groups', 'Requests'];
  protected readonly tab = signal<ChatTab>('All');
  protected readonly q = signal('');
  protected readonly draft = signal('');
  protected readonly menu = signal(false);
  protected readonly typing = signal(false);
  protected readonly quickReplies = ['👍', 'Ok 👌', 'Call you later 📞', 'On my way 🛵', 'Thank you 🙏', 'Happy birthday 🎂'];
  protected readonly wave = [30, 60, 45, 80, 50, 90, 40, 70, 35, 65, 85, 45, 30, 55, 75, 40, 60, 30];
  protected readonly photo = { from: '#f59e0b', to: '#fde68a', emoji: '🎉', label: 'Function' };
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly chat = computed(() => (this.id() ? this.store.chat(this.id()!) : undefined));
  protected readonly requestCount = computed(() => this.store.chats().filter((c) => c.request).length);
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.store
      .chats()
      .filter((c) => {
        if (q && !this.title(c).toLowerCase().includes(q)) return false;
        switch (this.tab()) {
          case 'Unread': return c.unread > 0;
          case 'Groups': return c.kind === 'group';
          case 'Requests': return !!c.request;
          default: return !c.request;
        }
      })
      .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.store.openChat(id);
    });
    // keep the newest message in view
    effect(() => {
      this.chat()?.messages.length;
      this.typing();
      const el = this.scroller()?.nativeElement;
      if (el) queueMicrotask(() => el.scrollTo({ top: el.scrollHeight }));
    });
  }

  title(c: Chat): string {
    return c.name ?? this.store.user(c.memberIds[0]).name;
  }

  subtitle(c: Chat): string {
    if (c.kind === 'group') return c.memberIds.map((id) => this.store.user(id).name.split(' ')[0]).join(', ') + ', You';
    return this.store.settings().lastSeen ? 'online' : 'Connect friend';
  }

  last(c: Chat) {
    return c.messages.at(-1);
  }

  preview(c: Chat): string {
    const m = this.last(c);
    if (!m) return 'Say namaste 👋';
    if (m.kind === 'voice') return '🎤 Voice message';
    if (m.kind === 'photo') return '📷 Photo';
    return m.text;
  }

  nameColor(id: string): string {
    return `hsl(${this.store.user(id).hue} 65% 38%)`;
  }

  onEnter(e: Event, c: Chat) {
    if ((e as KeyboardEvent).shiftKey) return;
    e.preventDefault();
    this.send(c);
  }

  quick(c: Chat, text: string) {
    this.draft.set(text);
    this.send(c);
  }

  send(c: Chat) {
    const text = this.draft().trim();
    if (!text) return;
    this.store.send(c.id, text);
    this.draft.set('');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.typing.set(true);
      this.timer = setTimeout(() => {
        this.typing.set(false);
        this.store.receive(c.id, c.memberIds[0], REPLIES[Math.floor(Math.random() * REPLIES.length)]);
      }, 1400);
    }, 800);
  }

  blockUser(c: Chat) {
    this.menu.set(false);
    this.store.block(c.memberIds[0]);
    this.store.deleteChat(c.id);
    this.toast.show(`${this.title(c)} is blocked. They can’t message or find you.`);
    this.router.navigate(['/chats']);
  }

  deleteChat(c: Chat) {
    this.menu.set(false);
    this.store.deleteChat(c.id);
    this.router.navigate(['/chats']);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}
