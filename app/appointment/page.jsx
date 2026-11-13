'use client';

/**
 * Fresha-style booking flow for Rafi Daham Hair Repair Studio.
 *
 *  Step 1 — Team       (Hijab, Rafi or no preference — saved as the booking's
 *                       staff). Hijab isn't booked online: picking it shows
 *                       HijabNotice and the client continues on WhatsApp.
 *  Step 2 — Details    (contact form, country / city, calendar, time slots)
 *  Step 3 — Services   (categories + service list, salon or home, confirm)
 *
 * Tax is only added once a city outside Beirut is chosen (lib/bookingPrice.js).
 * Outside Lebanon prices are × the multiplier set in the dashboard (/api/tax).
 *
 * Lebanon, KSA and Kuwait can be booked every day, 08:00 to midnight; a time
 * is free until somebody takes it (lib/bookingOptions.js). From the dashboard
 * a country can get its own calendar of dates, or be locked: the page then
 * says it isn't available right now and gives the salon's phone / WhatsApp.
 * The next 30 minutes can't be booked (/api/booking refuses them). A time less
 * than 3 hours away can: the reservation is saved, those times are marked
 * (SoonNotice) and the client is asked to continue on WhatsApp.
 * The country and city fields have a search box (SearchSelect.jsx).
 *
 * On confirm: the booking is stored in MongoDB, a confirmation email is sent
 * with Resend (plus reminder emails 2 & 1 day before via /api/booking/reminders)
 * and WhatsApp opens by itself with the booking written out for the salon
 * (see openWhatsAppTab / handleConfirm for how pop-up blockers are avoided).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import './appointment.css';
import './appointment-steps.css';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { bookingText, buildBookingText, localeOf, priceLines } from '../lib/bookingMessage';
import {
  DEFAULT_OUTSIDE_FACTOR,
  SERVICE_TYPES,
  bookingTotals,
  homeFactor,
  locationFactor,
  priceAt,
} from '../lib/bookingPrice';
import {
  DEFAULT_SETTINGS,
  bookingClock,
  citiesOf,
  countryOf,
  hoursFor,
  normalizeSettings,
  slotKey,
  startsBy,
  timeZoneOf,
} from '../lib/bookingOptions';
import { worldCountryOptions } from '../lib/worldCountries';
import SearchSelect from './SearchSelect';

/* --------------------------------------------------------------------- i18n */

