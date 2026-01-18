import clientPromise from '../../lib/mongodb';
import { NextResponse } from 'next/server';

export const revalidate = 10;

export async function POST(request) {
  try {
    // Get the JSON body
    const body = await request.json();
    const { name, phone, email, country, city, date, hour, cart, total } = body;

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('test'); // Replace with your DB name
    const collection = db.collection('Order'); // Replace with your collection name

    // Current date in format 01/January/2022
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${currentDate.toLocaleString('default', { month: 'long' })}/${currentDate.getFullYear()}`;

    // Insert the order
    const result = await collection.insertOne({
      name,       // store at top level if you want Prisma later
      phone,
      email,
      country,
      city,
      date,
      hour,
      cart,
      total: total.toString(),
    });

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 });
  }
}
