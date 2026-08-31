import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export const revalidate = 10;

// GET /api/servicedata/[id]  -> all ServiceData rows belonging to service [id]
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('ServiceData');

    // serviceId may be stored as an ObjectId (Prisma) or a plain string
    const ids = [id];
    if (ObjectId.isValid(id)) ids.push(new ObjectId(id));

    const data = await collection.find({ serviceId: { $in: ids } }).toArray();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
