/**
 * What the website's bell says, in the site's three languages. The documents
 * only hold a type and its details (see notifications.js), so a client who
 * switches language reads them in the new one.
 *
 * Plain data + pure helpers only — safe to import from client and server.
 */
import { COUNTRIES } from './bookingOptions.js';
import { continueLink, localeOf } from './bookingMessage.js';

export const BELL_TEXT = {
  en: {
    title: 'Notifications',
    close: 'Close',
    empty: 'No notifications yet',
    emptyText: 'Updates about your appointments and orders will appear here.',
    more: 'Show more',
    bell: (n) => (n ? `Notifications, ${n} unread` : 'Notifications'),
    dismiss: 'Dismiss',
    continueWhatsApp: 'Continue on WhatsApp',
    myAppointments: 'My appointments',
    myOrders: 'My orders',
  },
  ar: {
    title: 'الإشعارات',
    close: 'إغلاق',
    empty: 'لا توجد إشعارات بعد',
    emptyText: 'ستظهر هنا التحديثات الخاصة بمواعيدك وطلباتك.',
    more: 'عرض المزيد',
    bell: (n) => (n ? `الإشعارات، ${n} غير مقروءة` : 'الإشعارات'),
    dismiss: 'إخفاء',
    continueWhatsApp: 'متابعة عبر واتساب',
    myAppointments: 'مواعيدي',
    myOrders: 'طلباتي',
  },
  fr: {
    title: 'Notifications',
    close: 'Fermer',
    empty: 'Aucune notification pour le moment',
    emptyText: 'Les nouvelles de vos rendez-vous et commandes apparaîtront ici.',
    more: 'Voir plus',
    bell: (n) => (n ? `Notifications, ${n} non lues` : 'Notifications'),
    dismiss: 'Masquer',
    continueWhatsApp: 'Continuer sur WhatsApp',
    myAppointments: 'Mes rendez-vous',
    myOrders: 'Mes commandes',
  },
};

/** A type this version of the site doesn't know. */
const UNKNOWN_TYPE = {
  en: ['Update', ''],
  ar: ['تحديث', ''],
  fr: ['Mise à jour', ''],
};

/**
 * [title, body] of each type; `type/actor` wins over `type`. In the bodies,
 * `w` is the date and time, `c` the city, `r` the booking reference, `p` the
 * rest of the notification's details.
 */
