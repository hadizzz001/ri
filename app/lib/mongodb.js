import { MongoClient } from 'mongodb';

const uri = process.env.DATABASE_URL; // Add this to your .env.local file
const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  family: 4, // force IPv4 - avoids slow/failing IPv6 lookups on mobile networks
  maxPoolSize: 10,
};

let client;
let clientPromise;

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
