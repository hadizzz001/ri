/**
 * Clears every "booked" flag in the availability calendar for a location.
 * Useful after testing.  Usage:  node scripts/reset-slots.js [City]
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const { MongoClient } = require('mongodb');

const CITY = process.argv[2] || 'Beirut';

(async () => {
  const client = new MongoClient(process.env.DATABASE_URL, { family: 4 });
  await client.connect();
  const db = client.db('test');

  const doc = await db.collection('Appointment').findOne({ 'info.city': CITY });
  if (!doc) {
    console.log(`No availability document found for "${CITY}".`);
    await client.close();
    return;
  }

  doc.info.dates.forEach((d) => d.hours.forEach((h) => (h.booked = false)));
  await db
    .collection('Appointment')
    .updateOne({ _id: doc._id }, { $set: { info: doc.info } });

  console.log(`All slots for ${CITY} reset to available.`);
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
