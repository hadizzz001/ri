/**
 * Appointment email templates + sender (EN / AR).
 *
 * Delivery is handled by ./mailer.js, which uses plain SMTP (e.g. Gmail app
 * password) when SMTP_USER/SMTP_PASS are set, and falls back to Resend.
 */
import { sendMail } from './mailer.js';

export const SALON_EMAIL = process.env.SALON_EMAIL || 'rafidahamhair@gmail.com';
export const SALON_PHONE = process.env.SALON_PHONE || '96178808100';

const BRAND = {
  name: 'Rafi Daham Hair Repair Studio',
  address: 'Beirut, Jabal Lubnan, Lebanon',
  site: 'https://www.rafidaham.com',
};

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export const prettyDate = (isoDate, lang = 'en') => {
  try {
    const [y, m, d] = String(isoDate).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(
      lang === 'ar' ? 'ar-EG' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
    );
  } catch {
    return isoDate;
  }
};

const T = {
  en: {
    dir: 'ltr',
    confirmSubject: 'Your appointment request — Rafi Daham Hair Repair Studio',
    reminderSubject: 'Reminder: your appointment at Rafi Daham Hair Repair Studio',
    hi: (n) => `Hi ${n},`,
    confirmIntro:
      'Thank you for booking with us. Here are your appointment details. We will contact you shortly on WhatsApp to confirm.',
    reminderIntro: (days) =>
      `This is a friendly reminder that your appointment is in ${days} ${days === 1 ? 'day' : 'days'}.`,
    details: 'Appointment details',
    services: 'Services',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    duration: 'Duration',
    total: 'Total',
    deposit: 'Deposit to confirm (25%)',
    ref: 'Booking reference',
    footer:
      'Need to reschedule or cancel? Just reply to this email or message us on WhatsApp.',
    mins: 'mins',
    newBookingSubject: 'New appointment request',
    client: 'Client',
    phone: 'Phone',
    email: 'Email',
    notes: 'Notes',
  },
  ar: {
    dir: 'rtl',
    confirmSubject: 'طلب موعدك — صالون رافي دهام',
    reminderSubject: 'تذكير: موعدك في صالون رافي دهام',
    hi: (n) => `مرحباً ${n}،`,
    confirmIntro:
      'شكراً لحجزك معنا. إليك تفاصيل موعدك. سنتواصل معك قريباً عبر واتساب للتأكيد.',
    reminderIntro: (days) =>
      `تذكير بأن موعدك بعد ${days === 1 ? 'يوم واحد' : `${days} أيام`}.`,
    details: 'تفاصيل الموعد',
    services: 'الخدمات',
    date: 'التاريخ',
    time: 'الوقت',
    location: 'الموقع',
    duration: 'المدة',
    total: 'الإجمالي',
    deposit: 'الدفعة الأولى للتأكيد (25%)',
    ref: 'رقم الحجز',
    footer: 'لتغيير أو إلغاء الموعد، يرجى الرد على هذا البريد أو مراسلتنا عبر واتساب.',
    mins: 'دقيقة',
    newBookingSubject: 'طلب موعد جديد',
    client: 'العميل',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    notes: 'ملاحظات',
  },
};

function layout({ dir, title, intro, rowsHtml, servicesHtml, footer }) {
  return `<!doctype html>
<html dir="${dir}">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f0f0f">
    <div style="max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#111;color:#fff;border-radius:16px 16px 0 0;padding:24px 28px">
        <div style="font-size:18px;font-weight:700;letter-spacing:.02em">${BRAND.name}</div>
        <div style="font-size:13px;opacity:.7;margin-top:4px">${BRAND.address}</div>
      </div>
      <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px">
        <h1 style="margin:0 0 12px;font-size:20px">${title}</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#52525b">${intro}</p>
        ${servicesHtml}
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px">${rowsHtml}</table>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#71717a">${footer}</p>
        <p style="margin:8px 0 0;font-size:12px"><a href="${BRAND.site}" style="color:#111">${BRAND.site}</a></p>
      </div>
    </div>
  </body>
</html>`;
}

function row(label, value, strong) {
  return `<tr>
    <td style="padding:8px 0;color:#71717a;white-space:nowrap">${label}</td>
    <td style="padding:8px 0;text-align:end;font-weight:${strong ? 700 : 500}">${value}</td>
  </tr>`;
}

function buildBody(booking, lang, { title, intro }) {
  const t = T[lang] || T.en;
  const items = booking.cart || [];
  const totalDuration = items.reduce(
    (a, i) => a + (Number(i.duration) || 0) * (Number(i.qty) || 1),
    0
  );

  const servicesHtml = `
    <div style="border:1px solid #e4e4e7;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#71717a;margin-bottom:10px">${t.services}</div>
      ${items
        .map(
          (i) => `<div style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0">
            <span>${i.title}${Number(i.qty) > 1 ? ` × ${i.qty}` : ''}${
              i.duration ? ` <span style="color:#a1a1aa">· ${i.duration} ${t.mins}</span>` : ''
            }</span>
            <span style="font-weight:600">${money(Number(i.price) * (Number(i.qty) || 1))}</span>
          </div>`
        )
        .join('')}
    </div>`;

  const rowsHtml = [
    row(t.date, prettyDate(booking.date, lang)),
    row(t.time, booking.hour),
    row(t.location, `${booking.city}, ${booking.country}`),
    totalDuration ? row(t.duration, `${totalDuration} ${t.mins}`) : '',
    row(t.total, money(booking.total), true),
    row(t.deposit, money(Number(booking.total) * 0.25)),
    booking.reference ? row(t.ref, booking.reference) : '',
  ].join('');

  return layout({ dir: t.dir, title, intro, rowsHtml, servicesHtml, footer: t.footer });
}

/** Confirmation email sent to the client right after booking. */
export async function sendClientConfirmation(booking) {
  const lang = booking.lang === 'ar' ? 'ar' : 'en';
  const t = T[lang];
  const html = buildBody(booking, lang, {
    title: t.hi(booking.name),
    intro: t.confirmIntro,
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
    title: t.hi(booking.name),
    intro: t.reminderIntro(daysBefore),
  });

  return sendMail({
    to: booking.email,
    subject: t.reminderSubject,
    html,
  });
}
