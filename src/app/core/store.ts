import { Injectable, computed, signal } from '@angular/core';
import { CHATS, FRIEND_IDS, GROUPS, JOINED_GROUP_IDS, ME_ID, NOTIFICATIONS, POSTS, REELS, REQUEST_IDS, STORIES, SUGGESTION_IDS, TRENDING, USERS } from './data';
import { Chat, Post, Settings, User } from './models';

const SETTINGS_KEY = 'connect.settings';
const PHOTO_KEY = 'connect.myPhoto';
const DEFAULT_SETTINGS: Settings = {
  lang: 'en', dataSaver: false, autoTranslate: false, whoCanMessage: 'Friends of friends', profileVisibility: 'Friends',
  showPhone: false, readReceipts: true, lastSeen: true, dailyLimit: 60, newLoginAlerts: true,
};

/**
 * All app state for the static preview, kept in signals.
 * Pages only talk to this service — swapping it for Supabase later leaves the UI untouched.
 */
@Injectable({ providedIn: 'root' })
export class Store {
  readonly users = new Map(USERS.map((u) => [u.id, u]));
  readonly me = this.users.get(ME_ID)!;
  readonly stories = STORIES;
  readonly reels = REELS;
  readonly groups = GROUPS;
  readonly trending = TRENDING;

  readonly posts = signal<Post[]>(structuredClone(POSTS));
  readonly chats = signal<Chat[]>(structuredClone(CHATS));
  readonly notifications = signal(structuredClone(NOTIFICATIONS));
  readonly liked = signal(new Set<string>());
  readonly saved = signal(new Set<string>());
  readonly votes = signal(new Map<string, number>());
  readonly friends = signal(new Set(FRIEND_IDS));
  readonly requests = signal(new Set(REQUEST_IDS));
  readonly suggestions = signal(new Set(SUGGESTION_IDS));
  readonly sent = signal(new Set<string>());
  readonly joined = signal(new Set(JOINED_GROUP_IDS));
  readonly blocked = signal(new Set<string>());
  readonly settings = signal<Settings>(this.loadSettings());
  /** My profile photo as a small JPEG data URL (kept on this device in the preview). */
  readonly myPhoto = signal<string | null>(read(PHOTO_KEY));

  readonly unreadChats = computed(() => this.chats().reduce((n, c) => n + (c.unread ? 1 : 0), 0));
  readonly unreadNotifications = computed(() => this.notifications().filter((n) => !n.read).length);

  user(id: string): User {
    return id === 'me' ? this.me : (this.users.get(id) ?? this.me);
  }

  byUsername(username: string): User | undefined {
    return USERS.find((u) => u.username === username);
  }

  /* Posts */
  toggleLike(id: string) {
    this.liked.update((s) => toggled(s, id));
  }

  toggleSave(id: string) {
    this.saved.update((s) => toggled(s, id));
  }

  vote(postId: string, option: number) {
    this.votes.update((m) => new Map(m).set(postId, option));
  }

  addComment(postId: string, text: string) {
    this.posts.update((list) => list.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, { userId: ME_ID, text, at: 'now' }] } : p)));
  }

  addPost(post: Pick<Post, 'text' | 'audience' | 'media' | 'place'>) {
    const p: Post = { id: 'p' + Date.now(), userId: ME_ID, at: 'Just now', likes: 0, shares: 0, comments: [], ...post };
    // keep the pinned official post first
    this.posts.update(([pinned, ...rest]) => [pinned, p, ...rest]);
  }

  deletePost(id: string) {
    this.posts.update((list) => list.filter((p) => p.id !== id));
  }

  /* People */
  isFriend = (id: string) => this.friends().has(id);

  acceptRequest(id: string) {
    this.requests.update((s) => without(s, id));
    this.friends.update((s) => new Set(s).add(id));
  }

  declineRequest(id: string) {
    this.requests.update((s) => without(s, id));
  }

  sendRequest(id: string) {
    this.sent.update((s) => toggled(s, id));
  }

  unfriend(id: string) {
    this.friends.update((s) => without(s, id));
  }

  block(id: string) {
    this.blocked.update((s) => new Set(s).add(id));
    this.friends.update((s) => without(s, id));
  }

  unblock(id: string) {
    this.blocked.update((s) => without(s, id));
  }

  toggleJoin(id: string) {
    this.joined.update((s) => toggled(s, id));
  }

  /* Chats */
  chat(id: string) {
    return this.chats().find((c) => c.id === id);
  }

  openChat(id: string) {
    this.chats.update((list) => list.map((c) => (c.id === id && c.unread ? { ...c, unread: 0 } : c)));
  }

  /** Direct chat with a user, created on first use. */
  chatWith(userId: string): string {
    const found = this.chats().find((c) => c.kind === 'direct' && c.memberIds[0] === userId);
    if (found) return found.id;
    const chat: Chat = { id: 'c' + Date.now(), kind: 'direct', memberIds: [userId], messages: [], unread: 0 };
    this.chats.update((list) => [chat, ...list]);
    return chat.id;
  }

  send(chatId: string, text: string) {
    const at = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toUpperCase();
    this.chats.update((list) =>
      list.map((c) => (c.id === chatId ? { ...c, request: false, messages: [...c.messages, { id: 'm' + Date.now(), from: 'me', text, at, status: 'sent' as const }] } : c)),
    );
  }

  /** Demo only: a friend "replies" so the chat feels alive. */
  receive(chatId: string, from: string, text: string) {
    const at = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toUpperCase();
    this.chats.update((list) =>
      list.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages.map((m) => (m.from === 'me' ? { ...m, status: 'read' as const } : m)), { id: 'm' + Date.now(), from, text, at }] }
          : c,
      ),
    );
  }

  acceptChatRequest(chatId: string) {
    this.chats.update((list) => list.map((c) => (c.id === chatId ? { ...c, request: false } : c)));
  }

  deleteChat(chatId: string) {
    this.chats.update((list) => list.filter((c) => c.id !== chatId));
  }

  togglePin(chatId: string) {
    this.chats.update((list) => list.map((c) => (c.id === chatId ? { ...c, pinned: !c.pinned } : c)));
  }

  toggleMute(chatId: string) {
    this.chats.update((list) => list.map((c) => (c.id === chatId ? { ...c, muted: !c.muted } : c)));
  }

  markAllRead() {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  setMyPhoto(dataUrl: string | null) {
    this.myPhoto.set(dataUrl);
    try {
      if (dataUrl) localStorage.setItem(PHOTO_KEY, dataUrl);
      else localStorage.removeItem(PHOTO_KEY);
    } catch {
      /* storage full or private mode: photo lasts until reload */
    }
  }

  /* Settings (remembered on this device) */
  updateSettings(patch: Partial<Settings>) {
    this.settings.update((s) => ({ ...s, ...patch }));
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings()));
    } catch {
      /* private mode: settings just won't be remembered */
    }
  }

  private loadSettings(): Settings {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function toggled<T>(s: Set<T>, v: T): Set<T> {
  const n = new Set(s);
  if (!n.delete(v)) n.add(v);
  return n;
}

function without<T>(s: Set<T>, v: T): Set<T> {
  const n = new Set(s);
  n.delete(v);
  return n;
}

/** 1200 → 1.2K, 45200 → 45.2K, Indian lakh for 1,00,000+. */
export function compact(n: number): string {
  if (n >= 100000) return +(n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return +(n / 1000).toFixed(1) + 'K';
  return String(n);
}
