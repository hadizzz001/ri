/**
 * Appointment email templates + sender (EN / AR).
 *
 * Delivery is handled by ./mailer.js, which uses plain SMTP (e.g. Gmail app
 * password) when SMTP_USER/SMTP_PASS are set, and falls back to Resend.
 */
import { sendMail } from './mailer.js';
import {
  bookingDeposit,
  bookingText,
  cartDuration,
  longDate,
  money,
  priceLines,
  showsPriceNote,
} from './bookingMessage.js';

export const SALON_EMAIL = process.env.SALON_EMAIL || 'rafidahamhair@gmail.com';
export const SALON_PHONE = process.env.SALON_PHONE || '9613896074';

const BRAND = {
  name: 'Rafi Daham Hair Repair Studio',
  address: 'Beirut, Jabal Lubnan, Lebanon',
  site: 'https://www.rafidaham.com',
};

const T = {
  en: {
    dir: 'ltr',
    confirmSubject: 'Your booking has been received — Rafi Daham Hair Beauty Salon',
    reminderSubject: 'Reminder: your appointment at Rafi Daham Hair Repair Studio',
    cancelSubject: 'Your appointment has been cancelled — Rafi Daham Hair Repair Studio',
    hi: (n) => `Hi ${n},`,
    reminderIntro: (days) =>
      `This is a friendly reminder that your appointment is in ${days} ${days === 1 ? 'day' : 'days'}.`,
    cancelTitle: 'Your appointment has been cancelled',
    cancelIntro: (n) =>
      `Hi ${n}, as you asked, we have cancelled the appointment below. We hope to see you another time.`,
    footer:
      'Need to reschedule or cancel? Reply to this email, message us on WhatsApp, or cancel it from My account on our website.',
    cancelFooter: `Want to book again? Choose a new time at ${BRAND.site}/appointment`,
  },
  ar: {
    dir: 'rtl',
    confirmSubject: 'تم استلام حجزك — صالون رافي دهام للشعر والتجميل',
    reminderSubject: 'تذكير: موعدك في صالون رافي دهام',
    cancelSubject: 'تم إلغاء موعدك — صالون رافي دهام',
    hi: (n) => `مرحباً ${n}،`,
    reminderIntro: (days) =>
      `تذكير بأن موعدك بعد ${days === 1 ? 'يوم واحد' : `${days} أيام`}.`,
    cancelTitle: 'تم إلغاء موعدك',
    cancelIntro: (n) => `مرحباً ${n}، بناءً على طلبك ألغينا الموعد التالي. نأمل أن نراك في وقت آخر.`,
    footer:
      'لتغيير أو إلغاء الموعد، يرجى الرد على هذا البريد أو مراسلتنا عبر واتساب أو إلغاؤه من حسابي على موقعنا.',
    cancelFooter: `لحجز موعد جديد: ${BRAND.site}/appointment`,
  },
};

/** Client-typed values (name, notes…) must not be able to inject markup. */
const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

function layout({ dir, title, intro, bodyHtml, footer }) {
  return `<!doctype html>
<html dir="${dir}">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f0f0f">
    <div style="max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#111;color:#fff;border-radius:16px 16px 0 0;padding:24px 28px">
        <div style="font-size:18px;font-weight:700;letter-spacing:.02em">${BRAND.name}</div>
        <div style="font-size:13px;opacity:.7;margin-top:4px">${BRAND.address}</div>
      </div>
      <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px">
        <h1 style="margin:0 0 12px;font-size:20px;line-height:1.4">${title}</h1>
        ${intro ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#52525b">${intro}</p>` : ''}
        ${bodyHtml}
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#71717a">${footer}</p>
        <p style="margin:8px 0 0;font-size:12px"><a href="${BRAND.site}" style="color:#111">${BRAND.site}</a></p>
      </div>
    </div>
  </body>
