import { AppNotification, Chat, Group, Post, Reel, Scene, Story, User } from './models';

/**
 * Demo content for the static preview — real people's data comes from Supabase later.
 * Everything here is made up, but Indian: names, cities, languages, festivals, food.
 */

const S = (from: string, to: string, emoji: string, label?: string): Scene => ({ from, to, emoji, label });

export const ME_ID = 'u0';

export const USERS: User[] = [
  {
    id: 'u0', username: 'kiran.kumar', name: 'Kiran Kumar', city: 'Vijayawada, Andhra Pradesh', hue: 172,
    bio: 'Software engineer · Cricket on Sundays 🏏 · Biryani over everything', work: 'Developer at a startup', study: 'JNTU Kakinada',
    langs: ['Telugu', 'English', 'Hindi'], followers: 412, following: 289, cover: S('#0d9488', '#5eead4', '🌉', 'Prakasam Barrage at sunset'), birthday: '14 March',
  },
  { id: 'u1', username: 'priya.sharma', name: 'Priya Sharma', city: 'Jaipur, Rajasthan', hue: 330, bio: 'Teacher 📚 · Block-print lover', work: 'Teacher, Kendriya Vidyalaya', langs: ['Hindi', 'English'], followers: 1280, following: 340, mutual: 12 },
  { id: 'u2', username: 'sai.prasad', name: 'Sai Prasad', city: 'Hyderabad, Telangana', hue: 210, bio: 'Photographer · Charminar mornings', work: 'Freelance photographer', langs: ['Telugu', 'Urdu', 'English'], followers: 5400, following: 610, mutual: 24 },
  { id: 'u3', username: 'lakshmi.devi', name: 'Lakshmi Devi', city: 'Guntur, Andhra Pradesh', hue: 25, bio: 'Amma, cook, gardener 🌼', langs: ['Telugu'], followers: 96, following: 80, mutual: 18 },
  { id: 'u4', username: 'arjun.nair', name: 'Arjun Nair', city: 'Kochi, Kerala', hue: 140, bio: 'Marine engineer · Onam sadya fan', work: 'Cochin Shipyard', langs: ['Malayalam', 'English'], followers: 730, following: 402, mutual: 3 },
  { id: 'u5', username: 'fatima.shaikh', name: 'Fatima Shaikh', city: 'Mumbai, Maharashtra', hue: 280, bio: 'Doctor 🩺 · Local train survivor', work: 'Resident doctor', langs: ['Hindi', 'Marathi', 'English'], followers: 2100, following: 512, mutual: 5 },
  { id: 'u6', username: 'harpreet.singh', name: 'Harpreet Singh', city: 'Ludhiana, Punjab', hue: 45, bio: 'Farmer & dhaba owner 🌾', work: 'Singh Da Dhaba', langs: ['Punjabi', 'Hindi'], followers: 3900, following: 150, mutual: 1 },
  { id: 'u7', username: 'meera.iyer', name: 'Meera Iyer', city: 'Chennai, Tamil Nadu', hue: 350, bio: 'Bharatanatyam dancer · Filter coffee ☕', langs: ['Tamil', 'English'], followers: 8700, following: 300, mutual: 7, verified: true },
  { id: 'u8', username: 'rahul.verma', name: 'Rahul Verma', city: 'Lucknow, Uttar Pradesh', hue: 15, bio: 'UPSC aspirant · Chai > coffee', study: 'Lucknow University', langs: ['Hindi', 'English'], followers: 220, following: 390, mutual: 9 },
  { id: 'u9', username: 'sneha.patil', name: 'Sneha Patil', city: 'Pune, Maharashtra', hue: 190, bio: 'Product designer · Sinhagad treks ⛰️', work: 'Designer at an IT company', langs: ['Marathi', 'Hindi', 'English'], followers: 1500, following: 700, mutual: 15 },
  { id: 'u10', username: 'ankit.das', name: 'Ankit Das', city: 'Kolkata, West Bengal', hue: 60, bio: 'Football · Rosogolla · Durga Pujo 🪔', langs: ['Bengali', 'Hindi', 'English'], followers: 640, following: 610, mutual: 2 },
  { id: 'u11', username: 'divya.menon', name: 'Divya Menon', city: 'Bengaluru, Karnataka', hue: 260, bio: 'Startup founder-in-progress · Dosa critic', langs: ['Kannada', 'Malayalam', 'English'], followers: 990, following: 450, mutual: 6 },
  { id: 'sa', username: 'spreadapps', name: 'Spread Apps', city: 'India', hue: 172, bio: 'Official account · Made with ❤️ in India', langs: ['English', 'Telugu', 'Hindi'], followers: 10200, following: 0, verified: true },
];

