/**
 * Where and when an appointment can be booked, shared by the booking page and
 * /api/booking (which re-checks every choice).
 *
 *  - Every day is open, 08:00 to midnight: a start time every 30 minutes,
 *    the last one at 23:30. A time stays free until somebody books it.
 *  - The countries are Lebanon, KSA and Kuwait, and the city is picked from
 *    the country's list below (Beirut is tax free, see bookingPrice.js).
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

/** The countries that can be booked and their cities, capital first: [English, Arabic]. */
export const COUNTRIES = [
  { name: LEBANON, ar: 'لبنان', cities: LEBANON_CITIES },
  { name: 'KSA', ar: 'السعودية', cities: [['Riyadh', 'الرياض'], ['Jeddah', 'جدة']] },
  { name: 'Kuwait', ar: 'الكويت', cities: [['Kuwait City', 'مدينة الكويت']] },
];

/** A country's [English, Arabic] cities ([] for a country that can't be booked). */
export const citiesOf = (country) => COUNTRIES.find((c) => c.name === country)?.cities ?? [];

export const isCity = (country, city) => citiesOf(country).some(([en]) => en === city);

/** Key of a booked time; the city is compared without regard to case. */
export const slotKey = (country, city, date, hour) =>
  [country, String(city ?? '').toLowerCase(), date, hour].join('|');
