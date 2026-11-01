import { Injectable, inject } from '@angular/core';
import { Settings } from './models';
import { Store } from './store';

/** Languages the app UI is available in. */
export const LANGS: { id: Settings['lang']; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'te', label: 'తెలుగు' },
  { id: 'hi', label: 'हिन्दी' },
];

/** Main UI words in English, Telugu and Hindi. More languages (and full-screen text) come with the real app. */
const WORDS = {
  home: ['Home', 'హోమ్', 'होम'],
  reels: ['Reels', 'రీల్స్', 'रील्स'],
  explore: ['Explore', 'అన్వేషించు', 'खोजें'],
  chats: ['Chats', 'చాట్స్', 'चैट'],
  notifications: ['Notifications', 'నోటిఫికేషన్లు', 'सूचनाएँ'],
  friends: ['Friends', 'స్నేహితులు', 'दोस्त'],
  groups: ['Groups', 'గ్రూపులు', 'ग्रुप'],
  profile: ['Profile', 'ప్రొఫైల్', 'प्रोफ़ाइल'],
  settings: ['Settings', 'సెట్టింగ్స్', 'सेटिंग्स'],
  create: ['Create', 'పోస్ట్ చేయి', 'पोस्ट करें'],
  mind: ['What’s on your mind?', 'మీ మనసులో ఏముంది?', 'आपके मन में क्या है?'],
  caughtUp: ['You’re all caught up', 'మీరు అన్నీ చూసేశారు', 'आपने सब देख लिया'],
  caughtUpSub: ['That’s everything from your friends and groups. Time for chai? ☕', 'మీ స్నేహితులు, గ్రూపుల పోస్టులు అన్నీ అయిపోయాయి. ఒక టీ తాగండి ☕', 'दोस्तों और ग्रुप की सारी पोस्ट देख लीं। अब एक चाय? ☕'],
  seeTranslation: ['See translation', 'అనువాదం చూడండి', 'अनुवाद देखें'],
  search: ['Search', 'వెతకండి', 'खोजें'],
  like: ['Like', 'నచ్చింది', 'पसंद'],
  comment: ['Comment', 'కామెంట్', 'टिप्पणी'],
  share: ['Share', 'షేర్', 'शेयर'],
  post: ['Post', 'పోస్ట్', 'पोस्ट'],
  message: ['Message', 'మెసేజ్', 'मैसेज'],
} as const;

export type WordKey = keyof typeof WORDS;
const INDEX = { en: 0, te: 1, hi: 2 } as const;

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly store = inject(Store);

  t(key: WordKey): string {
    return WORDS[key][INDEX[this.store.settings().lang]];
  }
}
