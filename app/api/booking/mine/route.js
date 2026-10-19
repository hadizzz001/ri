import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { getCurrentUser } from '../../../lib/auth';
import { ownBookingsFilter, shapeBooking } from '../../../lib/clientBookings';

export const dynamic = 'force-dynamic';

/** The signed-in client's appointments, latest date first. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ bookings: [] }, { status: 401 });

  try {
    const client = await clientPromise;
    const db = client.db('test');

    const bookings = await db
      .collection('Booking')
      .find(ownBookingsFilter(user))
      .sort({ date: -1, hour: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ bookings: bookings.map(shapeBooking) });
  } catch (error) {
    console.error('My bookings error:', error);
    return NextResponse.json({ error: 'Could not load your appointments' }, { status: 500 });
  }
}