export const FRIEND_IDS = ['u1', 'u2', 'u3', 'u5', 'u7', 'u8', 'u9'];
export const REQUEST_IDS = ['u4', 'u10'];
export const OFFICIAL_ID = 'sa';
export const ONLINE_IDS = ['u3', 'u2', 'u9', 'u8', 'u5'];
export const BIRTHDAY_IDS = ['u9'];

export const STORIES: Story[] = [
  { userId: 'u3', scene: S('#f59e0b', '#fde68a', '🌼', 'Sankranti muggu'), at: '1h' },
  { userId: 'u2', scene: S('#1e3a8a', '#60a5fa', '🕌', 'Charminar 6 AM'), at: '2h' },
  { userId: 'u7', scene: S('#be123c', '#fda4af', '💃', 'Rehearsal day'), at: '3h' },
  { userId: 'u9', scene: S('#065f46', '#6ee7b7', '⛰️', 'Sinhagad trek'), at: '5h' },
  { userId: 'u8', scene: S('#7c2d12', '#fdba74', '☕', 'Kulhad chai'), at: '6h' },
  { userId: 'u5', scene: S('#4c1d95', '#c4b5fd', '🌧️', 'Mumbai rains'), at: '8h' },
];

export const GROUPS: Group[] = [
  { id: 'g1', name: 'Vijayawada Foodies', about: 'Best tiffin centres, biryani and street food in Bezawada.', members: 18400, privacy: 'Public', category: 'Food', city: 'Vijayawada', scene: S('#ea580c', '#fdba74', '🍛') },
  { id: 'g2', name: 'Green Valley Apartments', about: 'Residents only. Water timings, maintenance, festival plans.', members: 212, privacy: 'Private', category: 'Neighbourhood', city: 'Hyderabad', scene: S('#15803d', '#86efac', '🏘️') },
  { id: 'g3', name: 'JNTU Kakinada Alumni', about: 'Batchmates, jobs, reunions and nostalgia.', members: 9600, privacy: 'Private', category: 'College', scene: S('#1d4ed8', '#93c5fd', '🎓') },
  { id: 'g4', name: 'Kisan Mitra – Farming Tips', about: 'Seeds, weather, mandi prices. Telugu, Hindi & English.', members: 52000, privacy: 'Public', category: 'Farming', scene: S('#3f6212', '#bef264', '🌾') },
  { id: 'g5', name: 'Gully Cricket India', about: 'Sunday matches, scores and memes.', members: 75000, privacy: 'Public', category: 'Sports', scene: S('#0369a1', '#7dd3fc', '🏏') },
  { id: 'g6', name: 'Rao Family ❤️', about: 'Our family — Guntur, Hyderabad, Bengaluru, USA.', members: 34, privacy: 'Private', category: 'Family', scene: S('#be185d', '#f9a8d4', '👨‍👩‍👧‍👦') },
];

export const JOINED_GROUP_IDS = ['g1', 'g3', 'g6'];

