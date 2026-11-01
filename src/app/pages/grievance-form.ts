import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';

const TYPES = ['Post or comment', 'Fake account', 'Scam or fraud', 'Private photos', 'My personal data', 'Account blocked', 'Other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

/** Complaint to the Grievance Officer → /api/grievance (stored + emailed, ticket number back). */
@Component({
  selector: 'app-grievance-form',
  imports: [RouterLink, Icon],
  template: `
    <section class="rounded-3xl bg-soft p-6">
      @if (ticket(); as t) {
        <div class="py-4 text-center">
          <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand"><svg lucideIcon="check" [size]="28" /></span>
          <h2 class="mt-3 text-lg font-bold">Complaint received</h2>
          <p class="mt-1 text-sm text-muted">Your ticket number is <b class="text-ink">{{ t }}</b>. We’ve emailed you a copy and will reply within 15 days.</p>
        </div>
      } @else {
        <h2 class="text-lg font-bold">Raise a complaint</h2>
        <p class="mt-1 text-sm text-muted">You’ll get a ticket number at once and an email acknowledgement.</p>
        <form class="mt-5 grid gap-4 sm:grid-cols-2" (submit)="$event.preventDefault(); submit()" novalidate>
          <div>
            <label class="lbl" for="g-name">Your name</label>
            <input id="g-name" class="input" [class.bad]="err('name')" autocomplete="name" (input)="name.set(val($event))" />
            @if (err('name')) { <p class="msg">Enter your name.</p> }
          </div>
          <div>
            <label class="lbl" for="g-email">Email</label>
            <input id="g-email" type="email" class="input" [class.bad]="err('email')" autocomplete="email" (input)="email.set(val($event))" />
            @if (err('email')) { <p class="msg">Enter a valid email — we reply here.</p> }
          </div>
          <div>
            <label class="lbl" for="g-phone">Mobile <span class="font-normal text-muted">(optional)</span></label>
            <input id="g-phone" class="input" [class.bad]="err('phone')" inputmode="numeric" maxlength="10" autocomplete="tel-national" (input)="phone.set(val($event))" />
            @if (err('phone')) { <p class="msg">10-digit Indian mobile number.</p> }
          </div>
          <div>
            <label class="lbl" for="g-type">About</label>
            <select id="g-type" class="input" (change)="type.set(val($event))">
              @for (t of types; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="lbl" for="g-link">Link to the post/profile <span class="font-normal text-muted">(optional)</span></label>
            <input id="g-link" class="input" placeholder="https://connect.spreadapps.in/…" maxlength="300" (input)="link.set(val($event))" />
          </div>
          <div class="sm:col-span-2">
            <label class="lbl" for="g-details">What happened?</label>
            <textarea id="g-details" rows="5" class="input py-3!" [class.bad]="err('details')" maxlength="2000" (input)="details.set(val($event))"></textarea>
            <p class="flex justify-between text-xs" [class]="err('details') ? 'text-love' : 'text-muted'"><span>At least 20 characters.</span><span>{{ details().length }}/2000</span></p>
          </div>
          <input class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" (input)="website.set(val($event))" />
          <label class="flex gap-2.5 text-sm sm:col-span-2">
            <input type="checkbox" class="mt-1 accent-[var(--color-brand)]" (change)="consent.set($any($event.target).checked)" />
            <span>I agree that Spread Apps may use these details only to handle this complaint (<a routerLink="/privacy" class="font-semibold text-brand">Privacy policy</a>).</span>
          </label>
          @if (err('consent')) { <p class="msg -mt-2 sm:col-span-2">Please tick the box so we can handle your complaint.</p> }
          @if (serverError()) { <p class="rounded-xl bg-rose-50 p-3 text-sm text-rose-900 sm:col-span-2">{{ serverError() }}</p> }
          <button class="btn btn-primary sm:col-span-2" [disabled]="sending()">{{ sending() ? 'Sending…' : 'Submit complaint' }}</button>
        </form>
      }
    </section>
  `,
  styles: `
    .lbl { display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 600; }
    .msg { margin-top: 0.3rem; font-size: 0.78rem; font-weight: 500; color: var(--color-love); }
    .bad { border-color: var(--color-love); }
  `,
})
export class GrievanceForm {
  protected readonly types = TYPES;
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly type = signal(TYPES[0]);
  protected readonly link = signal('');
  protected readonly details = signal('');
  protected readonly website = signal('');
  protected readonly consent = signal(false);
  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly serverError = signal('');
  protected readonly ticket = signal('');

  private readonly errors = computed(() => {
    const e = new Set<string>();
    if (this.name().trim().length < 2) e.add('name');
    if (!EMAIL_RE.test(this.email().trim())) e.add('email');
    if (this.phone() && !PHONE_RE.test(this.phone())) e.add('phone');
    if (this.details().trim().length < 20) e.add('details');
    if (!this.consent()) e.add('consent');
    return e;
  });

  err(f: string): boolean {
    return this.submitted() && this.errors().has(f);
  }

  val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  async submit() {
    this.submitted.set(true);
    this.serverError.set('');
    if (this.errors().size) return;
    this.sending.set(true);
    try {
      const res = await fetch('/api/grievance', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: this.name().trim(), email: this.email().trim(), phone: this.phone(), type: this.type(),
          link: this.link().trim(), details: this.details().trim(), consent: true, website: this.website(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ticket) throw new Error(body.error || 'Could not send right now.');
      this.ticket.set(body.ticket);
    } catch (e) {
      this.serverError.set((e as Error).message + ' You can also call the Grievance Officer.');
    } finally {
      this.sending.set(false);
    }
  }
}
