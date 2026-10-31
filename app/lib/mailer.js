/**
 * Tiny mail abstraction so the app doesn't care *how* mail goes out.
 *
 * Two supported providers, picked automatically:
 *
 *  1. SMTP (recommended — easiest, no API, no dashboard)
 *     Set SMTP_USER + SMTP_PASS in .env.
 *     For Gmail: turn on 2-Step Verification, then create an "App password"
 *     at https://myaccount.google.com/apppasswords and paste the 16 characters
 *     into SMTP_PASS. Nothing else to configure.
 *
 *  2. Resend (fallback) — used only if no SMTP credentials are present
 *     and RESEND_API_KEY is set.
 *
 * If neither is configured, sendMail() logs a warning and resolves without
 * throwing, so a booking is never lost because of an email problem.
 */

let transporter = null;

const hasSmtp = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Transient network hiccups ("Unable to fetch data", ECONNRESET, timeouts) are
 * common on flaky connections, so every send gets a few quick retries before
 * it is treated as a real failure.
 */
async function withRetry(fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || '');
      // Don't waste retries on permanent errors (bad key, unverified domain…)
      if (/\b(401|403|422)\b|invalid|not verified|unauthorized/i.test(msg)) break;
      if (i < attempts - 1) await sleep(800 * (i + 1));
    }
  }
  throw lastError;
}

async function getTransporter() {
  if (transporter) return transporter;

  const nodemailer = (await import('nodemailer')).default;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE ?? 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''), // Gmail shows the app password in groups of 4
    },
  });

  return transporter;
}

/**
 * @param {object}  opts
 * @param {string}  opts.to
 * @param {string}  opts.subject
 * @param {string}  opts.html
 * @param {string} [opts.replyTo]
 * @param {string} [opts.from]      overrides the default sender
 * @param {object} [opts.headers]   extra headers, e.g. List-Unsubscribe
 * @param {'resend'} [opts.provider] force Resend even when SMTP is configured
 * @param {string} [opts.scheduledAt] ISO date: Resend delivers it then (forces Resend)
 */
export async function sendMail({ to, subject, html, replyTo, from: fromOverride, headers, provider, scheduledAt }) {
  if (scheduledAt) provider = 'resend';
  const useSmtp = provider !== 'resend' && hasSmtp();
  const from =
    fromOverride ||
    process.env.APPOINTMENT_FROM_EMAIL ||
    (useSmtp
      ? `Rafi Daham Studio <${process.env.SMTP_USER}>`
      : 'Rafi Daham Studio <onboarding@resend.dev>');

  // ---- 1. SMTP
  if (useSmtp) {
    const tx = await getTransporter();
    const info = await withRetry(() =>
      tx.sendMail({ from, to, subject, html, replyTo, headers })
    );
    return { provider: 'smtp', id: info.messageId };
  }

  // ---- 2. Resend
  if (process.env.RESEND_API_KEY) {
    const id = await withRetry(async () => {
      // The raw REST endpoint is used instead of the SDK so we control the
      // timeout and can surface the real network error on failure.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      let res;
      try {
        res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            ...(replyTo ? { reply_to: replyTo } : {}),
            ...(headers ? { headers } : {}),
            ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || data.error || `Resend responded with ${res.status}`
        );
      }
      return data.id;
    });

    return { provider: 'resend', id };
  }

  console.warn(
    '[mailer] No email provider configured — skipping email to',
    to,
    '\n         Set SMTP_USER + SMTP_PASS or RESEND_API_KEY in .env'
  );
  return { provider: 'none', skipped: true };
}

/** Cancels an email scheduled on Resend (ignored when already sent / unknown). */
export async function cancelScheduledEmail(id) {
  if (!id || !process.env.RESEND_API_KEY) return false;
  try {
    const res = await fetch(`https://api.resend.com/emails/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    return res.ok;
  } catch (e) {
    console.error('Resend cancel failed:', e?.message || e);
    return false;
  }
}

/** Quick connection check used by scripts/test-email.js */
export async function verifyMailer() {
  if (hasSmtp()) {
    const tx = await getTransporter();
    await tx.verify();
    return 'smtp';
  }
  if (process.env.RESEND_API_KEY) return 'resend';
  return 'none';
}
