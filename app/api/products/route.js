import clientPromise from '../../lib/mongodb'; // Adjust path as needed
import { NextResponse } from 'next/server';

// Prices and descriptions are edited on the dashboard: always read them fresh
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise; // Connect to MongoDB
    const db = client.db('test'); // Replace with your database name
    const collection = db.collection('Product'); // Replace with your collection name

    // Services are ordered by category then by their position inside the category
    const data = await collection
      .find({})
      .sort({ catOrder: 1, order: 1 })
      .toArray();

    return NextResponse.json(data); // Return data as JSON
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
