'use client';

/**
 * Fresha-style booking flow for Rafi Daham Hair Repair Studio.
 *
 *  Step 1 — Team       (Hijab or no preference — saved as the booking's staff)
 *  Step 2 — Details    (contact form, country / city, calendar, time slots)
 *  Step 3 — Services   (categories + service list, salon or home, confirm)
 *
 * Tax is only added once a city outside Beirut is chosen (lib/bookingPrice.js).
 *
 * Lebanon, KSA and Kuwait can be booked every day, 08:00 to midnight; a time
 * is free until somebody takes it (lib/bookingOptions.js).
 *
 * On confirm: the booking is stored in MongoDB, a confirmation email is sent
 * with Resend (plus reminder emails 2 & 1 day before via /api/booking/reminders)
 * and the client is handed over to WhatsApp with a ready-made message.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import './appointment.css';
import './appointment-steps.css';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { bookingText, buildBookingText, localeOf, priceLines } from '../lib/bookingMessage';
import { SERVICE_TYPES, bookingTotals, homeFactor, locationFactor } from '../lib/bookingPrice';
import { COUNTRIES, OPEN_HOURS, citiesOf, slotKey } from '../lib/bookingOptions';

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
      regular: ['No preference', 'Any available team member'],
    },
    errStaff: 'Please choose an option',
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
    country: 'Country',
    city: 'City',
    chooseCountry: 'Choose a country',
    chooseCity: 'Choose a city',
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
    doneTitle: 'Appointment requested!',
    doneText:
      'We have emailed your confirmation. WhatsApp is opening so you can finalise the details with us.',
    ref: 'Reference',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    newBooking: 'Book another appointment',
    reminderNote: 'You will get a reminder email 2 days and 1 day before.',
    openWhatsApp: 'Send details on WhatsApp',
    waHint:
      "If WhatsApp didn't open automatically, tap the button above to send us your booking details.",
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
      regular: ['بدون تفضيل', 'أي عضو متاح من الفريق'],
    },
    errStaff: 'يرجى اختيار أحد الخيارين',
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
    country: 'الدولة',
    city: 'المدينة',
    chooseCountry: 'اختر الدولة',
    chooseCity: 'اختر المدينة',
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
    doneTitle: 'تم إرسال طلب الموعد!',
    doneText: 'أرسلنا لك التأكيد عبر البريد. سيتم فتح واتساب لإتمام التفاصيل معنا.',
    ref: 'رقم الحجز',
    date: 'التاريخ',
    time: 'الوقت',
    location: 'الموقع',
    newBooking: 'حجز موعد آخر',
    reminderNote: 'ستصلك رسالة تذكير قبل يومين وقبل يوم من الموعد.',
    openWhatsApp: 'إرسال التفاصيل عبر واتساب',
    waHint:
      'إذا لم يُفتح واتساب تلقائياً، اضغط على الزر أعلاه لإرسال تفاصيل حجزك.',
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
      regular: ['Sans préférence', 'Tout membre disponible de l’équipe'],
    },
    errStaff: 'Veuillez choisir une option',
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
    country: 'Pays',
    city: 'Ville',
    chooseCountry: 'Choisissez un pays',
    chooseCity: 'Choisissez une ville',
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
    doneTitle: 'Rendez-vous demandé !',
    doneText:
      'Nous vous avons envoyé la confirmation par e-mail. WhatsApp s’ouvre pour finaliser les détails avec nous.',
    ref: 'Référence',
    date: 'Date',
    time: 'Heure',
    location: 'Lieu',
    newBooking: 'Prendre un autre rendez-vous',
    reminderNote: 'Vous recevrez un rappel par e-mail 2 jours et 1 jour avant.',
    openWhatsApp: 'Envoyer les détails sur WhatsApp',
    waHint:
      'Si WhatsApp ne s’est pas ouvert, touchez le bouton ci-dessus pour nous envoyer votre réservation.',
    manageBefore: 'Un changement ? Vous pouvez l’annuler depuis ',
    manageLink: 'Mon compte',
    manageAfter: (email) => `, connecté avec ${email}.`,
  },
};

/** Lebanon, KSA and Kuwait, named in the page's language. */
const countryOptions = (lang) =>
  COUNTRIES.map(({ name, ar }) => ({ value: name, label: lang === 'ar' ? ar : name }));

/** A country's cities: the capital first, then the rest in alphabetical order. */
const cityOptions = (country, lang) => {
  const [capital, ...rest] = citiesOf(country).map(([en, ar]) => ({ value: en, label: lang === 'ar' ? ar : en }));
  rest.sort((a, b) => a.label.localeCompare(b.label, lang));
  return capital ? [capital, ...rest] : [];
};

const WHATSAPP_NUMBER = '9613896074';
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

/* ------------------------------------------------------------------- Page */

