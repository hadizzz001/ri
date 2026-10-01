import clientPromise from '../../lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Booking tax percentage, set from the dashboard (0 when it isn't set). */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');

    const doc = await db.collection('Tax').findOne({});

    return NextResponse.json({ percent: Number(doc?.percent) || 0 });
  } catch (error) {
    console.error('Error fetching tax:', error);
    return NextResponse.json({ error: 'Failed to fetch tax' }, { status: 500 });
  }
}