const STRINGS = {
  en: {
    dir: 'ltr',
    brand: 'Rafi Daham Hair Repair Studio',
    address: 'Beirut, Jabal Lubnan, Lebanon',
    steps: ['Team', 'Details', 'Services'],
    selectStaff: 'Choose your preference',
    staffSub: 'Who would you like to take care of you?',
    staffs: {
      hijab: ['Hijab', 'A hijab-wearing team member will take care of you'],
      rafi: ['Rafi', 'Rafi Daham will take care of you personally'],
      regular: ['General', 'Any available team member'],
    },
    errStaff: 'Please choose an option',
    viaWhatsApp: 'Book on WhatsApp',
    hijabTitle: 'Hijab bookings continue on WhatsApp',
    hijabText:
      'To book with a hijab-wearing team member, please contact us on WhatsApp and we will continue your booking with you.',
    hijabWaAsk: 'Hello, I would like to book an appointment with a hijab-wearing team member.',
    selectDetails: 'Your details',
    selectServices: 'Select services',
    selectTime: 'Select time',
    review: 'Review and confirm',
    stepOf: (s, n, l) => `Step ${s} of ${n} — ${l}`,
    all: 'Featured',
    book: 'Book',
    added: 'Added',
    mins: 'mins',
    from: 'from',
    country: 'Appointment country',
    city: 'City',
    chooseCountry: 'Choose the appointment country',
    clientCountry: 'Your country (where you are from)',
    chooseClientCountry: 'Choose your country',
    chooseCity: 'Choose a city',
    searchCountry: 'Search countries',
    searchCity: 'Search cities',
    noMatches: 'No results',
    close: 'Close',
    unavailable: 'Not available',
    lockedTitle: 'Not available right now',
    lockedText: (c) =>
      `Online booking in ${c} is paused for now. Please contact us and we will gladly help you book.`,
    noDatesTitle: 'No dates open yet',
    noDatesText: (c) =>
      `There are no open dates in ${c} at the moment. Contact us and we will let you know the next dates.`,
    contactUs: 'Contact us:',
    callUs: 'Call',
    whatsapp: 'WhatsApp',
    waAsk: (c) => `Hello, I would like to book an appointment in ${c}.`,
    soonTitle: 'Times less than 3 hours away',
    soonText: 'Times marked with a dot are less than 3 hours away. You can book them and your reservation will be saved, then please contact us on WhatsApp to continue your reservation.',
    soonWaNote: 'Your time is less than 3 hours away. After you confirm, your reservation is saved and WhatsApp opens: please send the message to continue your reservation.',
    doneSoonTitle: 'Reservation saved',
    doneSoonText: 'Your time is less than 3 hours away, so please contact us on WhatsApp to continue your reservation.',
    continueWhatsApp: 'Continue on WhatsApp',
    errUnavailable: 'Online booking is not available in this country right now. Please contact us.',
    noSlots: 'No free times on this day — please choose another date.',
    serviceTypeTitle: 'Salon or home service?',
    serviceTypeHints: { salon: 'Visit us at the salon', home: 'We come to your place' },
    samePrice: 'Standard price',
    doublePrice: '×2 price',
    yourDetails: 'Your details',
    name: 'Full name',
    phone: 'Phone number',
    email: 'Email address',
    notes: 'Notes (optional)',
    notesPh: 'Anything we should know before your visit?',
    emailNote: 'We will email your confirmation and a reminder before your visit.',
    continue: 'Continue',
    confirmBook: 'Confirm booking',
    sending: 'Booking…',
    emptyCart: 'No services selected',
    total: 'Total',
    free: 'free',
    deposit: (amount) => `A 25% deposit (${amount}) is required to confirm the appointment.`,
    outside: 'Out-of-Lebanon bookings are priced at the travelling rate.',
    serviceCount: (n) => `${n} service${n === 1 ? '' : 's'}`,
    errRequired: 'This field is required',
    errEmail: 'Please enter a valid email address',
    errPhone: 'Please enter a valid phone number',
    errCart: 'Please select at least one service',
    errServiceType: 'Please choose salon or home service',
    errTime: 'Please choose the place, date and time',
    errTaken: 'Sorry, this time has just been booked by someone else. Please choose another time.',
    errTooSoon: 'This time is now less than 30 minutes away, so it can’t be booked online. Please choose a later time or contact us on WhatsApp.',
    errNetwork: 'Connection problem. Please try again.',
    errGeneric: 'Something went wrong. Please try again.',
    waNote: 'After you confirm, WhatsApp opens with your booking written out. Just press Send.',
    waOpening: 'Opening WhatsApp…',
    doneTitle: 'Appointment booked!',
    doneText: 'Thank you for booking with us.',
    doneEmailed: 'Your confirmation is on its way to your email.',
    ref: 'Reference',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    newBooking: 'Book another appointment',
    reminderNote: 'You will get a reminder email 2 days, 1 day and 1 hour before.',
    openWhatsApp: 'Open WhatsApp again',
    waHint:
      'Didn’t press Send in WhatsApp? Tap the button above: our team receives your booking from that message.',
    manageBefore: 'Plans changed? You can cancel it from ',
    manageLink: 'My account',
    manageAfter: (email) => `, signed in with ${email}.`,
  },
  ar: {
    dir: 'rtl',
    brand: 'صالون رافي دهام',
    address: 'بيروت، جبل لبنان',
    steps: ['الفريق', 'المعلومات', 'الخدمات'],
    selectStaff: 'اختاري تفضيلك',
    staffSub: 'من تفضّلين أن تهتمّ بك؟',
    staffs: {
      hijab: ['محجبة', 'ستهتمّ بك موظفة محجبة'],
      rafi: ['رافي', 'سيهتمّ بك رافي دهام شخصياً'],
      regular: ['عام', 'أي عضو متاح من الفريق'],
    },
    errStaff: 'يرجى اختيار أحد الخيارات',
    viaWhatsApp: 'الحجز عبر واتساب',
    hijabTitle: 'الحجز مع موظفة محجبة يتمّ عبر واتساب',
    hijabText: 'لحجز موعد مع موظفة محجبة، يرجى التواصل معنا عبر واتساب لنتابع حجزك معك.',
    hijabWaAsk: 'مرحباً، أودّ حجز موعد مع موظفة محجبة.',
    selectDetails: 'معلوماتك',
    selectServices: 'اختر الخدمات',
    stepOf: (s, n, l) => `الخطوة ${s} من ${n} — ${l}`,
    selectTime: 'اختر الوقت',
    review: 'مراجعة وتأكيد',
    all: 'الأبرز',
    book: 'احجز',
    added: 'تمت الإضافة',
    mins: 'دقيقة',
    from: 'من',
    country: 'دولة الموعد',
    city: 'المدينة',
    chooseCountry: 'اختر دولة الموعد',
    clientCountry: 'بلدك (من أين أنت)',
    chooseClientCountry: 'اختر بلدك',
    chooseCity: 'اختر المدينة',
    searchCountry: 'ابحث عن دولة',
    searchCity: 'ابحث عن مدينة',
    noMatches: 'لا توجد نتائج',
    close: 'إغلاق',
    unavailable: 'غير متاح',
    lockedTitle: 'غير متاح حالياً',
    lockedText: (c) =>
      `الحجز عبر الموقع في ${c} متوقف حالياً. يرجى التواصل معنا وسنساعدك بكل سرور في حجز موعدك.`,
    noDatesTitle: 'لا توجد مواعيد متاحة حالياً',
    noDatesText: (c) => `لا توجد تواريخ متاحة في ${c} في الوقت الحالي. تواصل معنا وسنخبرك بالمواعيد القادمة.`,
    contactUs: 'تواصل معنا:',
    callUs: 'اتصال',
    whatsapp: 'واتساب',
    waAsk: (c) => `مرحباً، أودّ حجز موعد في ${c}.`,
    soonTitle: 'أوقات تبدأ بعد أقل من 3 ساعات',
    soonText: 'الأوقات المميّزة بنقطة تبدأ بعد أقل من 3 ساعات. يمكنك حجزها وسيُحفظ حجزك، ثم يرجى التواصل معنا عبر واتساب لمتابعة الحجز.',
    soonWaNote: 'موعدك بعد أقل من 3 ساعات. بعد التأكيد يُحفظ حجزك ويُفتح واتساب: يرجى إرسال الرسالة لمتابعة الحجز.',
    doneSoonTitle: 'تم حفظ حجزك',
    doneSoonText: 'موعدك بعد أقل من 3 ساعات، لذا يرجى التواصل معنا عبر واتساب لمتابعة الحجز.',
    continueWhatsApp: 'متابعة عبر واتساب',
    errUnavailable: 'الحجز عبر الموقع غير متاح في هذه الدولة حالياً. يرجى التواصل معنا.',
    noSlots: 'لا توجد أوقات متاحة في هذا اليوم — يرجى اختيار تاريخ آخر.',
    serviceTypeTitle: 'في الصالون أم في المنزل؟',
    serviceTypeHints: { salon: 'زيارتنا في الصالون', home: 'نأتي إلى منزلك' },
    samePrice: 'السعر العادي',
    doublePrice: 'ضعف السعر',
    yourDetails: 'معلوماتك',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    notes: 'ملاحظات (اختياري)',
    notesPh: 'هل من شيء يجب أن نعرفه قبل زيارتك؟',
    emailNote: 'سنرسل لك التأكيد وتذكيراً قبل موعدك عبر البريد الإلكتروني.',
    continue: 'متابعة',
    confirmBook: 'تأكيد الحجز',
    sending: 'جارٍ الحجز…',
    emptyCart: 'لم يتم اختيار أي خدمة',
    total: 'الإجمالي',
    free: 'مجاني',
    deposit: (amount) => `يلزم دفع 25% كعربون (${amount}) لتأكيد الموعد.`,
    outside: 'الحجوزات خارج لبنان تُحتسب بسعر التنقّل.',
    serviceCount: (n) => `${n} خدمة`,
    errRequired: 'هذا الحقل مطلوب',
    errEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    errPhone: 'يرجى إدخال رقم هاتف صحيح',
    errCart: 'يرجى اختيار خدمة واحدة على الأقل',
    errServiceType: 'يرجى اختيار الخدمة في الصالون أو في المنزل',
    errTime: 'يرجى اختيار المكان والتاريخ والوقت',
    errTaken: 'عذراً، تمّ حجز هذا الوقت للتوّ. يرجى اختيار وقت آخر.',
    errTooSoon: 'أصبح هذا الوقت بعد أقل من 30 دقيقة، فلا يمكن حجزه عبر الموقع. يرجى اختيار وقت لاحق أو التواصل معنا عبر واتساب.',
    errNetwork: 'مشكلة في الاتصال. يرجى المحاولة مجدداً.',
    errGeneric: 'حدث خطأ ما. يرجى المحاولة مجدداً.',
    waNote: 'بعد التأكيد يُفتح واتساب وحجزك مكتوب مسبقاً، فقط اضغط «إرسال».',
    waOpening: 'جارٍ فتح واتساب…',
    doneTitle: 'تمّ حجز موعدك!',
    doneText: 'شكراً لحجزك معنا.',
    doneEmailed: 'رسالة التأكيد في طريقها إلى بريدك الإلكتروني.',
    ref: 'رقم الحجز',
    date: 'التاريخ',
    time: 'الوقت',
    location: 'الموقع',
    newBooking: 'حجز موعد آخر',
    reminderNote: 'ستصلك رسالة تذكير قبل يومين وقبل يوم وقبل ساعة من الموعد.',
    openWhatsApp: 'فتح واتساب مجدداً',
    waHint:
      'لم تضغط «إرسال» في واتساب؟ اضغط على الزر أعلاه، فبهذه الرسالة يصل حجزك إلى فريقنا.',
    manageBefore: 'هل تغيّرت خططك؟ يمكنك إلغاء الموعد من ',
    manageLink: 'حسابي',
    manageAfter: (email) => ` بعد تسجيل الدخول بالبريد ${email}.`,
  },
  fr: {
    dir: 'ltr',
    brand: 'Rafi Daham Hair Repair Studio',
    address: 'Beyrouth, Mont-Liban, Liban',
    steps: ['Équipe', 'Coordonnées', 'Services'],
    selectStaff: 'Choisissez votre préférence',
    staffSub: 'Qui souhaitez-vous pour s’occuper de vous ?',
    staffs: {
      hijab: ['Hijab', 'Une membre de l’équipe portant le hijab s’occupera de vous'],
      rafi: ['Rafi', 'Rafi Daham s’occupera de vous personnellement'],
      regular: ['Général', 'Tout membre disponible de l’équipe'],
    },
    errStaff: 'Veuillez choisir une option',
    viaWhatsApp: 'Réserver sur WhatsApp',
    hijabTitle: 'Réservation hijab sur WhatsApp',
    hijabText:
      'Pour réserver avec une membre de l’équipe portant le hijab, contactez-nous sur WhatsApp et nous poursuivrons votre réservation avec vous.',
    hijabWaAsk: 'Bonjour, je souhaite prendre rendez-vous avec une membre de l’équipe portant le hijab.',
    selectDetails: 'Vos coordonnées',
    selectServices: 'Choisissez vos services',
    selectTime: 'Choisissez l’heure',
    review: 'Vérifier et confirmer',
    stepOf: (s, n, l) => `Étape ${s} sur ${n} — ${l}`,
    all: 'À la une',
    book: 'Réserver',
    added: 'Ajouté',
    mins: 'min',
    from: 'à partir de',
    country: 'Pays du rendez-vous',
    city: 'Ville',
    chooseCountry: 'Choisissez le pays du rendez-vous',
    clientCountry: 'Votre pays (d’où vous venez)',
    chooseClientCountry: 'Choisissez votre pays',
    chooseCity: 'Choisissez une ville',
    searchCountry: 'Rechercher un pays',
    searchCity: 'Rechercher une ville',
    noMatches: 'Aucun résultat',
    close: 'Fermer',
    unavailable: 'Indisponible',
    lockedTitle: 'Indisponible pour le moment',
    lockedText: (c) =>
      `La réservation en ligne pour ${c} est suspendue pour le moment. Contactez-nous : nous vous aiderons volontiers à réserver.`,
    noDatesTitle: 'Aucune date ouverte pour le moment',
    noDatesText: (c) =>
      `Aucune date n’est ouverte pour ${c} actuellement. Contactez-nous et nous vous indiquerons les prochaines dates.`,
    contactUs: 'Contactez-nous :',
    callUs: 'Appeler',
    whatsapp: 'WhatsApp',
    waAsk: (c) => `Bonjour, je souhaite prendre rendez-vous (${c}).`,
    soonTitle: 'Créneaux à moins de 3 heures',
    soonText: 'Les créneaux marqués d’un point commencent dans moins de 3 heures. Vous pouvez les réserver et votre réservation sera enregistrée ; merci ensuite de nous contacter sur WhatsApp pour la poursuivre.',
    soonWaNote: 'Votre créneau est à moins de 3 heures. Après confirmation, votre réservation est enregistrée et WhatsApp s’ouvre : envoyez le message pour poursuivre votre réservation.',
    doneSoonTitle: 'Réservation enregistrée',
    doneSoonText: 'Votre créneau est à moins de 3 heures : merci de nous contacter sur WhatsApp pour poursuivre votre réservation.',
    continueWhatsApp: 'Continuer sur WhatsApp',
    errUnavailable: 'La réservation en ligne n’est pas disponible dans ce pays pour le moment. Veuillez nous contacter.',
    noSlots: 'Aucun créneau libre ce jour-là — veuillez choisir une autre date.',
    serviceTypeTitle: 'Au salon ou à domicile ?',
    serviceTypeHints: { salon: 'Venez nous voir au salon', home: 'Nous venons chez vous' },
    samePrice: 'Prix standard',
    doublePrice: 'Prix ×2',
    yourDetails: 'Vos coordonnées',
    name: 'Nom complet',
    phone: 'Numéro de téléphone',
    email: 'Adresse e-mail',
    notes: 'Remarques (facultatif)',
    notesPh: 'Quelque chose à savoir avant votre visite ?',
    emailNote: 'Nous vous enverrons la confirmation et un rappel par e-mail.',
    continue: 'Continuer',
    confirmBook: 'Confirmer la réservation',
    sending: 'Réservation…',
    emptyCart: 'Aucun service sélectionné',
    total: 'Total',
    free: 'gratuit',
    deposit: (amount) => `Un acompte de 25 % (${amount}) est requis pour confirmer le rendez-vous.`,
    outside: 'Les réservations hors du Liban sont au tarif déplacement.',
    serviceCount: (n) => `${n} service${n === 1 ? '' : 's'}`,
    errRequired: 'Ce champ est obligatoire',
    errEmail: 'Veuillez saisir une adresse e-mail valide',
    errPhone: 'Veuillez saisir un numéro valide',
    errCart: 'Veuillez choisir au moins un service',
    errServiceType: 'Veuillez choisir salon ou domicile',
    errTime: 'Veuillez choisir le lieu, la date et l’heure',
    errTaken: 'Désolé, ce créneau vient d’être réservé par quelqu’un d’autre. Veuillez en choisir un autre.',
    errTooSoon: 'Ce créneau est maintenant à moins de 30 minutes et ne peut plus être réservé en ligne. Veuillez choisir une heure plus tardive ou nous contacter sur WhatsApp.',
    errNetwork: 'Problème de connexion. Veuillez réessayer.',
    errGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    waNote: 'Après confirmation, WhatsApp s’ouvre avec votre réservation déjà rédigée : appuyez simplement sur Envoyer.',
    waOpening: 'Ouverture de WhatsApp…',
    doneTitle: 'Rendez-vous réservé !',
    doneText: 'Merci d’avoir réservé chez nous.',
    doneEmailed: 'Votre confirmation est en route vers votre boîte e-mail.',
    ref: 'Référence',
    date: 'Date',
    time: 'Heure',
    location: 'Lieu',
    newBooking: 'Prendre un autre rendez-vous',
    reminderNote: 'Vous recevrez un rappel par e-mail 2 jours, 1 jour et 1 heure avant.',
    openWhatsApp: 'Rouvrir WhatsApp',
    waHint:
      'Vous n’avez pas appuyé sur Envoyer dans WhatsApp ? Touchez le bouton ci-dessus : notre équipe reçoit votre réservation par ce message.',
    manageBefore: 'Un changement ? Vous pouvez l’annuler depuis ',
    manageLink: 'Mon compte',
    manageAfter: (email) => `, connecté avec ${email}.`,
  },
};

