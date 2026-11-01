import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Settings } from '../core/models';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Avatar, Switch, Toast } from '../shared/ui';

const LANGS: { id: Settings['lang']; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'te', label: 'తెలుగు' },
  { id: 'hi', label: 'हिन्दी' },
];
const SOON_LANGS = ['தமிழ்', 'ಕನ್ನಡ', 'മലയാളം', 'मराठी', 'বাংলা', 'ગુજરાતી', 'ਪੰਜਾਬੀ', 'ଓଡ଼ିଆ', 'اردو'];
const DEVICES = [
  { name: 'This phone · Chrome on Android', place: 'Vijayawada', at: 'Active now', icon: 'smartphone', current: true },
  { name: 'Chrome on Windows', place: 'Hyderabad', at: '2 days ago', icon: 'globe', current: false },
];

@Component({
  selector: 'app-settings',
  imports: [RouterLink, Icon, Avatar, Switch],
  template: `
    <div class="mx-auto max-w-[640px] space-y-4 px-3 py-4 sm:px-0 lg:py-6">
      <h1 class="text-xl font-bold">Settings</h1>

      <section class="card p-4">
        <h2 class="sec"><svg lucideIcon="languages" [size]="18" />Language & data</h2>
        <p class="text-sm text-muted">App language</p>
        <div class="mt-2 flex flex-wrap gap-2">
          @for (l of langs; track l.id) { <button class="chip" [class.chip-on]="s().lang === l.id" (click)="set({ lang: l.id })">{{ l.label }}</button> }
          @for (l of soonLangs; track l) { <span class="chip opacity-50" title="Coming soon">{{ l }}</span> }
        </div>
        <div class="row"><span><b>Data Saver</b><small>Photos load only when you tap. Good for 2G/3G and low data packs.</small></span><app-switch [on]="s().dataSaver" label="Data Saver" (changed)="set({ dataSaver: $event })" /></div>
        <div class="row"><span><b>Auto-translate posts</b><small>Show posts in other languages translated to yours.</small></span><app-switch [on]="s().autoTranslate" label="Auto-translate" (changed)="set({ autoTranslate: $event })" /></div>
      </section>

      <section class="card p-4">
        <h2 class="sec"><svg lucideIcon="lock" [size]="18" />Privacy</h2>
        <div class="row"><span><b>Who can see my profile</b></span>
          <select class="sel" [value]="s().profileVisibility" (change)="set({ profileVisibility: $any($event.target).value })" aria-label="Who can see my profile"><option>Friends</option><option>Public</option></select>
        </div>
        <div class="row"><span><b>Who can message me</b><small>Others land in “Requests” first.</small></span>
          <select class="sel" [value]="s().whoCanMessage" (change)="set({ whoCanMessage: $any($event.target).value })" aria-label="Who can message me"><option>Friends</option><option>Friends of friends</option><option>Everyone</option></select>
        </div>
        <div class="row"><span><b>Show my phone number</b><small>Off by default. Even friends see only your name.</small></span><app-switch [on]="s().showPhone" label="Show phone number" (changed)="set({ showPhone: $event })" /></div>
        <div class="row"><span><b>Read receipts</b><small>Blue ticks when you read a message.</small></span><app-switch [on]="s().readReceipts" label="Read receipts" (changed)="set({ readReceipts: $event })" /></div>
        <div class="row"><span><b>Last seen & online</b></span><app-switch [on]="s().lastSeen" label="Last seen" (changed)="set({ lastSeen: $event })" /></div>
      </section>

      <section class="card p-4">
        <h2 class="sec"><svg lucideIcon="clock" [size]="18" />Your time</h2>
        <p class="text-sm text-muted">Remind me to take a break after</p>
        <div class="mt-2 flex flex-wrap gap-2">
          @for (m of limits; track m) { <button class="chip" [class.chip-on]="s().dailyLimit === m" (click)="set({ dailyLimit: m })">{{ m ? m + ' min a day' : 'Off' }}</button> }
        </div>
        <p class="mt-3 text-xs text-muted">Today: 24 min on Connect. No autoplay with sound, no endless feed.</p>
      </section>

      <section class="card p-4">
        <h2 class="sec"><svg lucideIcon="shield-check" [size]="18" />Login & security</h2>
        <div class="row"><span><b>2-step verification</b><small>OTP on your phone when you log in on a new device.</small></span><button class="btn btn-ghost btn-sm" (click)="toast.show('2-step setup (real app)')">Turn on</button></div>
        <div class="row"><span><b>New login alerts</b></span><app-switch [on]="s().newLoginAlerts" label="New login alerts" (changed)="set({ newLoginAlerts: $event })" /></div>
        <p class="mt-4 text-sm font-semibold">Where you’re logged in</p>
        @for (d of devices(); track d.name) {
          <div class="mt-2 flex items-center gap-3 rounded-2xl bg-soft p-3 text-sm">
            <svg [lucideIcon]="d.icon" [size]="20" class="text-muted" />
            <span class="flex-1"><b>{{ d.name }}</b><span class="block text-xs text-muted">{{ d.place }} · {{ d.at }}</span></span>
            @if (d.current) { <span class="text-xs font-semibold text-brand">This device</span> }
          </div>
        }
        @if (devices().length > 1) { <button class="btn btn-ghost btn-sm mt-3 text-love" (click)="logoutOthers()"><svg lucideIcon="log-out" [size]="15" />Log out all other devices</button> }
      </section>

      <section class="card p-4">
        <h2 class="sec"><svg lucideIcon="ban" [size]="18" />Blocked people</h2>
        @for (id of blockedIds(); track id) {
          <div class="mt-2 flex items-center gap-3"><app-avatar [user]="store.user(id)" [size]="36" /><span class="flex-1 text-sm font-semibold">{{ store.user(id).name }}</span><button class="btn btn-ghost btn-sm" (click)="store.unblock(id)">Unblock</button></div>
        } @empty { <p class="text-sm text-muted">You haven’t blocked anyone.</p> }
      </section>

      <section class="card p-4">
        <h2 class="sec"><svg lucideIcon="key" [size]="18" />Your data & rights</h2>
        <p class="text-xs text-muted">Under India’s Digital Personal Data Protection Act, 2023 you can see, correct, download and delete your data, and withdraw consent any time.</p>
        <button class="link-row" (click)="toast.show('We’ll email a download link within 48 hours (real app)')"><svg lucideIcon="download" [size]="18" />Download my data<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></button>
        <button class="link-row" (click)="toast.show('Consent list: suggestions, contacts, location (real app)')"><svg lucideIcon="check" [size]="18" />Manage my consents<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></button>
        <button class="link-row" (click)="toast.show('Choose a family member to manage your account if something happens to you (real app)')"><svg lucideIcon="heart-handshake" [size]="18" />Nominate someone<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></button>
        <button class="link-row text-love" (click)="confirmDelete.set(true)"><svg lucideIcon="trash" [size]="18" />Delete my account<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></button>
        @if (confirmDelete()) {
          <div class="mt-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-900">
            Your account is hidden at once and deleted for good after 30 days. Log in before then to cancel.
            <div class="mt-2 flex gap-2"><button class="btn btn-sm min-h-8! bg-love! text-white" (click)="confirmDelete.set(false); toast.show('Preview only — nothing was deleted')">Delete</button><button class="btn btn-ghost btn-sm min-h-8!" (click)="confirmDelete.set(false)">Cancel</button></div>
          </div>
        }
      </section>

      <section class="card p-4">
        <h2 class="sec"><svg lucideIcon="scale" [size]="18" />Help & legal</h2>
        <a routerLink="/grievance" class="link-row"><svg lucideIcon="flag" [size]="18" />Complaints & Grievance Officer<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></a>
        <a routerLink="/guidelines" class="link-row"><svg lucideIcon="users" [size]="18" />Community guidelines<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></a>
        <a routerLink="/privacy" class="link-row"><svg lucideIcon="lock" [size]="18" />Privacy policy<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></a>
        <a routerLink="/terms" class="link-row"><svg lucideIcon="info" [size]="18" />Terms of use<svg lucideIcon="chevron-right" [size]="16" class="ml-auto text-muted" /></a>
      </section>

      <button class="btn btn-ghost w-full text-love" (click)="router.navigate(['/'])"><svg lucideIcon="log-out" [size]="18" />Log out</button>
      <p class="pb-4 text-center text-xs text-muted">Connect · Preview 0.1 · Powered by Spread Apps™ · Made with ❤️ in India</p>
    </div>
  `,
  styles: `
    .sec { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-weight: 700; }
    .row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem 0; border-top: 1px solid var(--color-line); margin-top: 0.85rem; }
    .row + .row { margin-top: 0; }
    .row b { display: block; font-size: 0.92rem; font-weight: 600; }
    .row small { display: block; color: var(--color-muted); font-size: 0.75rem; }
    .sel { border: 1px solid var(--color-line); border-radius: 0.75rem; padding: 0.4rem 0.6rem; font-size: 0.85rem; background: #fff; }
    .link-row { display: flex; width: 100%; align-items: center; gap: 0.75rem; padding: 0.8rem 0.25rem; border-top: 1px solid var(--color-line); font-size: 0.92rem; font-weight: 500; text-align: left; }
    .link-row:first-of-type { margin-top: 0.75rem; }
  `,
})
export class SettingsPage {
  protected readonly store = inject(Store);
  protected readonly toast = inject(Toast);
  protected readonly router = inject(Router);
  protected readonly s = this.store.settings;
  protected readonly langs = LANGS;
  protected readonly soonLangs = SOON_LANGS;
  protected readonly limits: Settings['dailyLimit'][] = [0, 30, 60, 90];
  protected readonly devices = signal(DEVICES);
  protected readonly confirmDelete = signal(false);

  protected blockedIds() {
    return [...this.store.blocked()];
  }

  set(patch: Partial<Settings>) {
    this.store.updateSettings(patch);
  }

  logoutOthers() {
    this.devices.update((list) => list.filter((d) => d.current));
    this.toast.show('Logged out of all other devices');
  }
}