export default function AppointmentPage() {
  // The site-wide language (EN default, AR, FR); this page has its own wording
  const { lang: siteLang, setLang } = useLanguage();
  const lang = STRINGS[siteLang] ? siteLang : 'en';
  const t = STRINGS[lang];
  const m = bookingText(lang);

  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [staff, setStaff] = useState(''); // 'hijab' | 'regular'
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [taken, setTaken] = useState(() => new Set()); // slotKey()s of booked times

  const [activeCat, setActiveCat] = useState('');
  const [cart, setCart] = useState({});

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('');
  const [serviceType, setServiceType] = useState(''); // 'salon' | 'home'
  const [taxPercent, setTaxPercent] = useState(0);

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const topRef = useRef(null);

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
      .then((json) =>
        setTaken(new Set((json?.taken || []).map((b) => slotKey(b.country, b.city, b.date, b.hour))))
      )
      .catch(() => setTaken(new Set()));

    fetch('/api/tax')
      .then((r) => r.json())
      .then((json) => setTaxPercent(Number(json?.percent) || 0))
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

  const countryList = useMemo(() => countryOptions(lang), [lang]);
  const cityList = useMemo(() => cityOptions(country, lang), [country, lang]);
  const placeChosen = !!country && !!city;

  /** Start times still free on a day ('YYYY-MM-DD') for the picked place; today's past times are gone. */
  const freeHours = (iso) => {
    const now = new Date();
    const today = fmtLocalDate(now);
    if (!placeChosen || iso < today) return [];
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return OPEN_HOURS.filter(
      (h) => (iso > today || h > nowTime) && !taken.has(slotKey(country, city, iso, h))
    );
  };

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const priceFactor = locationFactor(country);
  const totals = bookingTotals(
    cartItems.map((i) => ({ price: Number(i.price) * priceFactor, qty: i.qty })),
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
    if (!placeChosen || !date || !hour) e.time = t.errTime;
    return e;
  };

  const canContinue = () => (step === 1 ? !!staff : true);

  /** Moves on to the next step once this one is complete. */
  const next = () => {
    if (step === 1) {
      if (!staff) return setErrors({ staff: t.errStaff });
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
    else if (['name', 'phone', 'email', 'time'].some((k) => e[k])) goTo(2);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateDetails() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
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

      const result = await res.json();
      if (!res.ok) {
        setErrors({ submit: result.error || 'Something went wrong' });
        setSubmitting(false);
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
        subtotal: result.subtotal,
        homeFee: result.homeFee,
        taxPercent: result.taxPercent,
        tax: result.tax,
        total: result.total,
        deposit: result.deposit,
        cart: result.cart,
      };

      // The time is now taken (for "Book another appointment")
      setTaken((prev) => new Set(prev).add(slotKey(country, payload.city, date, hour)));

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        buildBookingText(payload, lang)
      )}`;

      // Show the confirmation screen first — it always carries a real
      // WhatsApp link, so the handover works even if a pop-up is blocked.
      setDone({ ...payload, waUrl: url });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Best-effort auto-open (silently ignored when blocked).
      setTimeout(() => {
        try {
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
          /* the button on the confirmation screen is the fallback */
        }
      }, 300);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Network error — please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
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
          <h2>{t.doneTitle}</h2>
          <p>{t.doneText}</p>
          <p>{t.reminderNote}</p>

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

          <a
            className="rd-btn fr-cta fr-cta--wa"
            href={done.waUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.55 0 .22 5.32.22 11.86c0 2.09.55 4.13 1.58 5.93L.12 24l6.36-1.67a11.85 11.85 0 0 0 5.6 1.43h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.14-3.43-8.42Zm-8.43 18.28h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.22-3.77.99 1.01-3.67-.24-.38a9.83 9.83 0 0 1-1.51-5.24c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.11 1.03 6.97 2.89a9.78 9.78 0 0 1 2.89 6.97c0 5.43-4.42 9.85-9.81 9.85Zm5.4-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
            </svg>
            {t.openWhatsApp}
          </a>
          <p className="fr-done-hint">{t.waHint}</p>
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
                  {money(Number(i.price) * priceFactor * i.qty)}
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

        {step < 3 && (
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
          <button type="button" className="rd-btn fr-cta" disabled={submitting} onClick={handleConfirm}>
            {submitting ? t.sending : t.confirmBook}
          </button>
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
                {['hijab', 'regular'].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={`fr-staff-card ${staff === type ? 'is-on' : ''}`}
                    aria-pressed={staff === type}
                    onClick={() => {
                      setStaff(type);
                      setErrors({});
                      goTo(2);
                    }}
                  >
                    <span className="fr-staff-avatar">
                      <StaffIcon type={type} />
                    </span>
                    <span className="fr-staff-title">{t.staffs[type][0]}</span>
                    <span className="fr-staff-hint">{t.staffs[type][1]}</span>
                  </button>
                ))}
              </div>
              {errors.staff && <p className="fr-error">{errors.staff}</p>}
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
              <div className="fr-fields">
                <div className="fr-field">
                  <label htmlFor="fr-country">{t.country}</label>
                  <select
                    id="fr-country"
                    className="fr-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">{t.chooseCountry}</option>
                    {countryList.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fr-field">
                  <label htmlFor="fr-city">{t.city}</label>
                  <select
                    id="fr-city"
                    className="fr-input"
                    value={city}
                    disabled={!country}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">{t.chooseCity}</option>
                    {cityList.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {placeChosen && (
                <>
                  <h2 className="fr-h2">{t.selectTime}</h2>
                  <MiniCalendar
                    lang={lang}
                    month={month}
                    onMonthChange={setMonth}
                    value={date}
                    onChange={setDate}
                    isEnabled={(iso) => freeHours(iso).length > 0}
                  />

                  {date && (
                    <>
                      <h2 className="fr-h2">{prettyDate(date, lang)}</h2>
                      {freeHours(date).length === 0 ? (
                        <p className="fr-error">{t.noSlots}</p>
                      ) : (
                        <div className="fr-slots">
                          {freeHours(date).map((h) => (
                            <button
                              type="button"
                              key={h}
                              className={`fr-slot ${hour === h ? 'is-on' : ''}`}
                              aria-pressed={hour === h}
                              onClick={() => setHour(h)}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {errors.time && <p className="fr-error">{errors.time}</p>}
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
                        {money(Number(s.price) * priceFactor)}
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

        {step < 3 ? (
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
