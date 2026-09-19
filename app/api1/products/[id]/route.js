import clientPromise from '../../../lib/mongodb'; // Adjust path as needed
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb'; // Import ObjectId for converting id strings
import { attachRatings } from '../../../lib/ratings';


export const revalidate = 10;


export async function GET(request, { params }) {
  const { id } = params;  
  
  try {
    const client = await clientPromise; // Connect to MongoDB
    const db = client.db('test'); // Replace with your database name
    const collection = db.collection('Product1'); // Replace with your collection name

    // Convert id to ObjectId and query the document
    const data = await collection.find({ _id: new ObjectId(id) }).toArray(); 
    await attachRatings(db, data);
    

    return NextResponse.json(data); // Return data as JSON
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
