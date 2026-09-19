import { ObjectId } from "mongodb";

/**
 * Attaches `rating: { avg, count }` to each product (mutates + returns array).
 * Products may carry `_id` as ObjectId or string.
 */
export async function attachRatings(db, products) {
  if (!Array.isArray(products) || products.length === 0) return products;

  const ids = products
    .map((p) => {
      try {
        return p._id instanceof ObjectId ? p._id : new ObjectId(String(p._id));
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const rows = await db
    .collection("Review")
    .aggregate([
      { $match: { productId: { $in: ids }, approved: { $ne: false } } },
      {
        $group: {
          _id: "$productId",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const map = new Map(rows.map((r) => [r._id.toString(), r]));

  for (const p of products) {
    const r = map.get(String(p._id));
    p.rating = r
      ? { avg: Math.round(r.avg * 10) / 10, count: r.count }
      : { avg: 0, count: 0 };
  }
  return products;
}

/** Full summary for a single product: avg, count and 1..5 histogram. */
export async function ratingSummary(db, productId) {
  const pid = new ObjectId(String(productId));
  const rows = await db
    .collection("Review")
    .aggregate([
      { $match: { productId: pid, approved: { $ne: false } } },
      { $group: { _id: "$rating", n: { $sum: 1 } } },
    ])
    .toArray();

  const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const r of rows) {
    histogram[r._id] = r.n;
    total += r.n;
    sum += r._id * r.n;
  }
  return {
    avg: total ? Math.round((sum / total) * 10) / 10 : 0,
    count: total,
    histogram,
  };
}