/**
 * The appointment countries managed from the dashboard, named in the page's
 * language (both names can be searched).
 */
const countryOptions = (lang, countries) =>
  countries.map(({ name, ar }) => ({ value: name, label: lang === 'ar' && ar ? ar : name, keywords: ar }));

/** A country's cities: the capital first, then the rest in alphabetical order. */
const cityOptions = (country, lang, countries) => {
  const [capital, ...rest] = citiesOf(country, countries).map(([en, ar]) => ({
    value: en,
    label: lang === 'ar' && ar ? ar : en,
    keywords: ar,
  }));
  rest.sort((a, b) => a.label.localeCompare(b.label, lang));
  return capital ? [capital, ...rest] : [];
};

const WHATSAPP_NUMBER = '9613896074';
/** The salon's phone, shown when a country can't be booked online */
const SALON_PHONE = '+961 3 896 074';
const SALON_TEL = '+9613896074';
const LOGO = 'https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/black_bgez4v.webp';

/* ------------------------------------------------------------------ icons */

const Chevron = ({ dir = 'left' }) => (
  <svg className="fr-ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
  </svg>
);

const Plus = () => (
  <svg className="fr-ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const WhatsAppGlyph = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.55 0 .22 5.32.22 11.86c0 2.09.55 4.13 1.58 5.93L.12 24l6.36-1.67a11.85 11.85 0 0 0 5.6 1.43h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.14-3.43-8.42Zm-8.43 18.28h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.22-3.77.99 1.01-3.67-.24-.38a9.83 9.83 0 0 1-1.51-5.24c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.11 1.03 6.97 2.89a9.78 9.78 0 0 1 2.89 6.97c0 5.43-4.42 9.85-9.81 9.85Zm5.4-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
    <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
  </svg>
);

const CalendarOffIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="5.5" width="16" height="15" rx="2.2" />
    <path d="M8 3.5v4M16 3.5v4M4 10h16M10 13.8l4 4M14 13.8l-4 4" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.6 3.5h2.6l1.4 4-2 1.3a11.5 11.5 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />
  </svg>
);

/**
 * The appointment country is locked from the dashboard ('locked') or has no
 * free date ahead ('none'): the client is asked to call or WhatsApp the salon.
 */