</html>`;
}

function row(label, value, strong) {
  return `<tr>
    <td style="padding:8px 0;color:#71717a;white-space:nowrap;vertical-align:top">${label}</td>
    <td style="padding:8px 0 8px 16px;text-align:end;font-weight:${strong ? 700 : 500};word-break:break-word">${value}</td>
  </tr>`;
}

/**
 * The booking laid out as an email. A cancellation (`cancelled`) leaves out
 * the welcome lines and the note on prices.
 */
function buildBody(booking, lang, { title, intro, footer, cancelled = false }) {
  const t = T[lang] || T.en;
  const deposit = bookingDeposit(booking);
  const m = bookingText(lang);
  const items = booking.cart || [];
  const minutes = cartDuration(items);
  const serviceType = m.serviceTypes[booking.serviceType];
  const tableStyle = 'width:100%;border-collapse:collapse;font-size:14px';

  const detailsHtml = `
    <div style="font-size:15px;font-weight:700;margin:8px 0 4px">${m.details}</div>
    <table style="${tableStyle}">${[
      booking.reference ? row(m.reference, esc(booking.reference)) : '',
      row(m.name, esc(booking.name)),
      row(m.phone, `<span dir="ltr">${esc(booking.phone)}</span>`),
      row(m.email, esc(booking.email)),
      row(m.location, `${esc(booking.city)}, ${esc(booking.country)}`),
      serviceType ? row(m.serviceType, serviceType) : '',
      row(m.date, longDate(booking.date, lang)),
      row(m.time, esc(booking.hour)),
      minutes ? row(m.duration, `${minutes} ${m.mins}`) : '',
    ].join('')}</table>`;

  const servicesHtml = `
    <div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin:16px 0 8px">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#71717a;margin-bottom:10px">${m.services}</div>
      ${items
        .map(
          (i) => `<div style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0">
            <span>${esc(i.title)}${Number(i.qty) > 1 ? ` × ${i.qty}` : ''}${
              i.duration ? ` <span style="color:#a1a1aa">· ${i.duration} ${m.mins}</span>` : ''
            }</span>
            <span style="font-weight:600">${money(Number(i.price) * (Number(i.qty) || 1))}</span>
          </div>`
        )
        .join('')}
    </div>`;

  const totalsHtml = `<table style="${tableStyle}">${[
    ...priceLines(booking, lang).map(([label, amount]) => row(label, amount)),
    row(m.total, money(booking.total), true),
    deposit ? row(m.deposit, money(deposit)) : '',
  ].join('')}</table>`;

  const notesHtml = booking.notes
    ? `<div style="margin-top:12px;font-size:14px;line-height:1.6">
        <span style="color:#71717a">${m.notes}:</span> ${esc(booking.notes)}
      </div>`
    : '';

  const closingHtml = cancelled
    ? ''
    : `
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6">${m.welcome}</p>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;font-weight:600">${m.thanks}</p>`;

  const priceNoteHtml =
    cancelled || !showsPriceNote(booking)
      ? ''
      : `
    <div style="background:#faf7f0;border:1px solid #e9dfc7;border-radius:12px;padding:16px;margin-top:24px">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${m.noteTitle}</div>
      ${m.noteLines
        .map((l) => `<p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#3f3f46">${l}</p>`)
        .join('')}
    </div>`;

  return layout({
    dir: t.dir,
    title,
    intro,
    bodyHtml: detailsHtml + servicesHtml + totalsHtml + notesHtml + closingHtml + priceNoteHtml,
    footer: footer ?? t.footer,
  });
}

/** Confirmation email sent to the client right after booking. */
export async function sendClientConfirmation(booking) {
  const lang = booking.lang === 'ar' ? 'ar' : 'en';
  const t = T[lang];
  const html = buildBody(booking, lang, {
    title: bookingText(lang).received,
  });

  return sendMail({
    to: booking.email,
    subject: t.confirmSubject,
    html,
  });
}

/** Reminder email sent 2 days and 1 day before the appointment. */
export async function sendClientReminder(booking, daysBefore) {
  const lang = booking.lang === 'ar' ? 'ar' : 'en';
  const t = T[lang];
  const html = buildBody(booking, lang, {
    title: t.hi(esc(booking.name)),
    intro: t.reminderIntro(daysBefore),
  });

  return sendMail({
    to: booking.email,
    subject: t.reminderSubject,
    html,
  });
}

/**
 * A client cancelled from their account: they get a confirmation in their
 * language and the salon gets the details (in English, replies go to the
 * client). Each email is sent even if the other one fails.
 *
 * @returns {Promise<{client: boolean, salon: boolean}>} which emails went out
 */
export async function sendCancellationEmails(booking) {
  const lang = booking.lang === 'ar' ? 'ar' : 'en';
  const t = T[lang];
  const cancelledAt = new Date(booking.cancelledAt || Date.now()).toLocaleString('en-GB', {
    timeZone: 'Asia/Beirut',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const results = await Promise.allSettled([
    sendMail({
      to: booking.email,
      subject: t.cancelSubject,
      html: buildBody(booking, lang, {
        title: t.cancelTitle,
        intro: t.cancelIntro(esc(booking.name)),
        footer: t.cancelFooter,
        cancelled: true,
      }),
    }),
    sendMail({
      to: SALON_EMAIL,
      replyTo: booking.email,
      subject: `Appointment cancelled — ${booking.reference} · ${longDate(booking.date, 'en')} ${booking.hour}`,
      html: buildBody(booking, 'en', {
        title: 'Appointment cancelled by the client',
        intro: `${esc(booking.name)} cancelled this appointment from their account on the website (${cancelledAt}, Beirut time). The time is free again for new bookings.`,
        footer: 'Sent automatically by the booking system on the website.',
        cancelled: true,
      }),
    }),
  ]);

  const [client, salon] = results.map((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Cancellation email to the ${i ? 'salon' : 'client'} failed:`, r.reason?.message || r.reason);
      return false;
    }
    return !r.value?.skipped;
  });
  return { client, salon };
}
