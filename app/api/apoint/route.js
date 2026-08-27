import clientPromise from '../../lib/mongodb'; // Adjust path as needed
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const todayISO = () => new Date().toISOString().slice(0, 10);

export async function GET() {
  try {
    const client = await clientPromise; // Connect to MongoDB
    const db = client.db('test');

    const data = await db.collection('Appointment').find({}).toArray();

    // Slots already taken by real bookings (upcoming only)
    const bookings = await db
      .collection('Booking')
      .find(
        { date: { $gte: todayISO() }, status: { $ne: 'cancelled' } },
        { projection: { country: 1, city: 1, date: 1, hour: 1 } }
      )
      .toArray();

    const taken = new Set(
      bookings.map((b) => `${b.country}|${b.city}|${b.date}|${b.hour}`)
    );

    // Merge the live bookings into the availability payload
    const merged = data.map((doc) => {
      const info = doc.info || {};
      return {
        ...doc,
        info: {
          ...info,
          dates: (info.dates || []).map((d) => {
            const day = String(d.date).split('T')[0];
            return {
              ...d,
              date: day,
              hours: (d.hours || []).map((h) => ({
                ...h,
                booked:
                  !!h.booked ||
                  taken.has(`${info.country}|${info.city}|${day}|${h.hour}`),
              })),
            };
          }),
        },
      };
    });

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