function UnavailableNotice({ t, kind, place }) {
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.waAsk(place))}`;
  return (
    <div className="fr-notice" role="status">
      <span className="fr-notice-icon" aria-hidden="true">
        {kind === 'locked' ? <LockIcon /> : <CalendarOffIcon />}
      </span>
      <div className="fr-notice-body">
        <p className="fr-notice-title">{kind === 'locked' ? t.lockedTitle : t.noDatesTitle}</p>
        <p className="fr-notice-text">{(kind === 'locked' ? t.lockedText : t.noDatesText)(place)}</p>
        <p className="fr-notice-text">
          {t.contactUs}{' '}
          <a className="fr-notice-phone" href={`tel:${SALON_TEL}`}>
            <bdi dir="ltr">{SALON_PHONE}</bdi>
          </a>
        </p>
        <div className="fr-notice-actions">
          <a className="rd-btn rd-btn--sm rd-btn--auto" href={`tel:${SALON_TEL}`}>
            <PhoneIcon />
            {t.callUs}
          </a>
          <a
            className="rd-btn rd-btn--ghost rd-btn--sm rd-btn--auto fr-notice-wa"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph size={16} />
            {t.whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * The picked day has free times less than 3 hours away: they are marked with a
 * dot and this says what happens if the client books one.
 */
function SoonNotice({ t }) {
  return (
    <div className="fr-notice" role="status">
      <span className="fr-notice-icon" aria-hidden="true">
        <ClockIcon />
      </span>
      <div className="fr-notice-body">
        <p className="fr-notice-title">{t.soonTitle}</p>
        <p className="fr-notice-text">{t.soonText}</p>
      </div>
    </div>
  );
}

/** Team preferences booked with the salon on WhatsApp instead of online. */
const WHATSAPP_ONLY_STAFF = ['hijab'];

/** wa.me link that opens the salon's chat with the client's request written out. */
const whatsappAsk = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/**
 * Hijab was picked on step 1: that booking isn't made online, so instead of
 * moving on the client is asked to contact the salon on WhatsApp (or call).
 */
function HijabNotice({ t }) {
  return (
    <div className="fr-notice" id="fr-hijab-notice" role="status">
      <span className="fr-notice-icon fr-notice-icon--wa" aria-hidden="true">
        <WhatsAppGlyph size={20} />
      </span>
      <div className="fr-notice-body">
        <p className="fr-notice-title">{t.hijabTitle}</p>
        <p className="fr-notice-text">{t.hijabText}</p>
        <div className="fr-notice-actions">
          <a
            className="rd-btn rd-btn--sm rd-btn--auto fr-cta--wa"
            href={whatsappAsk(t.hijabWaAsk)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph size={16} />
            {t.continueWhatsApp}
          </a>
          <a className="rd-btn rd-btn--ghost rd-btn--sm rd-btn--auto" href={`tel:${SALON_TEL}`}>
            <PhoneIcon />
            {t.callUs}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ language switch */

const LANG_BUTTONS = [
  ['en', 'EN'],
  ['ar', 'عربي'],
  ['fr', 'FR'],
];

function LangSwitch({ lang, onChange }) {
  const pos = Math.max(0, LANG_BUTTONS.findIndex(([code]) => code === lang));
  return (
    // Kept LTR in every language so the sliding thumb never mirrors.
    <div className="fr-lang" dir="ltr" role="group" aria-label="Language / اللغة / Langue">
      <svg className="fr-lang-globe" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3z" />
      </svg>
      <div className={`fr-lang-track is-3 is-pos-${pos}`}>
        <span className="fr-lang-thumb" aria-hidden="true" />
        {LANG_BUTTONS.map(([code, label]) => (
          <button
            type="button"
            key={code}
            lang={code}
            className={lang === code ? 'is-on' : ''}
            aria-pressed={lang === code}
            onClick={() => onChange(code)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ staff icons */

const StaffIcon = ({ type }) =>
  type === 'hijab' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c-4 0-7 3.2-7 7.4V21h14V10.4C19 6.2 16 3 12 3z" />
      <circle cx="12" cy="10.5" r="3.2" />
      <path d="M8.5 21c.6-2.6 1.9-4 3.5-4s2.9 1.4 3.5 4" />
    </svg>
  ) : type === 'rafi' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20.5c.6-4 3.3-6.4 7-6.4s6.4 2.4 7 6.4" />
      <path d="M17.5 3.5l.7 1.4 1.5.2-1.1 1 .3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1 1.5-.2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.5-3.4 2.6-5.5 5.5-5.5s5 2.1 5.5 5.5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M15.5 14.6c2.6.1 4.4 2 4.9 5.4" />
    </svg>
  );

/* ---------------------------------------------------------------- helpers */

const fmtLocalDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

const prettyDate = (iso, lang) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(localeOf(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

/**
 * Start times nobody has taken on a day ('YYYY-MM-DD') in an appointment
 * country (its own calendar or the weekly hours), on that country's clock.
 * Past times and the next 30 minutes are gone, the rest are:
 *  - free: every time that can be booked;
 *  - soon: the free ones less than 3 hours away, which continue on WhatsApp.
 */
const timesIn = (settings, taken, country, city, iso) => {
  const open = country
    ? hoursFor(settings, iso, country).filter((h) => !taken.has(slotKey(country, city, iso, h)))
    : [];
  if (!open.length) return { free: [], soon: [] };
  const { cutoff, shortNotice } = bookingClock(timeZoneOf(country, settings.countries));
  const free = open.filter((h) => !startsBy(iso, h, cutoff));
  return { free, soon: free.filter((h) => startsBy(iso, h, shortNotice)) };
};

/** The first day with a free time in a country, from today ('' = none in the next 400 days). */
const firstOpenDay = (settings, taken, country) => {
  const d = new Date();
  for (let i = 0; i < 400; i += 1) {
    const iso = fmtLocalDate(d);
    if (timesIn(settings, taken, country, '', iso).free.length) return iso;
    d.setDate(d.getDate() + 1);
  }
  return '';
};

/* ------------------------------------------------------------- Calendar UI */

function MiniCalendar({ month, onMonthChange, value, onChange, isEnabled, lang }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startPad = first.getDay(); // 0 = Sunday
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dows =
    lang === 'ar'
      ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
      : lang === 'fr'
        ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const canGoBack =
    month.getFullYear() > today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() && month.getMonth() > today.getMonth());

  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1)
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));

  return (
    <div className="fr-cal">
      <div className="fr-cal-head">
        <div className="fr-cal-month">
          {month.toLocaleDateString(localeOf(lang), {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="fr-cal-nav">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() =>
              onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className="fr-cal-grid">
        {dows.map((d) => (
          <div key={d} className="fr-cal-dow">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`p${i}`} />;
          const iso = fmtLocalDate(date);
          const enabled = isEnabled(iso, date);
          return (
            <button
              type="button"
              key={iso}
              disabled={!enabled}
              onClick={() => onChange(iso)}
              className={`fr-cal-day ${value === iso ? 'is-on' : ''} ${
                enabled ? 'has-slots' : ''
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- WhatsApp */

/** Phones & tablets: WhatsApp is an app there, so the page itself goes to it. */
const isHandheld = () =>
  /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|Silk/i.test(navigator.userAgent) ||
  (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1); // iPadOS

/**
 * On a computer, opens the tab WhatsApp will load in, with a short "Opening
 * WhatsApp…" while the booking is saved. It has to be opened inside the
 * click: browsers block a tab opened later, once the booking has been saved
 * (that is why WhatsApp used to stay closed). Null when blocked anyway.
 */
function openWhatsAppTab(t, lang) {
  let tab = null;
  try {
    tab = window.open('', '_blank');
  } catch {
    return null;
  }
  if (!tab || tab.closed) return null;
  try {
    tab.opener = null;
    tab.document.write(
      `<!doctype html><html lang="${lang}" dir="${t.dir}"><head><meta charset="utf-8">` +
        '<meta name="viewport" content="width=device-width,initial-scale=1"><title>WhatsApp</title>' +
        '<style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:#fff;' +
        'color:#100501;font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
        '.b{display:grid;justify-items:center;gap:14px}.s{width:22px;height:22px;border-radius:50%;' +
        'border:2px solid #e6e2dd;border-top-color:#0b7d45;animation:r .8s linear infinite}' +
        '@keyframes r{to{transform:rotate(360deg)}}</style></head>' +
        `<body><div class="b"><div class="s"></div><div>${t.waOpening}</div></div></body></html>`
    );
    tab.document.close();
  } catch {
    /* the tab still works without the message */
  }
  return tab;
}

/**
 * On phones the page itself goes to WhatsApp, so the confirmation is kept
 * for the trip back (the browser may reload the page on Back).
 */
const DONE_KEY = 'rd-booking-done';
const DONE_FOR_MS = 30 * 60 * 1000;

const rememberBooking = (booking) => {
  try {
    sessionStorage.setItem(DONE_KEY, JSON.stringify({ ...booking, savedAt: Date.now() }));
  } catch {
    /* private mode: the email still confirms it */
  }
};

/** The booking just sent to WhatsApp from this tab, once (or null). */
const recallBooking = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DONE_KEY) || 'null');
    sessionStorage.removeItem(DONE_KEY);
    return saved && Date.now() - saved.savedAt < DONE_FOR_MS ? saved : null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------- Page */