const MESSAGES = {
  en: {
    'booking.created': ['Appointment booked', ({ w, c, r }) => `Your appointment on ${w} in ${c} is booked. Reference ${r}.`],
    'booking.created/admin': ['Appointment booked for you', ({ w, c, r }) => `The salon booked an appointment for you on ${w} in ${c}. Reference ${r}.`],
    'booking.short_notice': ['Please contact us on WhatsApp', ({ w, r }) => `Your reservation for ${w} is saved. It is less than 3 hours away, so please contact us on WhatsApp to continue your reservation. Reference ${r}.`],
    'booking.cancelled': ['Appointment cancelled', ({ w }) => `Your appointment on ${w} has been cancelled, as you asked.`],
    'booking.cancelled/admin': ['Appointment cancelled by the salon', ({ w }) => `The salon cancelled your appointment on ${w}. Please contact us if you have any questions.`],
    'booking.moved': ['Appointment moved', ({ w, c }) => `Your appointment is now on ${w} in ${c}.`],
    'booking.confirmed': ['Appointment confirmed', ({ w }) => `The salon confirmed your appointment on ${w}. See you soon!`],
    'booking.updated': ['Appointment updated', ({ w }) => `The salon updated your appointment on ${w}.`],
    'booking.completed': ['Thank you for your visit', ({ w }) => `Your appointment on ${w} is complete. We hope to see you again soon.`],
    'booking.paid': ['Payment received', ({ w }) => `We received your payment for the appointment on ${w}. Thank you!`],
    'order.created': ['Order received', ({ p }) => `We received your order #${p.oid}. Total $${p.total}.`],
    'order.paid': ['Payment received', ({ p }) => `We received your payment for order #${p.oid}. Thank you!`],
    'order.fulfilled': ['Order fulfilled', ({ p }) => `Your order #${p.oid} has been fulfilled.`],
    'order.cancelled': ['Order cancelled', ({ p }) => `Your order #${p.oid} has been cancelled. Please contact us if you have any questions.`],
  },
  ar: {
    'booking.created': ['تم حجز موعدك', ({ w, c, r }) => `تم حجز موعدك يوم ${w} في ${c}. رقم الحجز ${r}.`],
    'booking.created/admin': ['حجز لك الصالون موعداً', ({ w, c, r }) => `حجز لك الصالون موعداً يوم ${w} في ${c}. رقم الحجز ${r}.`],
    'booking.short_notice': ['يرجى التواصل معنا عبر واتساب', ({ w, r }) => `تم حفظ حجزك ليوم ${w}. الموعد بعد أقل من 3 ساعات، لذا يرجى التواصل معنا عبر واتساب لمتابعة الحجز. رقم الحجز ${r}.`],
    'booking.cancelled': ['تم إلغاء موعدك', ({ w }) => `تم إلغاء موعدك يوم ${w} بناءً على طلبك.`],
    'booking.cancelled/admin': ['ألغى الصالون موعدك', ({ w }) => `ألغى الصالون موعدك يوم ${w}. يرجى التواصل معنا لأي استفسار.`],
    'booking.moved': ['تم تغيير موعدك', ({ w, c }) => `أصبح موعدك يوم ${w} في ${c}.`],
    'booking.confirmed': ['تم تأكيد موعدك', ({ w }) => `أكّد الصالون موعدك يوم ${w}. نراك قريباً!`],
    'booking.updated': ['تم تعديل موعدك', ({ w }) => `عدّل الصالون موعدك يوم ${w}.`],
    'booking.completed': ['شكراً لزيارتك', ({ w }) => `اكتمل موعدك يوم ${w}. نأمل أن نراك قريباً.`],
    'booking.paid': ['تم استلام الدفعة', ({ w }) => `استلمنا دفعتك لموعد يوم ${w}. شكراً لك!`],
    'order.created': ['تم استلام طلبك', ({ p }) => `استلمنا طلبك رقم ${p.oid}. الإجمالي $${p.total}.`],
    'order.paid': ['تم استلام الدفعة', ({ p }) => `استلمنا دفعتك للطلب رقم ${p.oid}. شكراً لك!`],
    'order.fulfilled': ['تم تجهيز طلبك', ({ p }) => `تم تجهيز طلبك رقم ${p.oid}.`],
    'order.cancelled': ['تم إلغاء طلبك', ({ p }) => `تم إلغاء طلبك رقم ${p.oid}. يرجى التواصل معنا لأي استفسار.`],
  },
  fr: {
    'booking.created': ['Rendez-vous réservé', ({ w, c, r }) => `Votre rendez-vous du ${w} à ${c} est réservé. Référence ${r}.`],
    'booking.created/admin': ['Rendez-vous réservé pour vous', ({ w, c, r }) => `Le salon a réservé un rendez-vous pour vous le ${w} à ${c}. Référence ${r}.`],
    'booking.short_notice': ['Merci de nous contacter sur WhatsApp', ({ w, r }) => `Votre réservation du ${w} est enregistrée. Elle a lieu dans moins de 3 heures : merci de nous contacter sur WhatsApp pour la poursuivre. Référence ${r}.`],
    'booking.cancelled': ['Rendez-vous annulé', ({ w }) => `Votre rendez-vous du ${w} a été annulé, comme demandé.`],
    'booking.cancelled/admin': ['Rendez-vous annulé par le salon', ({ w }) => `Le salon a annulé votre rendez-vous du ${w}. Contactez-nous pour toute question.`],
    'booking.moved': ['Rendez-vous déplacé', ({ w, c }) => `Votre rendez-vous est maintenant le ${w} à ${c}.`],
    'booking.confirmed': ['Rendez-vous confirmé', ({ w }) => `Le salon a confirmé votre rendez-vous du ${w}. À bientôt !`],
    'booking.updated': ['Rendez-vous mis à jour', ({ w }) => `Le salon a mis à jour votre rendez-vous du ${w}.`],
    'booking.completed': ['Merci de votre visite', ({ w }) => `Votre rendez-vous du ${w} est terminé. Au plaisir de vous revoir.`],
    'booking.paid': ['Paiement reçu', ({ w }) => `Nous avons bien reçu votre paiement pour le rendez-vous du ${w}. Merci !`],
    'order.created': ['Commande reçue', ({ p }) => `Nous avons bien reçu votre commande n° ${p.oid}. Total : ${p.total} $.`],
    'order.paid': ['Paiement reçu', ({ p }) => `Nous avons bien reçu votre paiement pour la commande n° ${p.oid}. Merci !`],
    'order.fulfilled': ['Commande traitée', ({ p }) => `Votre commande n° ${p.oid} a été traitée.`],
    'order.cancelled': ['Commande annulée', ({ p }) => `Votre commande n° ${p.oid} a été annulée. Contactez-nous pour toute question.`],
  },
};

