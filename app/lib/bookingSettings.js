import { normalizeSettings } from './bookingOptions.js';

/** The booking schedule saved from the dashboard (or the defaults). Server only. */
export async function getBookingSettings(db) {
  try {
    const doc = await db.collection('BookingSettings').findOne({});
    return normalizeSettings(doc);
  } catch (e) {
    console.error('Booking settings read failed:', e?.message || e);
    return normalizeSettings(null);
  }
}
