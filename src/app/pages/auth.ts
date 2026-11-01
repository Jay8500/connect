import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Settings } from '../core/models';
import { Store } from '../core/store';
import { Icon } from '../shared/icon';
import { Logo, Toast } from '../shared/ui';

const PHONE_RE = /^[6-9]\d{9}$/;
const NAME_RE = /^[\p{L}][\p{L}\p{M} .']{1,49}$/u;

/** Log in / sign up with mobile OTP. Preview: no OTP is sent, any 6 digits work. */
@Component({
  selector: 'app-auth',
  imports: [RouterLink, Icon, Logo],
  template: `
    <div class="grid min-h-dvh place-items-center bg-soft px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-6 flex justify-center"><app-logo /></div>
        <div class="card p-6 sm:p-8">
          @if (step() === 'form') {
            <h1 class="text-2xl font-extrabold">{{ signup() ? 'Create your account' : 'Welcome back 🙏' }}</h1>
            <p class="mt-1 text-sm text-muted">{{ signup() ? 'Takes a minute. Your number stays private.' : 'Log in with your mobile number.' }}</p>

            <form class="mt-6 space-y-4" (submit)="$event.preventDefault(); next()" novalidate>
              @if (signup()) {
                <div>
                  <label class="lbl" for="name">Full name</label>
                  <input id="name" class="input" [class.bad]="err('name')" autocomplete="name" [value]="name()" (input)="name.set($any($event.target).value)" />
                  @if (err('name')) { <p class="msg">Enter your name (letters only, 2–50).</p> }
                </div>
              }
              <div>
                <label class="lbl" for="phone">Mobile number</label>
                <div class="flex gap-2">
                  <span class="input flex w-auto! shrink-0 items-center font-semibold whitespace-nowrap">+91</span>
                  <input id="phone" class="input" [class.bad]="err('phone')" inputmode="numeric" maxlength="10" autocomplete="tel-national" placeholder="98765 43210" [value]="phone()" (input)="phone.set(digits($event))" />
                </div>
                @if (err('phone')) { <p class="msg">Enter a valid 10-digit Indian mobile number.</p> }
              </div>
              @if (signup()) {
                <div>
                  <label class="lbl" for="dob">Date of birth</label>
                  <input id="dob" type="date" class="input" [class.bad]="err('dob')" [max]="today" [value]="dob()" (input)="dob.set($any($event.target).value)" />
                  @if (err('dob')) { <p class="msg">{{ dob() ? 'Connect is for people 18 and older for now.' : 'Enter your date of birth.' }}</p> }
                  <p class="hint">Not shown on your profile. We ask to keep under-18s safe (DPDP Act).</p>
                </div>
                <div>
                  <span class="lbl">App language</span>
                  <div class="flex gap-2">
                    @for (l of langs; track l.id) { <button type="button" class="chip" [class.chip-on]="lang() === l.id" (click)="lang.set(l.id)">{{ l.label }}</button> }
                  </div>
                </div>
                <div class="space-y-2 rounded-2xl bg-soft p-3 text-sm">
                  <label class="flex gap-2.5">
                    <input type="checkbox" class="mt-1 accent-[var(--color-brand)]" [checked]="agree()" (change)="agree.set($any($event.target).checked)" />
                    <span>I am 18+ and agree to the <a routerLink="/terms" class="font-semibold text-brand">Terms</a> and <a routerLink="/privacy" class="font-semibold text-brand">Privacy policy</a>. <span class="text-love">*</span></span>
                  </label>
                  <label class="flex gap-2.5">
                    <input type="checkbox" class="mt-1 accent-[var(--color-brand)]" [checked]="suggest()" (change)="suggest.set($any($event.target).checked)" />
                    <span class="text-muted">Optional: suggest friends from my college, work and groups. You can change this later.</span>
                  </label>
                  @if (err('agree')) { <p class="msg">Please accept the Terms and Privacy policy to continue.</p> }
                </div>
              }
              <button class="btn btn-primary w-full">Get OTP</button>
            </form>
            <p class="mt-5 text-center text-sm text-muted">
              @if (signup()) { Already on Connect? <a routerLink="/login" class="font-semibold text-brand">Log in</a> }
              @else { New here? <a routerLink="/signup" class="font-semibold text-brand">Create account</a> }
            </p>
          } @else {
            <button class="icon-btn -ml-2" (click)="step.set('form')" aria-label="Back"><svg lucideIcon="arrow-left" [size]="20" /></button>
            <h1 class="mt-2 text-2xl font-extrabold">Enter the OTP</h1>
            <p class="mt-1 text-sm text-muted">Sent to +91 {{ phone() }}. <span class="font-semibold text-amber-700">Preview: type any 6 digits.</span></p>
            <form class="mt-6" (submit)="$event.preventDefault(); verify()">
              <input class="input text-center text-2xl tracking-[0.6em]" inputmode="numeric" autocomplete="one-time-code" maxlength="6" [value]="otp()" (input)="otp.set(digits($event))" aria-label="6-digit OTP" />
              <button class="btn btn-primary mt-4 w-full" [disabled]="otp().length !== 6">Verify & continue</button>
            </form>
            <p class="mt-4 flex items-start gap-2 text-xs text-muted"><svg lucideIcon="shield-alert" [size]="15" class="shrink-0 text-love" />Never share this OTP with anyone — not even someone saying they are from Connect.</p>
          }
        </div>
        <p class="mt-6 text-center text-xs text-muted">Powered by Spread Apps™ · Made with ❤️ in India</p>
      </div>
    </div>
  `,
  styles: `
    .lbl { display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 600; }
    .hint { margin-top: 0.3rem; font-size: 0.75rem; color: var(--color-muted); }
    .msg { margin-top: 0.3rem; font-size: 0.78rem; font-weight: 500; color: var(--color-love); }
    .bad { border-color: var(--color-love); }
  `,
})
export class Auth {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly toast = inject(Toast);

  readonly mode = input<'login' | 'signup'>('login');
  protected readonly signup = computed(() => this.mode() === 'signup');
  protected readonly langs: { id: Settings['lang']; label: string }[] = [{ id: 'en', label: 'English' }, { id: 'te', label: 'తెలుగు' }, { id: 'hi', label: 'हिन्दी' }];
  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly step = signal<'form' | 'otp'>('form');
  protected readonly submitted = signal(false);
  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly dob = signal('');
  protected readonly lang = signal<Settings['lang']>(this.store.settings().lang);
  protected readonly agree = signal(false);
  protected readonly suggest = signal(false);
  protected readonly otp = signal('');

  private readonly errors = computed(() => {
    const e = new Set<string>();
    if (!PHONE_RE.test(this.phone())) e.add('phone');
    if (this.signup()) {
      if (!NAME_RE.test(this.name().trim())) e.add('name');
      if (!this.dob() || age(this.dob()) < 18) e.add('dob');
      if (!this.agree()) e.add('agree');
    }
    return e;
  });

  err(field: string): boolean {
    return this.submitted() && this.errors().has(field);
  }

  digits(e: Event): string {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/\D/g, '');
    return el.value;
  }

  next() {
    this.submitted.set(true);
    if (this.errors().size) return;
    if (this.signup()) this.store.updateSettings({ lang: this.lang() });
    this.step.set('otp');
  }

  verify() {
    this.toast.show(this.signup() ? 'Welcome to Connect! 🎉' : 'Logged in');
    this.router.navigate(['/home']);
  }
}

function age(isoDate: string): number {
  const b = new Date(isoDate);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a;
}