export default function AppointmentPage() {
  // The site-wide language (EN default, AR, FR); this page has its own wording
  const { lang: siteLang, setLang } = useLanguage();
  const lang = STRINGS[siteLang] ? siteLang : 'en';
  const t = STRINGS[lang];
  const m = bookingText(lang);

  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [staff, setStaff] = useState(''); // 'hijab' | 'rafi' | 'regular'
  const whatsappOnly = WHATSAPP_ONLY_STAFF.includes(staff); // Hijab: continues on WhatsApp
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [taken, setTaken] = useState(() => new Set()); // slotKey()s of booked times

  const [activeCat, setActiveCat] = useState('');
  const [cart, setCart] = useState({});

  const [country, setCountry] = useState('');
  const [clientCountry, setClientCountry] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS); // days, hours & countries from the dashboard
  const [city, setCity] = useState('');
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [serviceType, setServiceType] = useState(''); // 'salon' | 'home'
  const [taxPercent, setTaxPercent] = useState(0);
  const [outsideFactor, setOutsideFactor] = useState(DEFAULT_OUTSIDE_FACTOR); // set in the dashboard

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const topRef = useRef(null);

  // Back from WhatsApp on a phone: the confirmation is shown again
  useEffect(() => {
    const booked = recallBooking();
    if (booked) setDone(booked);
  }, []);

  // Sent back to step 2 because the time was just taken or is now too soon: show why
  const timeGone = step === 2 && (errors.time === t.errTaken || errors.time === t.errTooSoon);
  useEffect(() => {
    if (timeGone)
      document.getElementById('fr-time-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [timeGone]);

  /* --------------------------------------------------------------- fetch */

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : [];
        setServices(list);
        if (list.length) setActiveCat(list[0].cat);
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));

    fetch('/api/apoint')
      .then((r) => r.json())
      .then((json) => {
        setTaken(new Set((json?.taken || []).map((b) => slotKey(b.country, b.city, b.date, b.hour))));
        if (json?.settings) setSettings(normalizeSettings(json.settings));
      })
      .catch(() => setTaken(new Set()));

    fetch('/api/tax')
      .then((r) => r.json())
      .then((json) => {
        setTaxPercent(Number(json?.percent) || 0);
        if (json?.outsideFactor) setOutsideFactor(json.outsideFactor);
      })
      .catch(() => setTaxPercent(0));
  }, []);

  // Times booked by other clients (or the salon) meanwhile disappear too
  useEffect(() => {
    const refresh = () =>
      fetch('/api/apoint', { cache: 'no-store' })
        .then((r) => r.json())
        .then((json) => {
          const next = new Set((json?.taken || []).map((b) => slotKey(b.country, b.city, b.date, b.hour)));
          setTaken(next);
          if (json?.settings) setSettings(normalizeSettings(json.settings));
        })
        .catch(() => {});
    const id = setInterval(refresh, 30000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // A time picked earlier that has just been taken is cleared
  useEffect(() => {
    if (hour && date && taken.has(slotKey(country, city, date, hour))) setHour('');
  }, [taken, hour, date, country, city]);

  /* ------------------------------------------------------------ derived */

  const categories = useMemo(() => {
    const seen = [];
    services.forEach((s) => {
      if (!seen.includes(s.cat)) seen.push(s.cat);
    });
    return seen;
  }, [services]);

  const visibleServices = useMemo(
    () => services.filter((s) => s.cat === activeCat),
    [services, activeCat]
  );

  // Each appointment country's first free day ('' when locked or nothing is open ahead)
  const firstOpen = useMemo(() => {
    const out = {};
    settings.countries.forEach((c) => {
      out[c.name] = c.locked ? '' : firstOpenDay(settings, taken, c.name);
    });
    return out;
  }, [settings, taken]);

  const countryList = useMemo(
    () =>
      countryOptions(lang, settings.countries).map((o) => ({
        ...o,
        tag: firstOpen[o.value] ? '' : t.unavailable,
      })),
    [lang, settings, firstOpen, t]
  );
  const cityList = useMemo(() => cityOptions(country, lang, settings.countries), [country, lang, settings]);
  const worldList = useMemo(() => worldCountryOptions(lang), [lang]);
  const placeChosen = !!country && !!city;

  /** '' (no country yet), 'open', 'locked' (from the dashboard) or 'none' (no free date ahead). */
  const placeState = !country
    ? ''
    : countryOf(settings, country)?.locked
      ? 'locked'
      : firstOpen[country]
        ? 'open'
        : 'none';
  const placeLabel = countryList.find((c) => c.value === country)?.label || country;

  /** Start times on a day ('YYYY-MM-DD') at the picked place that can be booked (see timesIn). */
  const freeHours = (iso) => (placeChosen ? timesIn(settings, taken, country, city, iso).free : []);
  /** The free times on that day less than 3 hours away: they continue on WhatsApp (see timesIn). */
  const soonHours = (iso) => (placeChosen ? timesIn(settings, taken, country, city, iso).soon : []);

  // A country with its own calendar opens the calendar on its first free month
  useEffect(() => {
    const first = firstOpen[country];
    if (!first) return;
    const [y, m] = first.split('-').map(Number);
    setMonth(new Date(y, m - 1, 1));
    // only when the country changes, not each time the free times refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const priceFactor = locationFactor(country, outsideFactor);
  const totals = bookingTotals(
    cartItems.map((i) => ({ price: priceAt(i.price, priceFactor), qty: i.qty })),
    { country, city, serviceType, taxPercent }
  );
  const totalLines = priceLines(totals, lang);
  const homeCostsMore = homeFactor('home', country) > 1;
  const totalDuration = cartItems.reduce(
    (a, i) => a + (Number(i.duration) || 0) * i.qty,
    0
  );

  /* ------------------------------------------------------------ actions */

  const goTo = (n) => {
    setStep(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * On a phone the cards are stacked, so the Hijab notice can start below the
   * screen or behind the sticky bottom bar: it is then scrolled into view.
   */
  const showHijabNotice = () =>
    window.requestAnimationFrame(() => {
      const notice = document.getElementById('fr-hijab-notice');
      if (!notice) return;
      const bar = document.querySelector('.fr-bottombar');
      const visibleUntil =
        bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect().top : window.innerHeight;
      if (notice.getBoundingClientRect().bottom > visibleUntil)
        notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

  const toggleService = (s) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[s._id]) delete next[s._id];
      else
        next[s._id] = {
          id: s._id,
          title: s.title,
          cat: s.cat,
          price: Number(s.price),
          duration: s.duration || null,
          qty: 1,
        };
      return next;
    });
    setErrors((e) => ({ ...e, cart: undefined }));
  };

  const changeQty = (id, delta) =>
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;
      const qty = item.qty + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...item, qty } };
    });

  /**
   * Another country, city, date or time was picked: the message about the
   * previous choice (e.g. "not available in this country") goes away, and
   * Continue checks the new choice again.
   */
  const pickPlace = (set) => (value) => {
    set(value);
    setErrors((e) => ({ ...e, time: undefined }));
  };
  const chooseCountry = pickPlace(setCountry);
  const chooseCity = pickPlace(setCity);
  const chooseDate = pickPlace(setDate);
  const chooseHour = pickPlace(setHour);

  // Reset downstream selections when the location changes
  useEffect(() => {
    setCity('');
    setDate('');
    setHour('');
  }, [country]);

  useEffect(() => {
    setDate('');
    setHour('');
  }, [city]);

  useEffect(() => {
    setHour('');
  }, [date]);

  // A signed-in client's details are filled in (the booking then also shows
  // up under My account, where it can be cancelled)
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.name || '',
      phone: f.phone || user.phone || '',
      email: f.email || user.email || '',
    }));
  }, [user]);

  const contactErrors = () => {
    const e = {};
    if (!form.name.trim()) e.name = t.errRequired;
    if (!form.phone.trim()) e.phone = t.errRequired;
    else if (form.phone.replace(/\D/g, '').length < 6) e.phone = t.errPhone;
    if (!form.email.trim()) e.email = t.errRequired;
    else if (!isEmail(form.email)) e.email = t.errEmail;
    if (!clientCountry) e.clientCountry = t.errRequired;
    if (country && placeState !== 'open') e.time = t.errUnavailable;
    else if (!placeChosen || !date || !hour) e.time = t.errTime;
    // The client took a while: the time picked is now less than 30 minutes away
    else if (startsBy(date, hour, bookingClock(timeZoneOf(country, settings.countries)).cutoff)) {
      e.time = t.errTooSoon;
      setHour('');
    }
    return e;
  };

  const canContinue = () => (step === 1 ? !!staff : true);

  /** Moves on to the next step once this one is complete. */
  const next = () => {
    if (step === 1) {
      if (!staff) return setErrors({ staff: t.errStaff });
      if (whatsappOnly) return; // Hijab continues on WhatsApp (HijabNotice)
      setErrors({});
      return goTo(2);
    }
    if (step === 2) {
      const e = contactErrors();
      setErrors(e);
      if (Object.keys(e).length === 0) goTo(3);
    }
  };

  const validateDetails = () => {
    const e = contactErrors();
    if (!staff) e.staff = t.errStaff;
    if (!serviceType) e.serviceType = t.errServiceType;
    if (cartItems.length === 0) e.cart = t.errCart;
    setErrors(e);
    if (e.staff) goTo(1);
    else if (['name', 'phone', 'email', 'clientCountry', 'time'].some((k) => e[k])) goTo(2);
    return Object.keys(e).length === 0;
  };

  /**
   * "Confirm booking": saves the booking, then WhatsApp opens by itself with
   * it written out for the salon. Pop-up blockers only stop windows a page
   * opens on its own later, so WhatsApp is opened without one:
   *  - computer: the WhatsApp tab is opened right here, inside the click, and
   *    sent to WhatsApp once the booking is saved (closed again if it fails);
   *  - phone, or when that tab was blocked anyway: this page itself goes to
   *    WhatsApp, which the phone hands to the WhatsApp app. Moving the page
   *    itself is never blocked.
   */
  const handleConfirm = async () => {
    if (whatsappOnly) return goTo(1); // Hijab isn't booked online
    if (submitting || !validateDetails()) return;
    const waTab = isHandheld() ? null : openWhatsAppTab(t, lang);
    setSubmitting(true);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          clientCountry,
          country,
          city,
          date,
          hour,
          serviceType,
          staff,
          lang,
          cart: cartItems.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        waTab?.close();
        if (result.code === 'taken') {
          // Someone else got this time a moment ago: back to the calendar,
          // scrolled to the message saying so
          setTaken((prev) => new Set(prev).add(slotKey(country, city, date, hour)));
          setHour('');
          setErrors({ time: t.errTaken });
          setStep(2);
        } else if (result.code === 'too-soon') {
          // Now less than 30 minutes away (the page's clock can be off): same way back
          setHour('');
          setErrors({ time: t.errTooSoon });
          setStep(2);
        } else if (result.code === 'whatsapp-only') {
          // Hijab is booked on WhatsApp: back to step 1, where HijabNotice says so
          setStaff('hijab');
          setErrors({});
          goTo(1);
        } else if (result.code === 'locked') {
          // Locked from the dashboard meanwhile: back to the details, where
          // the notice gives the salon's phone and WhatsApp
          setSettings((s) => ({
            ...s,
            countries: s.countries.map((c) => (c.name === country ? { ...c, locked: true } : c)),
          }));
          setErrors({ time: t.errUnavailable });
          goTo(2);
        } else {
          setErrors({ submit: result.error || t.errGeneric });
        }
        return;
      }

      const payload = {
        ...form,
        country,
        city: result.city || city,
        date,
        hour,
        serviceType,
        staff,
        reference: result.reference,
        shortNotice: !!result.shortNotice,
        subtotal: result.subtotal,
        homeFee: result.homeFee,
        taxPercent: result.taxPercent,
        tax: result.tax,
        total: result.total,
        deposit: result.deposit,
        outsideFactor: result.outsideFactor, // named in the note on prices
        cart: result.cart,
      };
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        buildBookingText(payload, lang)
      )}`;
      const booked = { ...payload, waUrl, emailed: Boolean(result.emailResults?.client) };

      // The time is now taken (for "Book another appointment")
      setTaken((prev) => new Set(prev).add(slotKey(country, payload.city, date, hour)));
      setDone(booked);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new Event('rd:notifications')); // the bell picks it up right away

      // WhatsApp opens with the booking written out
      if (waTab) {
        if (!waTab.closed) waTab.location.replace(waUrl);
      } else {
        rememberBooking(booked);
        window.location.assign(waUrl);
      }
    } catch (err) {
      console.error(err);
      waTab?.close();
      setErrors({ submit: t.errNetwork });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    try {
      sessionStorage.removeItem(DONE_KEY);
    } catch {
      /* nothing kept */
    }
    setDone(null);
    setCart({});
    setStep(1);
    setDate('');
    setHour('');
    setServiceType('');
    setStaff('');
    setForm({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', notes: '' });
    setErrors({});
  };

  /* ----------------------------------------------------------- rendering */

  if (done) {
    const whatsappButton = (
      <>
        <a
          className="rd-btn fr-cta fr-cta--wa"
          href={done.waUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppGlyph />
          {done.shortNotice ? t.continueWhatsApp : t.openWhatsApp}
        </a>
        <p className="fr-done-hint">{t.waHint}</p>
      </>
    );

    return (
      <div className="fr-booking" dir={t.dir} lang={lang} translate="no" data-no-translate>
        <div className="fr-topbar">
          <div className="fr-brand">
            <img className="fr-brand-logo" src={LOGO} alt="" width="30" height="30" />
            <span>{t.brand}</span>
          </div>
          <div className="fr-topbar-right">
            <LangSwitch lang={lang} onChange={setLang} />
          </div>
        </div>

        <div className="fr-done">
          <div className="fr-done-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          <h2>{done.shortNotice ? t.doneSoonTitle : t.doneTitle}</h2>
          {done.shortNotice && (
            <p className="fr-done-alert" role="status">
              <WhatsAppGlyph size={18} />
              <span>{t.doneSoonText}</span>
            </p>
          )}
          <p>
            {t.doneText}
            {done.emailed ? ` ${t.doneEmailed}` : ''}
          </p>
          {!done.shortNotice && <p>{t.reminderNote}</p>}
          {done.shortNotice && whatsappButton}

          <div className="fr-done-card">
            <div className="fr-done-row">
              <span>{t.ref}</span>
              <span>{done.reference}</span>
            </div>
            <div className="fr-done-row">
              <span>{t.date}</span>
              <span>{prettyDate(done.date, lang)}</span>
            </div>
            <div className="fr-done-row">
              <span>{t.time}</span>
              <span>{done.hour}</span>
            </div>
            <div className="fr-done-row">
              <span>{t.location}</span>
              <span>
                {done.city}, {done.country}
              </span>
            </div>
            <div className="fr-done-row">
              <span>{m.staff}</span>
              <span>{m.staffs[done.staff]}</span>
            </div>
            <div className="fr-done-row">
              <span>{m.serviceType}</span>
              <span>{m.serviceTypes[done.serviceType]}</span>
            </div>
            {done.cart.map((i) => (
              <div className="fr-done-row" key={i.id}>
                <span>
                  {i.title}
                  {i.qty > 1 ? ` × ${i.qty}` : ''}
                </span>
                <span>{money(i.price * i.qty)}</span>
              </div>
            ))}
            {priceLines(done, lang).map(([label, amount]) => (
              <div className="fr-done-row" key={label}>
                <span>{label}</span>
                <span>{amount}</span>
              </div>
            ))}
            <div className="fr-summary-total">
              <span>{t.total}</span>
              <span>{money(done.total)}</span>
            </div>
          </div>

          {!done.shortNotice && whatsappButton}
          <p className="fr-done-hint">
            {t.manageBefore}
            <a href="/account?tab=appointments">{t.manageLink}</a>
            {t.manageAfter(done.email)}
          </p>

          <button type="button" className="rd-btn rd-btn--ghost fr-cta" onClick={resetAll}>
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  const heading =
    step === 1 ? t.selectStaff : step === 2 ? t.selectDetails : t.selectServices;

  const summary = (
    <aside className="fr-summary">
      <div className="fr-summary-head">
        <img className="fr-summary-logo" src={LOGO} alt="Rafi Daham" width="52" height="52" />
        <div>
          <div className="fr-summary-name">{t.brand}</div>
          <div className="fr-summary-addr">{t.address}</div>
        </div>
      </div>

      <div className="fr-summary-body">
        {date && hour && (
          <div className="fr-summary-when">
            {prettyDate(date, lang)} · {hour}
            {totalDuration ? ` · ${totalDuration} ${t.mins}` : ''}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="fr-summary-empty">{t.emptyCart}</div>
        ) : (
          cartItems.map((i) => (
            <div className="fr-summary-item" key={i.id}>
              <div>
                {i.title}
                {i.qty > 1 ? ` × ${i.qty}` : ''}
                {i.duration ? (
                  <small>
                    {i.duration} {t.mins}
                  </small>
                ) : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>
                  {money(priceAt(i.price, priceFactor) * i.qty)}
                </span>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => toggleService({ _id: i.id })}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}

        {totalLines.length > 0 && (
          <div className="fr-summary-lines">
            {totalLines.map(([label, amount]) => (
              <div className="fr-summary-line" key={label}>
                <span>{label}</span>
                <span>{amount}</span>
              </div>
            ))}
          </div>
        )}

        <div className="fr-summary-total">
          <span>{t.total}</span>
          <span>{money(totals.total)}</span>
        </div>

        {cartItems.length > 0 && totals.deposit > 0 && (
          <div className="fr-summary-note">{t.deposit(money(totals.deposit))}</div>
        )}
        {priceFactor > 1 && <div className="fr-summary-note">{t.outside}</div>}

        {step === 1 && whatsappOnly && (
          <a
            className="rd-btn fr-cta fr-cta--wa"
            href={whatsappAsk(t.hijabWaAsk)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph />
            {t.continueWhatsApp}
          </a>
        )}
        {step < 3 && !(step === 1 && whatsappOnly) && (
          <button
            type="button"
            className="rd-btn fr-cta"
            disabled={!canContinue()}
            onClick={next}
          >
            {t.continue}
          </button>
        )}
        {step === 3 && (
          <>
            <button type="button" className="rd-btn fr-cta" disabled={submitting} onClick={handleConfirm}>
              {submitting ? t.sending : t.confirmBook}
            </button>
            <div className="fr-summary-note fr-wa-hint">
              <WhatsAppGlyph size={14} />
              <span>{date && hour && soonHours(date).includes(hour) ? t.soonWaNote : t.waNote}</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <div className="fr-booking" dir={t.dir} lang={lang} translate="no" data-no-translate ref={topRef}>
      {/* ---------------------------------------------------------- top bar */}
      <div className="fr-topbar">
        <button
          type="button"
          className="fr-back"
          disabled={step === 1}
          onClick={() => goTo(Math.max(1, step - 1))}
          aria-label="Back"
        >
          <Chevron dir={t.dir === 'rtl' ? 'right' : 'left'} />
        </button>
        <div className="fr-brand">
          <img className="fr-brand-logo" src={LOGO} alt="" width="30" height="30" />
          <span>{t.brand}</span>
        </div>
        <div className="fr-topbar-right">
          <LangSwitch lang={lang} onChange={setLang} />
        </div>
      </div>

      <div className="fr-progress">
        <span style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <div className="fr-shell">
        <main className="fr-main">
          <h1 className="fr-h1">{heading}</h1>
          <p className="fr-sub">
            {step === 1 ? t.staffSub : t.stepOf(step, 3, t.steps[step - 1])}
          </p>

          {/* ------------------------------------------- 1. team (staff) */}
          {step === 1 && (
            <>
              <div className="fr-staff" role="group" aria-label={t.selectStaff}>
                {['hijab', 'rafi', 'regular'].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={`fr-staff-card ${staff === type ? 'is-on' : ''}`}
                    aria-pressed={staff === type}
                    onClick={() => {
                      setStaff(type);
                      setErrors({});
                      // Hijab stays here: the notice below sends the client to WhatsApp
                      if (WHATSAPP_ONLY_STAFF.includes(type)) showHijabNotice();
                      else goTo(2);
                    }}
                  >
                    <span className="fr-staff-avatar">
                      <StaffIcon type={type} />
                    </span>
                    <span className="fr-staff-title">{t.staffs[type][0]}</span>
                    <span className="fr-staff-hint">{t.staffs[type][1]}</span>
                    {WHATSAPP_ONLY_STAFF.includes(type) && (
                      <span className="fr-staff-tag">
                        <WhatsAppGlyph size={13} />
                        {t.viaWhatsApp}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {errors.staff && <p className="fr-error">{errors.staff}</p>}
              {whatsappOnly && <HijabNotice t={t} />}
            </>
          )}

          {/* ------------------------------------ 2. contact details + time */}
          {step === 2 && (
            <>
              <h2 className="fr-h2" style={{ marginTop: 0 }}>{t.yourDetails}</h2>

              <div className="fr-fields">
                <div className="fr-field">
                  <label htmlFor="fr-name">{t.name}</label>
                  <input
                    id="fr-name"
                    className={`fr-input ${errors.name ? 'has-error' : ''}`}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p className="fr-error">{errors.name}</p>}
                </div>

                <div className="fr-field">
                  <label htmlFor="fr-phone">{t.phone}</label>
                  <input
                    id="fr-phone"
                    inputMode="tel"
                    className={`fr-input ${errors.phone ? 'has-error' : ''}`}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value.replace(/[^\d+ ]/g, '') })
                    }
                  />
                  {errors.phone && <p className="fr-error">{errors.phone}</p>}
                </div>
              </div>

              <div className="fr-field" style={{ marginTop: 12 }}>
                <label htmlFor="fr-email">{t.email}</label>
                <input
                  id="fr-email"
                  type="email"
                  inputMode="email"
                  className={`fr-input ${errors.email ? 'has-error' : ''}`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email ? (
                  <p className="fr-error">{errors.email}</p>
                ) : (
                  <p className="fr-summary-note">{t.emailNote}</p>
                )}
              </div>

              <div className="fr-field" style={{ marginTop: 12 }}>
                <label htmlFor="fr-notes">{t.notes}</label>
                <textarea
                  id="fr-notes"
                  className="fr-input"
                  placeholder={t.notesPh}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>


              <h2 className="fr-h2">{t.location}</h2>
              <div className="fr-field" style={{ marginBottom: 12 }}>
                <label htmlFor="fr-client-country" id="fr-client-country-label">
                  {t.clientCountry}
                </label>
                <SearchSelect
                  id="fr-client-country"
                  labelId="fr-client-country-label"
                  label={t.clientCountry}
                  value={clientCountry}
                  options={worldList}
                  onChange={setClientCountry}
                  placeholder={t.chooseClientCountry}
                  searchPlaceholder={t.searchCountry}
                  noResults={t.noMatches}
                  closeLabel={t.close}
                  hasError={!!errors.clientCountry}
                  dir={t.dir}
                  lang={lang}
                />
                {errors.clientCountry && <p className="fr-error">{errors.clientCountry}</p>}
              </div>
              <div className="fr-fields">
                <div className="fr-field">
                  <label htmlFor="fr-country" id="fr-country-label">
                    {t.country}
                  </label>
                  <SearchSelect
                    id="fr-country"
                    labelId="fr-country-label"
                    label={t.country}
                    value={country}
                    options={countryList}
                    onChange={chooseCountry}
                    placeholder={t.chooseCountry}
                    searchPlaceholder={t.searchCountry}
                    noResults={t.noMatches}
                    closeLabel={t.close}
                    dir={t.dir}
                    lang={lang}
                  />
                </div>

                <div className="fr-field">
                  <label htmlFor="fr-city" id="fr-city-label">
                    {t.city}
                  </label>
                  <SearchSelect
                    id="fr-city"
                    labelId="fr-city-label"
                    label={t.city}
                    value={city}
                    options={cityList}
                    onChange={chooseCity}
                    placeholder={t.chooseCity}
                    searchPlaceholder={t.searchCity}
                    noResults={t.noMatches}
                    closeLabel={t.close}
                    disabled={placeState !== 'open'}
                    dir={t.dir}
                    lang={lang}
                  />
                </div>
              </div>

              {(placeState === 'locked' || placeState === 'none') && (
                <UnavailableNotice t={t} kind={placeState} place={placeLabel} />
              )}

              {placeChosen && placeState === 'open' && (
                <>
                  <h2 className="fr-h2">{t.selectTime}</h2>
                  <MiniCalendar
                    lang={lang}
                    month={month}
                    onMonthChange={setMonth}
                    value={date}
                    onChange={chooseDate}
                    isEnabled={(iso) => freeHours(iso).length > 0}
                  />

                  {date && (
                    <>
                      <h2 className="fr-h2">{prettyDate(date, lang)}</h2>
                      {soonHours(date).length > 0 && <SoonNotice t={t} />}
                      {freeHours(date).length === 0 ? (
                        <p className="fr-error">{t.noSlots}</p>
                      ) : (
                        <div className="fr-slots">
                          {freeHours(date).map((h) => {
                            const soon = soonHours(date).includes(h);
                            return (
                              <button
                                type="button"
                                key={h}
                                className={`fr-slot ${hour === h ? 'is-on' : ''} ${soon ? 'is-soon' : ''}`}
                                aria-pressed={hour === h}
                                aria-label={soon ? `${h}, ${t.soonTitle}` : undefined}
                                onClick={() => chooseHour(h)}
                              >
                                {h}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {errors.time && (
                <p id="fr-time-error" className="fr-error" role="alert">
                  {errors.time}
                </p>
              )}
            </>
          )}

          {/* ------------------------------------ 3. services + confirm */}
          {step === 3 && (
            <>
              <h2 className="fr-h2" style={{ marginTop: 0 }}>
                {t.serviceTypeTitle}
              </h2>

              <div
                className={`fr-options ${errors.serviceType ? 'has-error' : ''}`}
                role="group"
                aria-label={t.serviceTypeTitle}
              >
                {SERVICE_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={`fr-option ${serviceType === type ? 'is-on' : ''}`}
                    aria-pressed={serviceType === type}
                    onClick={() => {
                      setServiceType(type);
                      setErrors((e) => ({ ...e, serviceType: undefined }));
                    }}
                  >
                    <span className="fr-option-title">{m.serviceTypes[type]}</span>
                    <span className="fr-option-hint">{t.serviceTypeHints[type]}</span>
                    {homeCostsMore && (
                      <span className="fr-option-price">
                        {type === 'home' ? t.doublePrice : t.samePrice}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {errors.serviceType && <p className="fr-error">{errors.serviceType}</p>}


              <h2 className="fr-h2">{t.selectServices}</h2>
              <div className="fr-chips" role="group" aria-label={t.steps[0]}>
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`fr-chip ${activeCat === c ? 'is-active' : ''}`}
                    aria-pressed={activeCat === c}
                    onClick={() => setActiveCat(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {loadingServices &&
                [0, 1, 2, 3, 4].map((i) => <div className="fr-skel" key={i} />)}

              {visibleServices.map((s) => {
                const item = cart[s._id];
                return (
                  <div
                    key={s._id}
                    className={`fr-service ${item ? 'is-selected' : ''}`}
                  >
                    <div className="fr-service-info">
                      <h3 className="fr-service-title">{s.title}</h3>
                      {s.duration ? (
                        <p className="fr-service-meta">
                          {s.duration} {t.mins}
                        </p>
                      ) : null}
                      {s.description ? (
                        <p className="fr-service-desc">{s.description}</p>
                      ) : null}
                      <div className="fr-service-price">
                        {money(priceAt(s.price, priceFactor))}
                      </div>
                    </div>

                    {item ? (
                      <div className="fr-qty">
                        <button type="button" onClick={() => changeQty(s._id, -1)} aria-label="Decrease">
                          −
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button type="button" onClick={() => changeQty(s._id, 1)} aria-label="Increase">
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="rd-btn rd-btn--ghost rd-btn--sm rd-btn--auto fr-book-btn"
                        onClick={() => toggleService(s)}
                      >
                        <Plus />
                        {t.book}
                      </button>
                    )}
                  </div>
                );
              })}

              {errors.cart && <p className="fr-error">{errors.cart}</p>}

              {errors.submit && <p className="fr-error">{errors.submit}</p>}
            </>
          )}
        </main>

        {summary}
      </div>

      {/* --------------------------------------------- mobile sticky footer */}
      <div className="fr-bottombar">
        <div className="fr-bottombar-info">
          <div className="fr-bottombar-total">{money(totals.total)}</div>
          <div className="fr-bottombar-count">
            {cartItems.length === 0
              ? t.emptyCart
              : `${t.serviceCount(cartItems.length)}${
                  date && hour ? ` · ${date} ${hour}` : ''
                }`}
          </div>
        </div>

        {step === 1 && whatsappOnly ? (
          <a
            className="rd-btn fr-cta fr-cta--wa"
            href={whatsappAsk(t.hijabWaAsk)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph />
            {t.continueWhatsApp}
          </a>
        ) : step < 3 ? (
          <button
            type="button"
            className="rd-btn fr-cta"
            disabled={!canContinue()}
            onClick={next}
          >
            {t.continue}
          </button>
        ) : (
          <button type="button" className="rd-btn fr-cta" disabled={submitting} onClick={handleConfirm}>
            {submitting ? t.sending : t.confirmBook}
          </button>
        )}
      </div>
    </div>
  );
}
