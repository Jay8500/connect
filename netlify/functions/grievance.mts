import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

/**
 * Grievance complaints (IT Rules 2021 / DPDP Act 2023), stored in Netlify Blobs.
 *  POST /api/grievance { name, email, phone?, type, link?, details, consent, website (honeypot) } → { ok, ticket }
 * Emails (optional, via Resend; sender must be on mail.spreadapps.in):
 *   env RESEND_API_KEY + GRIEVANCE_EMAIL_TO → the Grievance Officer gets the complaint,
 *   and the person gets an acknowledgement with their ticket number.
 */
const TYPES = ['Post or comment', 'Fake account', 'Scam or fraud', 'Private photos', 'My personal data', 'Account blocked', 'Other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const MAX_PER_HOUR = 5;

declare const Netlify: { env: { get(k: string): string | undefined } };

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const origin = req.headers.get('origin') ?? '';
  if (origin && !/^https:\/\/(connect\.spreadapps\.in|[a-z0-9-]+\.netlify\.app)$|^http:\/\/localhost(:\d+)?$/.test(origin)) return json({ error: 'Forbidden' }, 403);

  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }
  const clean = (v: unknown, max: number) => String(v ?? '').replace(/[ \t]+/g, ' ').trim().slice(0, max);
  if (clean(b['website'], 100)) return json({ ok: true, ticket: 'CN-0' }); // bots fill the hidden field

  const name = clean(b['name'], 80);
  const email = clean(b['email'], 120).toLowerCase();
  const phone = clean(b['phone'], 10);
  const type = TYPES.includes(String(b['type'])) ? String(b['type']) : 'Other';
  const link = clean(b['link'], 300);
  const details = clean(b['details'], 2000);
  if (name.length < 2 || !EMAIL_RE.test(email) || (phone && !PHONE_RE.test(phone)) || details.length < 20 || b['consent'] !== true) {
    return json({ error: 'Please fill your name, a valid email, at least 20 characters of details, and tick the consent box.' }, 400);
  }

  const store = getStore({ name: 'grievances', consistency: 'strong' });
  const hour = new Date().toISOString().slice(0, 13);
  const rlKey = `rl/${await sha256(context.ip ?? 'unknown')}/${hour}`;
  const tries = Number((await store.get(rlKey)) ?? 0);
  if (tries >= MAX_PER_HOUR) return json({ error: 'Too many complaints from this network. Please try again in an hour.' }, 429);
  await store.set(rlKey, String(tries + 1));

  const now = new Date();
  const ticket = `CN-${now.toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  await store.setJSON(`g/${ticket}`, { ticket, name, email, phone, type, link, details, status: 'Received', at: now.toISOString() });

  const resend = Netlify.env.get('RESEND_API_KEY')?.trim();
  const officer = Netlify.env.get('GRIEVANCE_EMAIL_TO')?.trim();
  if (resend && officer) {
    const send = (to: string, subject: string, html: string, replyTo?: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resend}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: 'Connect Grievance <grievance@mail.spreadapps.in>', to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
        signal: AbortSignal.timeout(8000),
      }).catch((e) => console.error('resend', e));
    await Promise.all([
      send(
        officer,
        `⚖️ Grievance ${ticket}: ${type} — reply within 24h`,
        `<p><b>${esc(name)}</b> (${esc(email)}${phone ? ', +91 ' + esc(phone) : ''}) raised a complaint.</p>
         <p><b>Type:</b> ${esc(type)}${link ? `<br><b>Link:</b> ${esc(link)}` : ''}</p>
         <p style="white-space:pre-line">${esc(details)}</p>
         <p>Acknowledge within 24 hours, resolve within 15 days (intimate images: remove within 24 hours). Reply to this email to answer them.</p>`,
        email,
      ),
      send(
        email,
        `We received your complaint — ticket ${ticket}`,
        `<p>Namaste ${esc(name)},</p>
         <p>We received your complaint about <b>${esc(type)}</b>. Your ticket number is <b>${ticket}</b>.</p>
         <p>Our Grievance Officer will look into it and reply within 15 days. Content showing private or intimate images is removed within 24 hours.</p>
         <p>— Connect by Spread Apps™, Hyderabad, Telangana</p>`,
      ),
    ]);
  }
  return json({ ok: true, ticket });
};

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, '0')).join('');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'Cache-Control': 'no-store' } });
}

export const config = { path: '/api/grievance' };
