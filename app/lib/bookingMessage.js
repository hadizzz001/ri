/**
 * Wording of the "booking received" message, shared by the WhatsApp handoff
 * (app/appointment/page.jsx) and the confirmation / reminder emails
 * (app/lib/appointmentEmails.js) so both always say the same thing.
 *
 * Plain data + pure helpers only — safe to import from client and server.
 */

export const BOOKING_MESSAGE = {
  en: {
    received: 'Your booking has been successfully received by Rafi Daham Hair Beauty Salon.',
    details: 'Booking Details:',
    reference: 'Booking reference',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    location: 'Location',
    serviceType: 'Service type',
    serviceTypes: { salon: 'Salon service', home: 'Home service' },
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    services: 'Services',
    subtotal: 'Subtotal',
    homeFee: 'Home service (×2)',
    tax: 'Tax',
    total: 'Total',
    deposit: 'Deposit to confirm (25%)',
    notes: 'Notes',
    mins: 'mins',
    welcome:
      'We look forward to welcoming you and providing you with an exceptional experience.',
    thanks: 'Thank you for choosing Rafi Daham.',
    noteTitle: '🌟 IMPORTANT NOTE ABOUT PRICES & SERVICES',
    noteLines: [
      'ALL PRICES LISTED ABOVE ARE APPLICABLE FOR SERVICES PROVIDED WITHIN OUR LUXURY SALON.',
      'SERVICES PROVIDED OUTSIDE THE SALON WITHIN LEBANON WILL INCUR A 100% INCREASE.',
      'SERVICES PROVIDED OUTSIDE LEBANON WILL INCUR A 300% INCREASE.',
    ],
  },
  ar: {
    received: 'تم استلام حجزك بنجاح لدى صالون رافي دهام للشعر والتجميل.',
    details: 'تفاصيل الحجز:',
    reference: 'رقم الحجز',
    name: 'الاسم',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    location: 'الموقع',
    serviceType: 'نوع الخدمة',
    serviceTypes: { salon: 'خدمة في الصالون', home: 'خدمة منزلية' },
    date: 'التاريخ',
    time: 'الوقت',
    duration: 'المدة',
    services: 'الخدمات',
    subtotal: 'المجموع الفرعي',
    homeFee: 'خدمة منزلية (ضعف السعر)',
    tax: 'الضريبة',
    total: 'الإجمالي',
    deposit: 'العربون للتأكيد (25%)',
    notes: 'ملاحظات',
    mins: 'دقيقة',
    welcome: 'نتطلّع إلى استقبالك وتقديم تجربة استثنائية لك.',
    thanks: 'شكراً لاختيارك رافي دهام.',
    noteTitle: '🌟 ملاحظة مهمة حول الأسعار والخدمات',
    noteLines: [
      'جميع الأسعار المذكورة أعلاه تنطبق على الخدمات المقدّمة داخل صالوننا الفاخر.',
      'الخدمات المقدّمة خارج الصالون داخل لبنان تخضع لزيادة بنسبة 100%.',
      'الخدمات المقدّمة خارج لبنان تخضع لزيادة بنسبة 300%.',
    ],
  },
};

export const bookingText = (lang) => BOOKING_MESSAGE[lang === 'ar' ? 'ar' : 'en'];

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

/** "YYYY-MM-DD" → "Friday, 26 September 2026" (or the Arabic equivalent). */
export const longDate = (isoDate, lang = 'en') => {
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

/** Total minutes for a cart of { duration, qty } items. */
export const cartDuration = (cart = []) =>
  cart.reduce((a, i) => a + (Number(i.duration) || 0) * (Number(i.qty) || 1), 0);

/**
 * [label, amount] rows between the services and the total — subtotal, home
 * service and tax — keeping only those that apply (none when the total is
 * just the services).
 */
export function priceLines(booking, lang = 'en') {
  const t = bookingText(lang);
  const homeFee = Number(booking.homeFee) || 0;
  const tax = Number(booking.tax) || 0;
  if (!homeFee && !tax) return [];

  return [
    [t.subtotal, money(booking.subtotal)],
    homeFee ? [t.homeFee, money(homeFee)] : null,
    tax ? [`${t.tax} (${booking.taxPercent}%)`, money(tax)] : null,
  ].filter(Boolean);
}

/** The full plain-text message, as sent on WhatsApp. */
export function buildBookingText(booking, lang = 'en') {
  const t = bookingText(lang);
  const items = booking.cart || [];
  const minutes = cartDuration(items);
  const serviceType = t.serviceTypes[booking.serviceType];

  const services = items.map((i) => {
    const qty = Number(i.qty) || 1;
    const dur = i.duration ? ` (${i.duration} ${t.mins})` : '';
    return `• ${i.title}${qty > 1 ? ` x${qty}` : ''} — ${money(Number(i.price) * qty)}${dur}`;
  });

  return [
    t.received,
    '',
    `*${t.details}*`,
    booking.reference ? `${t.reference}: ${booking.reference}` : null,
    `${t.name}: ${booking.name}`,
    `${t.phone}: ${booking.phone}`,
    `${t.email}: ${booking.email}`,
    `${t.location}: ${booking.city}, ${booking.country}`,
    serviceType ? `${t.serviceType}: ${serviceType}` : null,
    `${t.date}: ${longDate(booking.date, lang)}`,
    `${t.time}: ${booking.hour}`,
    minutes ? `${t.duration}: ${minutes} ${t.mins}` : null,
    '',
    `${t.services}:`,
    ...services,
    '',
    ...priceLines(booking, lang).map(([label, amount]) => `${label}: ${amount}`),
    `${t.total}: ${money(booking.total)}`,
    `${t.deposit}: ${money(booking.deposit ?? Number(booking.total) * 0.25)}`,
    booking.notes ? `${t.notes}: ${booking.notes}` : null,
    '',
    t.welcome,
    '',
    t.thanks,
    '',
    `*${t.noteTitle}*`,
    ...t.noteLines,
  ]
    .filter((line) => line !== null)
    .join('\n');
}
