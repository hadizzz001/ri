import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

/** Orders placed with the signed-in user's email. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ orders: [] }, { status: 401 });

  const client = await clientPromise;
  const db = client.db("test");

  // NOTE: historical schema quirk in Order1 — `userInfo` holds the cart items array
  // and `cartItems` holds the customer form (email, name, address…). The dashboard
  // relies on this, so we match on `cartItems.email` (plus the userId stamp added
  // by /api1/sendOrder for signed-in shoppers).
  const emailRx = new RegExp(`^${user.email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  const orders = await db
    .collection("Order1")
    .find({
      delete: { $ne: true },
      $or: [
        { userId: user._id },
        { userEmail: emailRx },
        { "cartItems.email": emailRx },
        { "userInfo.email": emailRx },
      ],
    })
    .sort({ oid: -1 })
    .limit(50)
    .toArray();

  const shaped = orders.map((o) => {
    const items = Array.isArray(o.userInfo) ? o.userInfo : Array.isArray(o.cartItems) ? o.cartItems : [];
    const customer = o.cartItems && !Array.isArray(o.cartItems) ? o.cartItems : o.userInfo && !Array.isArray(o.userInfo) ? o.userInfo : {};
    return { ...o, _id: o._id.toString(), items, customer };
  });

  return NextResponse.json({ orders: shaped });
}
