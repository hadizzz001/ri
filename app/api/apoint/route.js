import clientPromise from '../../lib/mongodb';
import { NextResponse } from 'next/server';
import { getBookingSettings } from '../../lib/bookingSettings';
import { maybeRunHourReminders } from '../../lib/hourReminders';

export const dynamic = 'force-dynamic';

/** "YYYY-MM-DD" of yesterday (UTC), so every time zone's "today" is included. */
const sinceISO = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/**
 * What the booking page needs: the times already taken by upcoming bookings
 * ({ country, city, date, hour }, cancelled ones free theirs) and the
 * schedule managed from the dashboard (countries, days & hours).
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');

    const taken = await db
      .collection('Booking')
      .find(
        { date: { $gte: sinceISO() }, status: { $ne: 'cancelled' } },
        { projection: { _id: 0, country: 1, city: 1, date: 1, hour: 1 } }
      )
      .toArray();

    // Backup for the scheduler: send any due "in 1 hour" reminders
    await maybeRunHourReminders(db);

    return NextResponse.json({ taken, settings: await getBookingSettings(db) });
  } catch (error) {
    console.error('Error fetching booked times:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
