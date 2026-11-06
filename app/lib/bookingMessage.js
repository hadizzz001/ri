/**
 * Wording of the "booking received" message, shared by the WhatsApp handoff
 * (app/appointment/page.jsx) and the confirmation / reminder emails
 * (app/lib/appointmentEmails.js) so both always say the same thing.
 *
 * Plain data + pure helpers only — safe to import from client and server.
 */
import { DEPOSIT_RATE, isLebanon } from './bookingPrice.js';

/** The salon's WhatsApp number, as wa.me wants it. */
export const SALON_WHATSAPP = '9613896074';

export const BOOKING_MESSAGE = {
  en: {
    received: 'Your booking has been successfully received by Rafi Daham Hair Beauty Salon.',
    shortNotice: 'This appointment is less than 3 hours away. I am contacting you to continue my reservation.',
    continueAsk: (when, ref) =>
      `Hello, I booked an appointment on ${when} (reference ${ref}). I would like to continue my reservation.`,
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
    shortNotice: 'هذا الموعد بعد أقل من 3 ساعات. أتواصل معكم لمتابعة حجزي.',
    continueAsk: (when, ref) => `مرحباً، حجزت موعداً يوم ${when} (رقم الحجز ${ref}). أودّ متابعة حجزي.`,
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

BOOKING_MESSAGE.fr = {
  received: 'Votre réservation a bien été reçue par le salon Rafi Daham Hair Beauty.',
  shortNotice: 'Ce rendez-vous a lieu dans moins de 3 heures. Je vous contacte pour poursuivre ma réservation.',
  continueAsk: (when, ref) =>
    `Bonjour, j’ai réservé un rendez-vous le ${when} (référence ${ref}). Je souhaite poursuivre ma réservation.`,
  details: 'Détails de la réservation :',
  reference: 'Référence',
  name: 'Nom',
  phone: 'Téléphone',
  email: 'E-mail',
  location: 'Lieu',
  staff: 'Préférence',
  staffs: { hijab: 'Hijab', rafi: 'Rafi', regular: 'Général' },
  serviceType: 'Type de service',
  serviceTypes: { salon: 'Au salon', home: 'À domicile' },
  date: 'Date',
  time: 'Heure',
  duration: 'Durée',
  services: 'Services',
  subtotal: 'Sous-total',
  homeFee: 'Service à domicile (×2)',
  tax: 'Taxe',
  total: 'Total',
  deposit: 'Acompte de confirmation (25 %)',
  notes: 'Remarques',
  mins: 'min',
  welcome: 'Nous avons hâte de vous accueillir et de vous offrir une expérience exceptionnelle.',
  thanks: 'Merci d’avoir choisi Rafi Daham.',
  noteTitle: '🌟 NOTE IMPORTANTE SUR LES PRIX ET SERVICES',
  noteLines: [
    'TOUS LES PRIX CI-DESSUS S’APPLIQUENT AUX SERVICES RÉALISÉS DANS NOTRE SALON DE LUXE.',
    'LES SERVICES RÉALISÉS HORS DU SALON AU LIBAN SONT MAJORÉS DE 100 %.',
    'LES SERVICES RÉALISÉS HORS DU LIBAN SONT MAJORÉS DE 300 %.',
  ],
};
BOOKING_MESSAGE.en.staff = 'Preference';
BOOKING_MESSAGE.en.staffs = { hijab: 'Hijab', rafi: 'Rafi', regular: 'General' };
BOOKING_MESSAGE.ar.staff = 'التفضيل';
BOOKING_MESSAGE.ar.staffs = { hijab: 'محجبة', rafi: 'رافي', regular: 'عام' };

export const bookingText = (lang) => BOOKING_MESSAGE[lang] || BOOKING_MESSAGE.en;

const LOCALES = { en: 'en-GB', ar: 'ar-EG', fr: 'fr-FR' };
export const localeOf = (lang) => LOCALES[lang] || LOCALES.en;

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

/** "YYYY-MM-DD" → "Friday, 26 September 2026" (or the Arabic equivalent). */
export const longDate = (isoDate, lang = 'en') => {
  try {
    const [y, m, d] = String(isoDate).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(
      localeOf(lang),
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
    );
  } catch {
    return isoDate;
  }
};

/**
 * wa.me link a client follows to continue a short-notice reservation, with a
 * short message naming the booking.
 */
export const continueLink = (booking, lang = 'en', number = SALON_WHATSAPP) => {
  const when = `${longDate(booking.date, lang)}, ${booking.hour}`;
  const text = bookingText(lang).continueAsk(when, booking.reference || '');
  return `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
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

/**
 * Deposit asked to confirm the booking: bookings outside Lebanon only (0 for
 * the rest, older Lebanese bookings included, whatever amount they stored).
 */
export const bookingDeposit = (booking) =>
  isLebanon(booking.country) ? 0 : Number(booking.deposit ?? Number(booking.total) * DEPOSIT_RATE) || 0;

/** The note on prices goes with bookings outside Lebanon only. */
export const showsPriceNote = (booking) => !isLebanon(booking.country);

/** The full plain-text message, as sent on WhatsApp. */
export function buildBookingText(booking, lang = 'en') {
  const t = bookingText(lang);
  const items = booking.cart || [];
  const minutes = cartDuration(items);
  const serviceType = t.serviceTypes[booking.serviceType];
  const deposit = bookingDeposit(booking);

  const services = items.map((i) => {
    const qty = Number(i.qty) || 1;
    const dur = i.duration ? ` (${i.duration} ${t.mins})` : '';
    return `• ${i.title}${qty > 1 ? ` x${qty}` : ''} — ${money(Number(i.price) * qty)}${dur}`;
  });

  return [
    ...(booking.shortNotice ? [`*${t.shortNotice}*`, ''] : []),
    t.received,
    '',
    `*${t.details}*`,
    booking.reference ? `${t.reference}: ${booking.reference}` : null,
    `${t.name}: ${booking.name}`,
    `${t.phone}: ${booking.phone}`,
    `${t.email}: ${booking.email}`,
    `${t.location}: ${booking.city}, ${booking.country}`,
    t.staffs[booking.staff] ? `${t.staff}: ${t.staffs[booking.staff]}` : null,
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
    deposit ? `${t.deposit}: ${money(deposit)}` : null,
    booking.notes ? `${t.notes}: ${booking.notes}` : null,
    '',
    t.welcome,
    '',
    t.thanks,
    ...(showsPriceNote(booking) ? ['', `*${t.noteTitle}*`, ...t.noteLines] : []),
  ]
    .filter((line) => line !== null)
    .join('\n');
}
