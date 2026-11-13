import clientPromise from '../../lib/mongodb';
import { NextResponse } from 'next/server';
import { outsideFactorOf } from '../../lib/bookingPrice';

export const dynamic = 'force-dynamic';

/**
 * Appointment prices set from the dashboard ("Prices & Tax" page): the tax
 * percentage (0 when it isn't set) and the outside-Lebanon price multiplier
 * (4 when it isn't set).
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');

    const doc = await db.collection('Tax').findOne({});

    return NextResponse.json({
      percent: Number(doc?.percent) || 0,
      outsideFactor: outsideFactorOf(doc?.outsideFactor),
    });
  } catch (error) {
    console.error('Error fetching tax:', error);
    return NextResponse.json({ error: 'Failed to fetch tax' }, { status: 500 });
  }
}
