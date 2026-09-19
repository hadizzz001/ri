import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { getCurrentUser } from "../../lib/auth";
import { attachRatings } from "../../lib/ratings";

export const dynamic = "force-dynamic";

/** GET → { ids: string[], products: Product[] } for the current user */
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ids: [], products: [] });

  const client = await clientPromise;
  const db = client.db("test");

  const favs = await db
    .collection("Favorite")
    .find({ userId: new ObjectId(user._id) })
    .sort({ createdAt: -1 })
    .toArray();

  const ids = favs.map((f) => f.productId);
  const withProducts = new URL(req.url).searchParams.get("full") === "1";

  let products = [];
  if (withProducts && ids.length) {
    products = await db.collection("Product1").find({ _id: { $in: ids } }).toArray();
    // keep wishlist order
    const order = new Map(ids.map((id, i) => [id.toString(), i]));
    products.sort((a, b) => order.get(a._id.toString()) - order.get(b._id.toString()));
    await attachRatings(db, products);
  }

  return NextResponse.json({ ids: ids.map((i) => i.toString()), products });
}

/** POST { productId } → toggles favorite; returns { favorited, ids } */
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to save favourites." }, { status: 401 });

  const { productId } = await req.json();
  if (!productId || !ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("test");
  const col = db.collection("Favorite");
  const key = { userId: new ObjectId(user._id), productId: new ObjectId(productId) };

  const existing = await col.findOne(key);
  let favorited;
  if (existing) {
    await col.deleteOne({ _id: existing._id });
    favorited = false;
  } else {
    await col.insertOne({ ...key, createdAt: new Date() });
    favorited = true;
  }

  const ids = (await col.find({ userId: key.userId }).toArray()).map((f) => f.productId.toString());
  return NextResponse.json({ favorited, ids });
}
