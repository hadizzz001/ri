/**
 * Where and when an appointment can be booked, shared by the booking page and
 * /api/booking (which re-checks every choice).
 *
 *  - Every day is open, 08:00 to midnight: a start time every 30 minutes,
 *    the last one at 23:30. A time stays free until somebody books it.
 *  - The countries are Lebanon, KSA and Kuwait, and the city is picked from
 *    the country's list below (Beirut is tax free, see bookingPrice.js).
 *  - From the dashboard, each country can be locked (the page then asks the
 *    client to contact the salon) or limited to its own calendar of dates.
 *
 * Places are stored by their English names (bookings, emails, pricing rules);
 * the Arabic page shows their Arabic names.
 * Plain data + pure helpers only — safe to import from client and server.
 */

export const OPEN_FROM = 8; // 08:00
export const OPEN_UNTIL = 24; // midnight
export const SLOT_MINUTES = 30;

const pad = (n) => String(n).padStart(2, '0');

/** Start times of a day: ['08:00', '08:30', …, '23:30']. */
export const OPEN_HOURS = Array.from(
  { length: ((OPEN_UNTIL - OPEN_FROM) * 60) / SLOT_MINUTES },
  (_, i) => {
    const minutes = OPEN_FROM * 60 + i * SLOT_MINUTES;
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
  }
);

export const LEBANON = 'Lebanon';

/** Lebanon: Beirut, then the cities and main towns of every district. */
const LEBANON_CITIES = [
  ['Beirut', 'بيروت'],
  ['Adma', 'أدما'],
  ['Ajaltoun', 'عجلتون'],
  ['Aley', 'عاليه'],
  ['Amchit', 'عمشيت'],
  ['Amioun', 'أميون'],
  ['Anfeh', 'أنفه'],
  ['Anjar', 'عنجر'],
  ['Antelias', 'أنطلياس'],
  ['Aramoun', 'عرمون'],
  ['Arsal', 'عرسال'],
  ['Baabda', 'بعبدا'],
  ['Baakleen', 'بعقلين'],
  ['Baalbek', 'بعلبك'],
  ['Bar Elias', 'برالياس'],
  ['Barja', 'برجا'],
  ['Batroun', 'البترون'],
  ['Bchamoun', 'بشامون'],
  ['Bcharre', 'بشري'],
  ['Bebnine', 'ببنين'],
  ['Beit Mery', 'بيت مري'],
  ['Beiteddine', 'بيت الدين'],
  ['Bhamdoun', 'بحمدون'],
  ['Bikfaya', 'بكفيا'],
  ['Bint Jbeil', 'بنت جبيل'],
  ['Bourj el Barajneh', 'برج البراجنة'],
  ['Bourj Hammoud', 'برج حمود'],
  ['Broummana', 'برمانا'],
  ['Byblos (Jbeil)', 'جبيل'],
  ['Chebaa', 'شبعا'],
  ['Chekka', 'شكا'],
  ['Chhim', 'شحيم'],
  ['Chiyah', 'الشياح'],
  ['Chmestar', 'شمسطار'],
  ['Choueifat', 'الشويفات'],
  ['Chtaura', 'شتورة'],
  ['Damour', 'الدامور'],
  ['Dbayeh', 'ضبية'],
  ['Deir el Ahmar', 'دير الأحمر'],
  ['Deir el Qamar', 'دير القمر'],
  ['Dekwaneh', 'الدكوانة'],
  ['Dhour el Choueir', 'ضهور الشوير'],
  ['Douma', 'دوما'],
  ['Ehden', 'إهدن'],
  ['El Mina', 'الميناء'],
  ['Fanar', 'الفنار'],
  ['Faraya', 'فاريا'],
  ['Furn el Chebbak', 'فرن الشباك'],
  ['Ghazieh', 'الغازية'],
  ['Ghazir', 'غزير'],
  ['Ghobeiry', 'الغبيري'],
  ['Hadath', 'الحدث'],
  ['Halba', 'حلبا'],
  ['Hammana', 'حمانا'],
  ['Haret Hreik', 'حارة حريك'],
  ['Harissa', 'حريصا'],
  ['Hasbaya', 'حاصبيا'],
  ['Hasroun', 'حصرون'],
  ['Hazmieh', 'الحازمية'],
  ['Hermel', 'الهرمل'],
  ['Jal el Dib', 'جل الديب'],
  ['Jdeideh', 'الجديدة'],
  ['Jezzine', 'جزين'],
  ['Jiyeh', 'الجية'],
  ['Joub Jannine', 'جب جنين'],
  ['Jounieh', 'جونية'],
  ['Kahaleh', 'الكحالة'],
  ['Kfar Roummane', 'كفررمان'],
  ['Kfardebian', 'كفرذبيان'],
  ['Kfarshima', 'كفرشيما'],
  ['Khiam', 'الخيام'],
  ['Kousba', 'كوسبا'],
  ['Machghara', 'مشغرة'],
  ['Maghdoucheh', 'مغدوشة'],
  ['Majdal Anjar', 'مجدل عنجر'],
  ['Mansourieh', 'المنصورية'],
  ['Marjayoun', 'مرجعيون'],
  ['Minieh', 'المنية'],
  ['Moukhtara', 'المختارة'],
  ['Naameh', 'الناعمة'],
  ['Nabatieh', 'النبطية'],
  ['Naqoura', 'الناقورة'],
  ['Qab Elias', 'قب الياس'],
  ['Qana', 'قانا'],
  ['Qaraoun', 'القرعون'],
  ['Qartaba', 'قرطبا'],
  ['Qobayat', 'القبيات'],
  ['Rabieh', 'الرابية'],
  ['Ras Baalbek', 'رأس بعلبك'],
  ['Rashaya', 'راشيا'],
  ['Rayak', 'رياق'],
  ['Saadnayel', 'سعدنايل'],
  ['Saghbine', 'صغبين'],
  ['Sarafand', 'الصرفند'],
  ['Sidon (Saida)', 'صيدا'],
  ['Sin el Fil', 'سن الفيل'],
  ['Sir el Danniyeh', 'سير الضنية'],
  ['Sofar', 'صوفر'],
  ['Tabarja', 'طبرجا'],
  ['Tannourine', 'تنورين'],
  ['Tebnine', 'تبنين'],
  ['Tripoli', 'طرابلس'],
  ['Tyre (Sour)', 'صور'],
  ['Zahle', 'زحلة'],
  ['Zalka', 'الزلقا'],
  ['Zgharta', 'زغرتا'],
  ['Zouk Mikael', 'ذوق مكايل'],
  ['Zouk Mosbeh', 'ذوق مصبح'],
];