export const POSTS: Post[] = [
  {
    id: 'p1', userId: 'sa', at: 'Pinned', audience: 'Public', likes: 2400, shares: 310,
    text: 'Namaste 🙏 Welcome to the Connect preview — India’s own social app. Calm feed, no ads in chats, your language, your data. Tell us what you want in it!',
    comments: [{ userId: 'u9', text: 'Finally! Telugu UI please 🙌', at: '2h' }],
  },
  {
    id: 'p2', userId: 'u3', at: '1h', audience: 'Friends', lang: 'te', place: 'Guntur', likes: 86, shares: 4,
    text: 'ఈ సంక్రాంతికి మా ఇంటి ముందు ముగ్గు 🌼 పిల్లలందరూ కలిసి వేశారు!',
    translation: 'Our Sankranti muggu in front of the house 🌼 All the kids drew it together!',
    media: [S('#f59e0b', '#fde68a', '🌼', 'Sankranti muggu'), S('#db2777', '#fbcfe8', '🪁', 'Gaalipatalu')],
    comments: [{ userId: 'u0', text: 'Super amma! 😍', at: '45m' }, { userId: 'u2', text: 'Beautiful colours', at: '30m' }],
  },
  {
    id: 'p3', userId: 'u8', at: '3h', audience: 'Public', lang: 'hi', place: 'Lucknow', likes: 142, shares: 12,
    text: 'आज लखनऊ में पहली बारिश ☔ अदरक वाली चाय और पकौड़े — और क्या चाहिए!',
    translation: 'First rain in Lucknow today ☔ Ginger tea and pakodas — what more do you need!',
    media: [S('#475569', '#cbd5e1', '🌧️', 'Hazratganj in the rain')],
    comments: [{ userId: 'u5', text: 'Mumbai has had enough rain for both of us 😅', at: '2h' }],
  },
  {
    id: 'p4', userId: 'u9', at: '5h', audience: 'Public', likes: 318, shares: 22,
    text: 'Quick poll for the weekend trek group 👇',
    poll: { question: 'Best monsoon snack after a trek?', options: [{ text: 'Vada pav', votes: 120 }, { text: 'Bhutta (corn)', votes: 88 }, { text: 'Maggi', votes: 154 }, { text: 'Mirchi bajji', votes: 61 }] },
    comments: [{ userId: 'u0', text: 'Mirchi bajji, no doubt 🌶️', at: '4h' }],
  },
  {
    id: 'p5', userId: 'u2', at: '8h', audience: 'Public', place: 'Charminar, Hyderabad', likes: 1204, shares: 96,
    text: 'Woke up at 5 for this light. Old City never disappoints. 📸',
    media: [S('#1e3a8a', '#60a5fa', '🕌', 'Charminar 6 AM'), S('#7c2d12', '#fdba74', '🫖', 'Irani chai'), S('#831843', '#f9a8d4', '🌸', 'Laad Bazaar bangles')],
    comments: [{ userId: 'u7', text: 'Gorgeous frames!', at: '7h' }, { userId: 'u1', text: 'Adding to my travel list', at: '6h' }],
  },
  {
    id: 'p6', userId: 'u1', at: 'Yesterday', audience: 'Friends', groupId: 'g3', likes: 64, shares: 2,
    text: 'Our school won the district science fair! So proud of my students 🏆🔬',
    media: [S('#047857', '#6ee7b7', '🏆', 'District science fair')],
    comments: [],
  },
  {
    id: 'p8', userId: 'u0', at: '2 days ago', audience: 'Friends', place: 'Araku Valley', likes: 57, shares: 1,
    text: 'Weekend escape to Araku 🚂 Glass-top train, coffee plantations and bamboo chicken. Highly recommend!',
    media: [S('#15803d', '#86efac', '🌴', 'Araku valley'), S('#1d4ed8', '#93c5fd', '🚂', 'Vistadome train')],
    comments: [{ userId: 'u3', text: 'Super ra nanna 😍', at: '1d' }],
  },
  {
    id: 'p7', userId: 'u7', at: 'Yesterday', audience: 'Public', likes: 3020, shares: 210,
    text: 'Margazhi season performance this Saturday at Mylapore. Free entry for students 💃🪔',
    media: [S('#be123c', '#fda4af', '💃', 'Margazhi season')],
    comments: [{ userId: 'u4', text: 'Will be there!', at: '20h' }],
  },
];

export const REELS: Reel[] = [
  { id: 'r1', userId: 'u6', scene: S('#3f6212', '#bef264', '🌾', ''), caption: 'Morning at the farm before the dhaba opens 🚜 #Punjab', audio: 'Original audio · Harpreet Singh', likes: 45200, comments: 830 },
  { id: 'r2', userId: 'u7', scene: S('#be123c', '#fda4af', '💃', ''), caption: '30 seconds of Alarippu 🙏 #Bharatanatyam', audio: 'Carnatic · Nattai', likes: 98100, comments: 2100 },
  { id: 'r3', userId: 'u10', scene: S('#b91c1c', '#fca5a5', '🪔', ''), caption: 'Pandal hopping in Kolkata — 12 pandals in one night! #DurgaPujo', audio: 'Dhak beats · Ankit Das', likes: 22000, comments: 640 },
  { id: 'r4', userId: 'u3', scene: S('#c2410c', '#fed7aa', '🍲', ''), caption: 'గోంగూర పచ్చడి — అమ్మ చేతి రుచి 😋 #Telugu', audio: 'Original audio · Lakshmi Devi', likes: 15600, comments: 410 },
  { id: 'r5', userId: 'u4', scene: S('#0e7490', '#67e8f9', '🛶', ''), caption: 'Alleppey backwaters, slow mode on 🌴 #Kerala', audio: 'Chill · Monsoon Lo-fi', likes: 31000, comments: 520 },
];

