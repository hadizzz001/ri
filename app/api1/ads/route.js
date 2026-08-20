import clientPromise from '../../lib/mongodb';
import { NextResponse } from 'next/server';

export const revalidate = 10;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('Ad');

    const data = await collection.find({}).toArray();

    const ads = data
      .map((ad) => ({
        id: String(ad._id),
        url: ad.url || '',
        img: Array.isArray(ad.img) ? ad.img : ad.img ? [ad.img] : [],
      }))
      .filter((ad) => ad.img.length > 0);

    return NextResponse.json(ads);
  } catch (error) {
    console.error('Error fetching ads from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}