/**
 * The default appointment countries and their cities, capital first:
 * [English, Arabic]. The dashboard's Booking Schedule page can change them
 * (stored in BookingSettings, see normalizeSettings below).
 */
export const COUNTRIES = [
  { name: LEBANON, ar: 'لبنان', timeZone: 'Asia/Beirut', cities: LEBANON_CITIES },
  { name: 'KSA', ar: 'السعودية', timeZone: 'Asia/Riyadh', cities: [['Riyadh', 'الرياض'], ['Jeddah', 'جدة']] },
  { name: 'Kuwait', ar: 'الكويت', timeZone: 'Asia/Kuwait', cities: [['Kuwait City', 'مدينة الكويت']] },
];

/** A country's [English, Arabic] cities ([] for a country that can't be booked). */
export const citiesOf = (country, countries = COUNTRIES) =>
  countries.find((c) => c.name === country)?.cities ?? [];

export const isCity = (country, city, countries = COUNTRIES) =>
  citiesOf(country, countries).some(([en]) => en === city);

/* ------------------------------------------------ managed schedule */

/** Weekly hours, Sunday first (JS getDay()): every day 08:00 – midnight by default. */
export const DEFAULT_WEEKLY = Array.from({ length: 7 }, () => ({ open: true, from: '08:00', until: '24:00' }));

