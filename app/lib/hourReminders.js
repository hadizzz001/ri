import { sendHourReminders } from './appointmentEmails.js';
import { cancelScheduledEmail } from './mailer.js';
import { appointmentTime, timeZoneOf } from './bookingOptions.js';
import { getBookingSettings } from './bookingSettings.js';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
/** Resend accepts scheduled emails up to 30 days ahead; keep a margin. */
const MAX_AHEAD = 29 * DAY;
const LIVE = { $nin: ['cancelled', 'no-show', 'completed'] };

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * "In 1 hour" reminder (client + salon) for one booking, using Resend's
 * scheduled sending: the emails are handed to Resend right away with
 * `scheduled_at` = appointment − 1 hour, and Resend delivers them then.
 *
 *  - Less than 1 hour left: sent immediately, unless it was booked that late
 *    (a client who has only just booked needs no reminder).
 *  - More than 29 days ahead: left for later (the daily cron schedules it
 *    once it is inside Resend's window).
 *
 * The Resend ids are stored on the Booking (hourReminderIds) so the emails
 * can be cancelled when the appointment is cancelled or moved.
 * @returns {Promise<'scheduled'|'sent'|'later'|'past'|'skipped'|'failed'>}
 */
export async function scheduleHourReminder(db, booking, settings) {
  const col = db.collection('Booking');
  if (!booking?.date || !booking?.hour || LIVE.$nin.includes(booking.status)) return 'skipped';
  if ((booking.remindersSent || []).includes('hour')) return 'skipped';

  const s = settings || (await getBookingSettings(db));
  const start = appointmentTime(booking.date, booking.hour, timeZoneOf(booking.country, s.countries));
  const sendAt = start - HOUR;
  const now = Date.now();
  if (start <= now) return 'past';
  if (sendAt - now > MAX_AHEAD) return 'later';
  if (booking.createdAt && new Date(booking.createdAt).getTime() > sendAt) return 'skipped';

  // Claim it first so two calls never schedule it twice
  const claim = await col.updateOne(
    { _id: booking._id, remindersSent: { $ne: 'hour' } },
    { $addToSet: { remindersSent: 'hour' } }
  );
  if (!claim.modifiedCount) return 'skipped';

  const scheduledAt = sendAt - now > 2 * MIN ? new Date(sendAt).toISOString() : undefined;
  const res = await sendHourReminders(booking, { scheduledAt }).catch((e) => {
    console.error('1-hour reminder failed for', booking.reference, e?.message || e);
    return { client: false, salon: false, ids: [] };
  });

  if (!res.client && !res.salon) {
    await col.updateOne({ _id: booking._id }, { $pull: { remindersSent: 'hour' } });
    return 'failed';
  }
  await col.updateOne(
    { _id: booking._id },
    { $set: { hourReminderIds: res.ids || [], hourReminderAt: new Date(sendAt), lastReminderAt: new Date() } }
  );
  return scheduledAt ? 'scheduled' : 'sent';
}

/** Cancels a booking's scheduled "in 1 hour" emails on Resend and clears them. */
export async function cancelHourReminder(db, booking) {
  const ids = booking?.hourReminderIds || [];
  await Promise.all(ids.map(cancelScheduledEmail));
  await db
    .collection('Booking')
    .updateOne({ _id: booking._id }, { $set: { hourReminderIds: [] }, $pull: { remindersSent: 'hour' } });
}

/**
 * Schedules the reminder of every live upcoming booking that doesn't have
 * one yet (new bookings from the dashboard, moved ones, ones that just came
 * inside Resend's 29-day window). Safe to run as often as you like.
 */
export async function runHourReminders(db) {
  const now = Date.now();
  const settings = await getBookingSettings(db);
  const bookings = await db
    .collection('Booking')
    .find({
      date: { $gte: isoDay(now - DAY), $lte: isoDay(now + MAX_AHEAD + 2 * DAY) },
      status: LIVE,
      remindersSent: { $ne: 'hour' },
    })
    .toArray();

  const report = [];
  for (const b of bookings) {
    const result = await scheduleHourReminder(db, b, settings);
    if (result !== 'skipped') report.push({ reference: b.reference, date: b.date, hour: b.hour, result });
  }
  return report;
}

let lastRun = 0;

/** At most once every 5 minutes per server instance (used by busy endpoints). */
export async function maybeRunHourReminders(db) {
  if (Date.now() - lastRun < 5 * MIN) return;
  lastRun = Date.now();
  try {
    await runHourReminders(db);
  } catch (e) {
    console.error('1-hour reminders failed:', e?.message || e);
  }
}
