import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { getCurrentUser } from "../../lib/auth";
import { ratingSummary } from "../../lib/ratings";
import { notifyReview } from "../../lib/notifications";

export const dynamic = "force-dynamic";

/** GET ?productId=… → { summary, reviews, mine } */
export async function GET(req) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId || !ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("test");
  const pid = new ObjectId(productId);

  const [summary, reviews, user] = await Promise.all([
    ratingSummary(db, pid),
    db
      .collection("Review")
      .find({ productId: pid, approved: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray(),
    getCurrentUser(),
  ]);

  const clean = reviews.map((r) => ({
    _id: r._id.toString(),
    userName: r.userName,
    rating: r.rating,
    title: r.title || "",
    comment: r.comment,
    verified: !!r.verified,
    createdAt: r.createdAt,
    mine: user ? r.userId.toString() === user._id : false,
  }));

  return NextResponse.json({
    summary,
    reviews: clean,
    canReview: !!user,
    mine: clean.find((r) => r.mine) || null,
  });
}

/** POST { productId, rating, title, comment } → creates or updates the user's review */
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to write a review." }, { status: 401 });

  const { productId, rating, title, comment } = await req.json();
  const r = parseInt(rating, 10);
  if (!productId || !ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }
  if (!(r >= 1 && r <= 5)) return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  if (!comment?.trim()) return NextResponse.json({ error: "Please write a review." }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("test");
  const pid = new ObjectId(productId);
  const uid = new ObjectId(user._id);

  // verified = user has a paid order containing this product
  const paidOrder = await db.collection("Order1").findOne({
    paid: true,
    "userInfo.email": user.email,
    cartItems: { $elemMatch: { _id: productId } },
  });

  const saved = await db.collection("Review").updateOne(
    { productId: pid, userId: uid },
    {
      $set: {
        userName: user.name,
        rating: r,
        title: (title || "").trim().slice(0, 120),
        comment: comment.trim().slice(0, 3000),
        verified: !!paidOrder,
        approved: true,
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  if (saved.upsertedCount) {
    const product = await db.collection("Product1").findOne({ _id: pid }, { projection: { title: 1 } }).catch(() => null);
    await notifyReview(db, { name: user.name, product: product?.title, rating: r });
  }

  const summary = await ratingSummary(db, pid);
  return NextResponse.json({ ok: true, summary });
}

/** DELETE ?productId=… → removes current user's review */
export async function DELETE(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId || !ObjectId.isValid(productId)) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db("test");
  await db.collection("Review").deleteOne({ productId: new ObjectId(productId), userId: new ObjectId(user._id) });
  return NextResponse.json({ ok: true });
}