const isTime = (v) => typeof v === 'string' && /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/.test(v);
const isIso = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** A country's own calendar: [{ date, from, until }], one entry per date, oldest first. */
const normalizeDates = (list) => {
  const byDate = new Map();
  (Array.isArray(list) ? list : [])
    .filter((d) => isIso(d?.date))
    .forEach((d) =>
      byDate.set(d.date, {
        date: d.date,
        from: isTime(d.from) ? d.from : '08:00',
        until: isTime(d.until) ? d.until : '24:00',
      })
    );
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * The schedule saved from the dashboard (BookingSettings document), with the
 * defaults for anything missing: { countries, weekly, overrides }.
 * Each country also has:
 *  - locked: online booking is paused there (the page shows the salon's contact)
 *  - mode:   'weekly' = the weekly hours and specific dates below,
 *            'dates'  = only the dates of its own calendar (`dates`)
 * Same rules as dash/app/utils/bookingSchedule.ts.
 */
export function normalizeSettings(raw) {
  const countries = (Array.isArray(raw?.countries) ? raw.countries : [])
    .map((c) => ({
      name: String(c?.name || '').trim(),
      ar: String(c?.ar || '').trim(),
      timeZone: String(c?.timeZone || 'Asia/Beirut'),
      cities: (Array.isArray(c?.cities) ? c.cities : [])
        .map((x) => (Array.isArray(x) ? [String(x[0] || '').trim(), String(x[1] || '').trim()] : [String(x || '').trim(), '']))
        .filter((x) => x[0]),
      locked: c?.locked === true,
      mode: c?.mode === 'dates' ? 'dates' : 'weekly',
      dates: normalizeDates(c?.dates),
    }))
    .filter((c) => c.name && c.cities.length);
  const weekly = DEFAULT_WEEKLY.map((def, i) => {
    const w = Array.isArray(raw?.weekly) ? raw.weekly[i] : null;
    if (!w) return { ...def };
    return { open: w.open !== false, from: isTime(w.from) ? w.from : def.from, until: isTime(w.until) ? w.until : def.until };
  });
  const overrides = (Array.isArray(raw?.overrides) ? raw.overrides : [])
    .filter((o) => isIso(o?.date))
    .map((o) => ({
      date: o.date,
      closed: !!o.closed,
      from: isTime(o.from) ? o.from : '08:00',
      until: isTime(o.until) ? o.until : '24:00',
    }));
  return {
    countries: countries.length
      ? countries
      : COUNTRIES.map((c) => ({ ...c, locked: false, mode: 'weekly', dates: [] })),
    weekly,
    overrides,
  };
}

export const DEFAULT_SETTINGS = normalizeSettings(null);

const toMin = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));

/** Start times between two "HH:MM" (until excluded), every 30 minutes. */
export function slotsBetween(from, until) {
  const out = [];
  for (let m = toMin(from); m + SLOT_MINUTES <= toMin(until); m += SLOT_MINUTES)
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return out;
}

/** The appointment country called `name` in the settings (null when unknown). */
export const countryOf = (settings, name) =>
  (settings || DEFAULT_SETTINGS).countries.find((c) => c.name === name) || null;

/**
 * The open start times of a date ("YYYY-MM-DD") in an appointment country:
 *  - a locked country: none;
 *  - a country with its own calendar: that date's hours, nothing on other days;
 *  - otherwise a specific date first, else its weekday.
 */
export function hoursFor(settings, iso, country) {
  const s = settings || DEFAULT_SETTINGS;
  const c = country ? countryOf(s, country) : null;
  if (c?.locked) return [];
  if (c?.mode === 'dates') {
    const own = c.dates.find((x) => x.date === iso);
    return own ? slotsBetween(own.from, own.until) : [];
  }
  const o = s.overrides.find((x) => x.date === iso);
  if (o) return o.closed ? [] : slotsBetween(o.from, o.until);
  const [y, m, d] = iso.split('-').map(Number);
  const day = s.weekly[new Date(y, m - 1, d).getDay()];
  return day?.open ? slotsBetween(day.from, day.until) : [];
}

/** The time zone of an appointment country (Beirut when unknown). */
export const timeZoneOf = (country, countries = COUNTRIES) =>
  countries.find((c) => c.name === country)?.timeZone || 'Asia/Beirut';

/** The moment (ms since epoch) of "YYYY-MM-DD" "HH:mm" in a time zone. */
export function appointmentTime(date, hour, timeZone = 'Asia/Beirut') {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = hour.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (ms) => {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
        .formatToParts(new Date(ms))
        .map((x) => [x.type, x.value])
    );
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - ms;
  };
  const first = guess - offsetAt(guess);
  return guess - offsetAt(first);
}

/**
 * Key of a booked time. Each date + time can be booked once in total (any
 * country or city): as soon as it is booked it disappears for every client.
 * country / city are kept in the signature for the existing callers.
 */
// eslint-disable-next-line no-unused-vars
export const slotKey = (country, city, date, hour) => [date, hour].join('|');
