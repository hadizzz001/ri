import clientPromise from '../../lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** "YYYY-MM-DD" of yesterday (UTC), so every time zone's "today" is included. */
const sinceISO = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/**
 * Booking is open every day for every country (see lib/bookingOptions.js), so
 * the booking page only needs the times already taken by upcoming bookings:
 * { taken: [{ country, city, date, hour }] }. Cancelled bookings free theirs.
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

    return NextResponse.json({ taken });
  } catch (error) {
    console.error('Error fetching booked times:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