const AT = { en: 'at', ar: 'الساعة', fr: 'à' };

/** "Fri 6 Nov at 15:00" */
const whenText = (date, hour, lang) => {
  const [y, m, d] = String(date || '').split('-').map(Number);
  if (!y || !m || !d) return hour || '';
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(localeOf(lang), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  return `${day} ${AT[lang] || AT.en} ${hour}`;
};

/** A city in the client's language (cities are stored by their English names). */
const cityName = (city, lang) =>
  (lang === 'ar' && COUNTRIES.flatMap((c) => c.cities).find(([en]) => en === city)?.[1]) || city || '';

/** The icon of each type (drawn in NotificationBell.jsx); 'calendar' for the rest. */
const ICONS = {
  'booking.short_notice': 'clock',
  'booking.cancelled': 'cancel',
  'order.cancelled': 'cancel',
  'booking.confirmed': 'check',
  'booking.completed': 'check',
  'order.fulfilled': 'check',
  'booking.paid': 'card',
  'order.paid': 'card',
  'order.created': 'bag',
};

/**
 * What the bell shows for a notification:
 * { title, body, icon, urgent, whatsapp, href, hrefLabel }.
 */
export function notificationText(n, lang = 'en') {
  const language = MESSAGES[lang] ? lang : 'en';
  const words = BELL_TEXT[language];
  const p = n.params || {};
  const message = MESSAGES[language][`${n.type}/${n.actor}`] || MESSAGES[language][n.type];
  const [title, body] = message || UNKNOWN_TYPE[language];
  const isOrder = String(n.type).startsWith('order.');

  return {
    title,
    body:
      typeof body === 'function'
        ? body({ w: whenText(p.date, p.hour, language), c: cityName(p.city, language), r: p.reference || '', p })
        : body,
    icon: ICONS[n.type] || 'calendar',
    urgent: n.type === 'booking.short_notice',
    whatsapp: n.type === 'booking.short_notice' ? continueLink(p, language) : null,
    href: isOrder ? '/account?tab=orders' : '/account?tab=appointments',
    hrefLabel: isOrder ? words.myOrders : words.myAppointments,
  };
}

/** "5 minutes ago", then the date once it is over a week old. */
export function timeAgo(createdAt, lang = 'en', now = Date.now()) {
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  const rtf = new Intl.RelativeTimeFormat(localeOf(lang), { numeric: 'auto' });
  if (seconds < 60) return rtf.format(0, 'second');
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute');
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
  if (seconds < 7 * 86400) return rtf.format(-Math.floor(seconds / 86400), 'day');
  return new Date(then).toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'short', year: 'numeric' });
}
