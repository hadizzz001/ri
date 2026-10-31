import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { sendClientReminder } from '../../../lib/appointmentEmails';
import { runHourReminders } from '../../../lib/hourReminders';

export const dynamic = 'force-dynamic';

/** YYYY-MM-DD for "today + n days" (UTC based, same format stored in Mongo). */
const dayOffset = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/**
 * Sends reminder emails to clients whose appointment is in 2 days or 1 day.
 * Meant to be hit once a day by a cron job (see vercel.json).
 *
 *   GET /api/booking/reminders            (protected by CRON_SECRET if set)
 *   Authorization: Bearer <CRON_SECRET>   or  ?secret=<CRON_SECRET>
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const auth = request.headers.get('authorization');
    const ok =
      auth === `Bearer ${secret}` || url.searchParams.get('secret') === secret;
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const client = await clientPromise;
    const db = client.db('test');
    const col = db.collection('Booking');

    const report = [];

    for (const daysBefore of [2, 1]) {
      const target = dayOffset(daysBefore);

      const bookings = await col
        .find({
          date: target,
          status: { $ne: 'cancelled' },
          remindersSent: { $ne: daysBefore },
          email: { $exists: true, $ne: '' },
        })
        .toArray();

      for (const booking of bookings) {
        try {
          await sendClientReminder(booking, daysBefore);
          await col.updateOne(
            { _id: booking._id },
            {
              $addToSet: { remindersSent: daysBefore },
              $set: { lastReminderAt: new Date() },
            }
          );
          report.push({ reference: booking.reference, daysBefore, sent: true });
        } catch (e) {
          console.error('Reminder failed for', booking.reference, e?.message || e);
          report.push({
            reference: booking.reference,
            daysBefore,
            sent: false,
            error: e?.message,
          });
        }
      }
    }

    // Bookings that just came inside Resend's scheduling window get their
    // "in 1 hour" reminder scheduled
    const hour = await runHourReminders(db).catch((e) => {
      console.error('1-hour reminder scheduling failed:', e?.message || e);
      return [];
    });

    return NextResponse.json({ success: true, processed: report.length, report, hour });
  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json({ error: 'Reminder job failed' }, { status: 500 });
  }
}
