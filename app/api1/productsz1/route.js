import clientPromise from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { attachRatings } from "../../lib/ratings";

export const dynamic = "force-dynamic";

// Handle preflight (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

const SORTS = {
  featured: { sort: 1, _id: 1 },
  "best-selling": { orders: -1, _id: 1 },
  "title-asc": { titleLower: 1 },
  "title-desc": { titleLower: -1 },
  "price-asc": { priceNum: 1, _id: 1 },
  "price-desc": { priceNum: -1, _id: 1 },
  newest: { _id: -1 },
  oldest: { _id: 1 },
};

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("Product1");

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const rawSearch = searchParams.get("q");
    const cats = searchParams.getAll("cat").map((c) => c.trimEnd()).filter(Boolean);
    const subs = searchParams.getAll("sub").map((c) => c.trimEnd()).filter(Boolean);
    const brnds = searchParams.getAll("brnd").map((c) => c.trimEnd()).filter(Boolean);
    const sizes = searchParams.getAll("size").map((s) => s.trim()).filter(Boolean);
    const sortKey = searchParams.get("sort") || "featured";
    const minPrice = parseFloat(searchParams.get("minPrice"));
    const maxPrice = parseFloat(searchParams.get("maxPrice"));
    const inStock = searchParams.get("inStock") === "1";
    const onSale = searchParams.get("onSale") === "1";

    const search = rawSearch?.trim();
    const query = {};

    // 🔍 Fuzzy search
    if (search) {
      if (search.toLowerCase() === "moto") {
        query.category = "moto";
      } else {
        const tokens = search.split(/\s+/).filter(Boolean);
        query.$and = tokens.map((token) => ({
          $or: [
            { title: { $regex: token, $options: "i" } },
            { category: { $regex: token, $options: "i" } },
            { sub: { $regex: token, $options: "i" } },
            { factory: { $regex: token, $options: "i" } },
            { "color.sizes.size": { $regex: token, $options: "i" } },
            { "color.name": { $regex: token, $options: "i" } },
          ],
        }));
      }
    }

    // Category / sub / brand filters (trimmed DB values)
    const exprAnd = [];
    if (cats.length > 0) {
      if (cats.includes("yes")) query.arrival = "yes";
      const filteredCats = cats.filter((c) => c !== "yes");
      if (filteredCats.length > 0) exprAnd.push({ $in: [{ $trim: { input: "$category" } }, filteredCats] });
    }
    if (subs.length > 0) exprAnd.push({ $in: [{ $trim: { input: "$sub" } }, subs] });
    if (brnds.length > 0) exprAnd.push({ $in: [{ $trim: { input: "$factory" } }, brnds] });
    if (exprAnd.length === 1) query.$expr = exprAnd[0];
    else if (exprAnd.length > 1) query.$expr = { $and: exprAnd };

    if (sizes.length > 0) query["color.sizes.size"] = { $in: sizes };

    // Derived numeric fields used for price filtering / sorting
    const toNum = (field) => ({
      $convert: {
        input: { $trim: { input: { $toString: { $ifNull: [field, "0"] } } } },
        to: "double",
        onError: 0,
        onNull: 0,
      },
    });

    const addFields = {
      $addFields: {
        priceOrig: toNum("$price"),
        priceDisc: toNum("$discount"),
        titleLower: { $toLower: { $ifNull: ["$title", ""] } },
      },
    };
    // Effective selling price: discount when > 0, otherwise price
    const addEffective = {
      $addFields: {
        priceNum: { $cond: [{ $gt: ["$priceDisc", 0] }, "$priceDisc", "$priceOrig"] },
        isSale: { $and: [{ $gt: ["$priceDisc", 0] }, { $gt: ["$priceOrig", "$priceDisc"] }] },
        stockNum: toNum("$stock"),
        colorQty: {
          $sum: {
            $map: {
              input: { $ifNull: ["$color", []] },
              as: "c",
              in: {
                $add: [
                  toNum("$$c.qty"),
                  { $sum: { $map: { input: { $ifNull: ["$$c.sizes", []] }, as: "s", in: toNum("$$s.qty") } } },
                ],
              },
            },
          },
        },
      },
    };

    const post = {};
    if (!Number.isNaN(minPrice)) post.priceNum = { ...(post.priceNum || {}), $gte: minPrice };
    if (!Number.isNaN(maxPrice)) post.priceNum = { ...(post.priceNum || {}), $lte: maxPrice };
    if (onSale) post.isSale = true;
    if (inStock) {
      post.$or = [
        { type: "single", stockNum: { $gt: 0 } },
        { type: "collection", colorQty: { $gt: 0 } },
        { type: { $nin: ["single", "collection"] } },
      ];
    }

    const basePipeline = [{ $match: query }, addFields, addEffective];
    if (Object.keys(post).length) basePipeline.push({ $match: post });

    const sort = SORTS[sortKey] || SORTS.featured;

    const [countRow] = await collection.aggregate([...basePipeline, { $count: "n" }]).toArray();
    const total = countRow?.n || 0;

    const data = await collection
      .aggregate([
        ...basePipeline,
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        { $project: { priceOrig: 0, priceDisc: 0, titleLower: 0, stockNum: 0, colorQty: 0 } },
      ])
      .toArray();

    await attachRatings(db, data);

    // Price bounds for the whole filtered catalogue (used by the price slider)
    const [bounds] = await collection
      .aggregate([
        { $match: query },
        addFields,
        addEffective,
        { $group: { _id: null, min: { $min: "$priceNum" }, max: { $max: "$priceNum" } } },
      ])
      .toArray();

    return new NextResponse(
      JSON.stringify({
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: page * limit < total,
        priceRange: { min: Math.floor(bounds?.min || 0), max: Math.ceil(bounds?.max || 0) },
        products: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("❌ MongoDB error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
