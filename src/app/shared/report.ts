import { Component, Injectable, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';
import { Toast } from './ui';

/** Reasons follow the IT Rules 2021 categories, in plain words. */
const REASONS = [
  { id: 'scam', label: 'Scam, fraud or fake offer', hint: 'Asking for UPI PIN, OTP, money, fake prizes' },
  { id: 'fake', label: 'False information', hint: 'Fake news, edited photos, misleading forwards' },
  { id: 'nudity', label: 'Nudity or sexual content', hint: 'Including my private photos shared without consent — removed within 24 hours' },
  { id: 'child', label: 'Child safety', hint: 'Anything harmful to a child' },
  { id: 'harass', label: 'Bullying or harassment', hint: 'Abuse, threats, stalking' },
  { id: 'hate', label: 'Hate speech', hint: 'Against religion, caste, gender, region, language' },
  { id: 'violence', label: 'Violence or self-harm', hint: 'Threats, dangerous acts' },
  { id: 'fakeid', label: 'Fake account or impersonation', hint: 'Pretending to be me or someone else' },
  { id: 'ip', label: 'Copyright or trademark', hint: 'My photo, music or brand used without permission' },
  { id: 'other', label: 'Something else', hint: '' },
];

@Injectable({ providedIn: 'root' })
export class Report {
  readonly target = signal<string | null>(null);
  open(what: string) {
    this.target.set(what);
  }
}

@Component({
  selector: 'app-report-sheet',
  imports: [Icon, RouterLink],
  template: `
    @if (report.target(); as what) {
      <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" (click)="close()">
        <div class="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="report-title">
          @if (!done()) {
            <div class="flex items-center justify-between">
              <h2 id="report-title" class="text-lg font-bold">Report {{ what }}</h2>
              <button class="icon-btn" (click)="close()" aria-label="Close"><svg lucideIcon="x" [size]="20" /></button>
            </div>
            <p class="mt-1 text-sm text-muted">Your report is private. The person won’t know it was you.</p>
            <div class="mt-4 space-y-2">
              @for (r of reasons; track r.id) {
                <button type="button" (click)="picked.set(r.id)" class="flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors" [class]="picked() === r.id ? 'border-brand bg-brand-50' : 'border-line hover:bg-soft'">
                  <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2" [class]="picked() === r.id ? 'border-brand bg-brand' : 'border-slate-300'">
                    @if (picked() === r.id) { <span class="h-2 w-2 rounded-full bg-white"></span> }
                  </span>
                  <span>
                    <span class="block text-sm font-semibold">{{ r.label }}</span>
                    @if (r.hint) { <span class="block text-xs text-muted">{{ r.hint }}</span> }
                  </span>
                </button>
              }
            </div>
            <button class="btn btn-primary mt-4 w-full" [disabled]="!picked()" (click)="submit()">Submit report</button>
          } @else {
            <div class="py-4 text-center">
              <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand"><svg lucideIcon="shield-check" [size]="28" /></span>
              <h2 class="mt-3 text-lg font-bold">Thanks, we’ve got it</h2>
              <p class="mt-1 text-sm text-muted">We acknowledge every report within 24 hours and decide within 15 days (IT Rules 2021). Track it in Settings → Reports. Not happy with the decision? Write to our <a routerLink="/grievance" class="font-semibold text-brand" (click)="close()">Grievance Officer</a>.</p>
              <button class="btn btn-ghost mt-4" (click)="close()">Done</button>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ReportSheet {
  protected readonly report = inject(Report);
  private readonly toast = inject(Toast);
  protected readonly reasons = REASONS;
  protected readonly picked = signal('');
  protected readonly done = signal(false);

  submit() {
    this.done.set(true);
    this.toast.show('Report sent (preview — nothing is stored)');
  }

  close() {
    this.report.target.set(null);
    this.picked.set('');
    this.done.set(false);
  }
}