export const CHATS: Chat[] = [
  {
    id: 'c1', kind: 'direct', memberIds: ['u3'], unread: 2, pinned: true,
    messages: [
      { id: 'm1', from: 'u3', text: 'Nanna, bhojanam chesava? 🍛', at: '12:40 PM' },
      { id: 'm2', from: 'me', text: 'Ippude chesanu amma, office lo', at: '12:52 PM', status: 'read' },
      { id: 'm3', from: 'u3', text: 'Voice message', at: '1:05 PM', kind: 'voice' },
      { id: 'm4', from: 'u3', text: 'Sankranti ki eppudu vastunnav? Ticket book chesava?', at: '1:06 PM' },
    ],
  },
  {
    id: 'c2', kind: 'group', name: 'Rao Family ❤️', memberIds: ['u3', 'u2', 'u9'], unread: 5, scene: S('#be185d', '#f9a8d4', '👨‍👩‍👧‍👦'),
    messages: [
      { id: 'm1', from: 'u2', text: 'Pics from yesterday’s function 📸', at: '9:10 AM', kind: 'photo' },
      { id: 'm2', from: 'u9', text: 'Good morning everyone 🌞', at: '9:30 AM' },
      { id: 'm3', from: 'u3', text: 'Government is giving ₹5,000 to everyone, click this link to claim before tonight!', at: '10:02 AM', forwardedMany: true },
      { id: 'm4', from: 'me', text: 'Amma, this is fake 🙏 Please don’t click such links.', at: '10:05 AM', status: 'read' },
    ],
  },
  {
    id: 'c3', kind: 'direct', memberIds: ['u8'], unread: 0,
    messages: [
      { id: 'm1', from: 'u8', text: 'Bhai, notes bhej de polity ke', at: 'Yesterday' },
      { id: 'm2', from: 'me', text: 'Sent on mail 👍 All the best!', at: 'Yesterday', status: 'read' },
    ],
  },
  {
    id: 'c4', kind: 'group', name: 'Sunday Cricket 🏏', memberIds: ['u2', 'u8', 'u10'], unread: 0, muted: true, scene: S('#0369a1', '#7dd3fc', '🏏'),
    messages: [
      { id: 'm1', from: 'u10', text: 'Ground booked for 7 AM', at: 'Sat' },
      { id: 'm2', from: 'u2', text: 'I’ll bring the new ball', at: 'Sat' },
    ],
  },
  {
    id: 'c5', kind: 'direct', memberIds: ['u6'], unread: 1, request: true,
    messages: [
      { id: 'm1', from: 'u6', text: 'Congratulations! You won a ₹10,000 prize. Send your UPI PIN to receive it.', at: '8:15 AM', risky: true },
    ],
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'birthday', userId: 'u9', text: 'It’s Sneha Patil’s birthday today 🎂 Wish her!', at: 'Today', read: false, link: '/chats' },
  { id: 'n2', kind: 'like', userId: 'u2', text: 'Sai Prasad and 23 others liked your photo.', at: '20m', read: false, link: '/home' },
  { id: 'n3', kind: 'comment', userId: 'u3', text: 'Lakshmi Devi commented: “Super ra nanna 😍”', at: '1h', read: false, link: '/home' },
  { id: 'n4', kind: 'friend', userId: 'u4', text: 'Arjun Nair sent you a friend request.', at: '3h', read: true, link: '/friends' },
  { id: 'n5', kind: 'safety', text: 'We blocked a message asking for your UPI PIN. Never share your PIN or OTP with anyone.', at: '5h', read: true, link: '/chats/c5' },
  { id: 'n6', kind: 'group', text: 'New in Vijayawada Foodies: “Best idli in Benz Circle?”', at: '6h', read: true, link: '/groups' },
  { id: 'n7', kind: 'memory', text: 'On this day 3 years ago: Your first trip to Araku 🚂', at: 'Yesterday', read: true, link: '/profile/kiran.kumar' },
];

export const TRENDING = ['#Sankranti', '#IndVsAus', '#MumbaiRains', '#Margazhi', '#StartupIndia', '#DurgaPujo', '#Biryani', '#UPSC'];
