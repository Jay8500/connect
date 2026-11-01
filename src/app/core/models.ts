/** App name in one place, so a rename is a one-line change. */
export const APP = { name: 'Connect', by: 'Spread Apps™', domain: 'connect.spreadapps.in' } as const;

/** A picture drawn with a gradient + emoji (static preview has no real photos). */
export interface Scene {
  from: string;
  to: string;
  emoji: string;
  label?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  city: string;
  bio: string;
  hue: number; // avatar colour
  verified?: boolean;
  work?: string;
  study?: string;
  langs: string[];
  followers: number;
  following: number;
  mutual?: number;
  cover?: Scene;
  birthday?: string;
}

export interface Comment {
  userId: string;
  text: string;
  at: string;
}

export interface Poll {
  question: string;
  options: { text: string; votes: number }[];
}

export interface Post {
  id: string;
  userId: string;
  at: string;
  text: string;
  /** English version when the post is in another language */
  translation?: string;
  lang?: 'te' | 'hi' | 'ta' | 'ml' | 'mr' | 'bn' | 'pa';
  media?: Scene[];
  poll?: Poll;
  place?: string;
  groupId?: string;
  likes: number;
  shares: number;
  comments: Comment[];
  audience: 'Public' | 'Friends' | 'Family' | 'Only me';
}

export interface Story {
  userId: string;
  scene: Scene;
  at: string;
}

export interface Reel {
  id: string;
  userId: string;
  scene: Scene;
  caption: string;
  audio: string;
  likes: number;
  comments: number;
}

export type MessageKind = 'text' | 'voice' | 'photo' | 'system';

export interface Message {
  id: string;
  from: string; // user id, 'me' for the signed-in user
  text: string;
  at: string;
  kind?: MessageKind;
  status?: 'sent' | 'delivered' | 'read';
  forwardedMany?: boolean;
  /** Shows a scam warning above the message (UPI / OTP / prize links) */
  risky?: boolean;
}

export interface Chat {
  id: string;
  kind: 'direct' | 'group';
  name?: string;
  memberIds: string[];
  messages: Message[];
  unread: number;
  pinned?: boolean;
  muted?: boolean;
  /** Not in contacts yet: they see your name only, not your number */
  request?: boolean;
  scene?: Scene;
}

export type NotificationKind = 'like' | 'comment' | 'friend' | 'group' | 'birthday' | 'safety' | 'memory';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  userId?: string;
  text: string;
  at: string;
  read: boolean;
  link?: string;
}

export interface Group {
  id: string;
  name: string;
  about: string;
  members: number;
  privacy: 'Public' | 'Private';
  category: string;
  scene: Scene;
  city?: string;
}

export interface Settings {
  lang: 'en' | 'te' | 'hi';
  dataSaver: boolean;
  autoTranslate: boolean;
  whoCanMessage: 'Everyone' | 'Friends' | 'Friends of friends';
  profileVisibility: 'Public' | 'Friends';
  showPhone: boolean;
  readReceipts: boolean;
  lastSeen: boolean;
  dailyLimit: 0 | 30 | 60 | 90;
  newLoginAlerts: boolean;
}
