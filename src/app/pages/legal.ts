import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/ui';

interface Doc {
  title: string;
  intro: string;
  sections: { h: string; p: string[] }[];
}

/** Draft text for the preview. Final versions need a lawyer's review before launch. */
const DOCS: Record<string, Doc> = {
  privacy: {
    title: 'Privacy policy',
    intro: 'This policy explains what Connect collects, why, and the rights you have under the Digital Personal Data Protection Act, 2023 (DPDP Act).',
    sections: [
      { h: 'What we collect', p: ['Account: name, mobile number, date of birth (to check you are 18+), language.', 'What you share: posts, photos, comments, messages, groups you join.', 'Device & safety: device type, approximate location from IP, login times — to keep your account safe.', 'We do NOT read your phone contacts, SMS or call logs, and we do not sell your data.'] },
      { h: 'Why we use it', p: ['To run the app: show your posts to the people you choose, deliver messages, suggest friends only if you allow it.', 'To keep people safe: detect scams, fake accounts and abuse.', 'Each optional use has its own consent switch in Settings → Your data & rights.'] },
      { h: 'Ads', p: ['There are never ads in chats, login or settings. Any future ads in the feed will be clearly marked “Sponsored” and will not use your messages.'] },
      { h: 'Where your data lives', p: ['We plan to store data on servers in India. Messages and photos are encrypted in transit and at rest.'] },
      { h: 'Your rights', p: ['See, correct and update your data.', 'Download a copy of your data.', 'Withdraw any consent — as easily as you gave it.', 'Delete your account (permanent after 30 days).', 'Nominate a family member to act for you in case of death or incapacity.', 'Complain to our Grievance Officer, and then to the Data Protection Board of India.'] },
      { h: 'Children', p: ['Connect is for people 18 and older at launch. If we learn an under-18 signed up, we delete the account.'] },
      { h: 'How long we keep data', p: ['While your account is active. Deleted content is erased within 30 days, except where the law requires us to keep it longer (for example, IT Rules 2021 require 180 days for some records).'] },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'By using Connect you agree to these terms. Connect is a product of Spread Apps™, an MSME (Udyam) registered in Hyderabad, Telangana, India.',
    sections: [
      { h: 'Who can use Connect', p: ['You must be 18 or older and use your real name. One personal account per person.'] },
      { h: 'Your content', p: ['You own what you post. You give us permission to show it to the audience you choose. You can delete it any time.'] },
      { h: 'What is not allowed', p: ['Anything that breaks Indian law or our Community guidelines: scams, hate, harassment, nudity, child abuse material, fake news, impersonation, or copyright violation.'] },
      { h: 'Our role', p: ['Connect is an intermediary under the IT Act, 2000. We act on valid complaints and government orders as the IT Rules, 2021 require.'] },
      { h: 'Ending your account', p: ['You can delete your account any time. We may suspend accounts that seriously or repeatedly break these terms — you can appeal through the Grievance Officer.'] },
      { h: 'Law & disputes', p: ['These terms follow the laws of India. Courts in Hyderabad, Telangana have jurisdiction.'] },
    ],
  },
  guidelines: {
    title: 'Community guidelines',
    intro: 'Connect is for families, friends and neighbours. Treat people the way you would at a family function.',
    sections: [
      { h: 'Be kind', p: ['No abuse, threats, bullying or stalking. Disagree politely.'] },
      { h: 'Respect everyone', p: ['No hate against religion, caste, gender, region, language, disability or community.'] },
      { h: 'Share the truth', p: ['Don’t forward rumours or edited photos. Check before you share — fake news can hurt real people.'] },
      { h: 'No scams', p: ['Never ask for or share UPI PINs, OTPs, bank details, or promise prizes and jobs for a fee.'] },
      { h: 'Keep it safe', p: ['No nudity or sexual content. No content that harms children — we report it to the authorities.', 'Never share someone’s private photos. Reported intimate images are removed within 24 hours.'] },
      { h: 'Be yourself', p: ['Use your real name. Don’t pretend to be another person, brand or official.'] },
      { h: 'What happens if rules are broken', p: ['We remove the content and may warn, limit or suspend the account. You will be told why and can appeal.'] },
    ],
  },
  grievance: {
    title: 'Grievance redressal',
    intro: 'As required by the IT Rules, 2021 and the DPDP Act, 2023, Connect will have a Grievance Officer based in India.',
    sections: [
      { h: 'How to complain', p: ['In the app: tap ⋯ on any post, profile or chat → Report.', 'For anything else: write to the Grievance Officer (details below).'] },
      { h: 'Timelines', p: ['We acknowledge every complaint within 24 hours.', 'We resolve it within 15 days.', 'Content showing nudity or private images shared without consent is removed within 24 hours.'] },
      { h: 'Grievance Officer', p: ['Name, email and address will be published here before Connect launches.'] },
      { h: 'Not satisfied?', p: ['You can appeal to the Grievance Appellate Committee (gac.gov.in) for content decisions, or to the Data Protection Board of India for personal data complaints.', 'For cyber fraud, call 1930 or report at cybercrime.gov.in.'] },
    ],
  },
};

@Component({
  selector: 'app-legal',
  imports: [RouterLink, Icon, Logo],
  template: `
    <div class="min-h-dvh bg-white">
      <header class="border-b border-line">
        <div class="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <app-logo />
          <a routerLink="/home" class="btn btn-ghost btn-sm">Open app</a>
        </div>
      </header>
      <article class="mx-auto max-w-3xl px-4 py-10">
        <p class="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900"><svg lucideIcon="info" [size]="16" class="shrink-0" />Draft for the preview. The final version will be reviewed by a lawyer before launch.</p>
        <h1 class="mt-6 text-3xl font-extrabold">{{ d().title }}</h1>
        <p class="mt-3 text-muted">{{ d().intro }}</p>
        @for (s of d().sections; track s.h) {
          <h2 class="mt-8 text-lg font-bold">{{ s.h }}</h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink/85">
            @for (p of s.p; track $index) { <li>{{ p }}</li> }
          </ul>
        }
        <nav class="mt-12 flex flex-wrap gap-2 border-t border-line pt-6 text-sm">
          <a routerLink="/privacy" class="chip">Privacy</a>
          <a routerLink="/terms" class="chip">Terms</a>
          <a routerLink="/guidelines" class="chip">Guidelines</a>
          <a routerLink="/grievance" class="chip">Grievance</a>
        </nav>
        <p class="mt-6 text-xs text-muted">Last updated: 1 November 2026 · Powered by Spread Apps™</p>
      </article>
    </div>
  `,
})
export class Legal {
  readonly doc = input<string>('privacy');
  protected readonly d = computed(() => DOCS[this.doc()] ?? DOCS['privacy']);
}
