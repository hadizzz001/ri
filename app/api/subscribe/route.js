import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import clientPromise from '../../lib/mongodb';
import { sendMail } from '../../lib/mailer';
import { welcomeEmail } from '../../lib/newsletterEmails';

export const dynamic = 'force-dynamic';

const WELCOME_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const isEmail = (v) => v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/* Best-effort per-IP throttle (per server instance) so the form can't be
   used to fire welcome emails at a list of strangers. */
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  if (hits.size > 5000) hits.clear();
  hits.set(ip, recent);
  return recent.length > 5;
}

let indexesReady;
function ensureIndexes(col) {
  indexesReady ||= Promise.all([
    col.createIndex({ email: 1 }, { unique: true }),
    col.createIndex({ token: 1 }, { unique: true }),
  ]).catch((err) => {
    indexesReady = undefined;
    console.error('[subscribe] index setup failed:', err?.message || err);
  });
  return indexesReady;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: a field hidden from people that bots fill in.
  if (body?.hp) return NextResponse.json({ ok: true, emailSent: true });

  const email = String(body?.email || '').trim().toLowerCase();
  if (!isEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

  try {
    const col = (await clientPromise).db('test').collection('Subscriber');
    await ensureIndexes(col);

    const now = new Date();
    const newToken = randomBytes(24).toString('hex');
    const before = await col.findOneAndUpdate(
      { email },
      {
        $set: { unsubscribedAt: null, updatedAt: now },
        // `email` comes from the filter on insert
        $setOnInsert: { token: newToken, source: 'website', createdAt: now },
      },
      { upsert: true, returnDocument: 'before' }
    );

    // Already on the list: never email the same address twice.
    if (before && !before.unsubscribedAt) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    // Re-subscribed right after unsubscribing: keep it quiet for a day.
    if (before?.welcomedAt && now - new Date(before.welcomedAt) < WELCOME_COOLDOWN_MS) {
      return NextResponse.json({ ok: true, emailSent: false });
    }

    const token = before?.token || newToken;
    const site = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
    const { subject, html } = welcomeEmail({
      site,
      unsubscribeUrl: `${site}/unsubscribe?token=${token}`,
    });

    try {
      const result = await sendMail({
        to: email,
        subject,
        html,
        provider: 'resend',
        from: process.env.NEWSLETTER_FROM_EMAIL || undefined,
        headers: {
          // One-click unsubscribe (RFC 8058) — Gmail / Yahoo show it next to the sender
          'List-Unsubscribe': `<${site}/api/subscribe/unsubscribe?token=${token}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });
      if (result?.skipped) return NextResponse.json({ ok: true, emailSent: false });

      await col.updateOne({ email }, { $set: { welcomedAt: now } });
      return NextResponse.json({ ok: true, emailSent: true });
    } catch (err) {
      // The subscription is saved even if the welcome email could not be sent.
      console.error('[subscribe] welcome email failed:', err?.message || err);
      return NextResponse.json({ ok: true, emailSent: false });
    }
  } catch (err) {
    console.error('[subscribe] failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
