/**
 * Generates the studio availability (Appointment collection) for Beirut,
 * matching the salon opening times: Tue–Sat, 10:00 → 19:00, 30-minute slots.
 *
 * Run:  npm run seed:availability
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const { MongoClient } = require('mongodb');

const COUNTRY = 'Lebanon';
const CITY = 'Beirut';
const DAYS_AHEAD = 90;
const OPEN_DAYS = [2, 3, 4, 5, 6]; // Tue..Sat (0 = Sunday)
const OPEN_HOUR = 10;
const CLOSE_HOUR = 19;
const STEP_MINUTES = 30;

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

const buildHours = () => {
  const hours = [];
  for (let m = OPEN_HOUR * 60; m < CLOSE_HOUR * 60; m += STEP_MINUTES) {
    hours.push({
      hour: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
      booked: false,
    });
  }
  return hours;
};

(async () => {
  const client = new MongoClient(process.env.DATABASE_URL, { family: 4 });
  await client.connect();
  const db = client.db('test');

  const dates = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i <= DAYS_AHEAD; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (!OPEN_DAYS.includes(d.getDay())) continue;
    dates.push({ date: iso(d), hours: buildHours() });
  }

  // Preserve slots that are already booked
  const existing = await db
    .collection('Appointment')
    .findOne({ 'info.country': COUNTRY, 'info.city': CITY });

  if (existing) {
    const bookedMap = new Map();
    (existing.info.dates || []).forEach((d) => {
      const key = String(d.date).split('T')[0];
      (d.hours || []).forEach((h) => {
        if (h.booked) bookedMap.set(`${key}|${h.hour}`, true);
      });
    });
    dates.forEach((d) =>
      d.hours.forEach((h) => {
        if (bookedMap.has(`${d.date}|${h.hour}`)) h.booked = true;
      })
    );
  }

  await db
    .collection('Appointment')
    .updateOne(
      { 'info.country': COUNTRY, 'info.city': CITY },
      { $set: { info: { country: COUNTRY, city: CITY, dates } } },
      { upsert: true }
    );

  console.log(
    `Availability set for ${CITY}, ${COUNTRY}: ${dates.length} open days × ${dates[0].hours.length} slots.`
  );
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
