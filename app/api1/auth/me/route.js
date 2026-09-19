import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

/** GET → current user (or null) */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

/** PATCH → update name / phone */
export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { name, phone } = await req.json();
  const client = await clientPromise;
  const db = client.db("test");
  await db.collection("User").updateOne(
    { _id: new ObjectId(user._id) },
    { $set: { ...(name ? { name: name.trim() } : {}), phone: phone?.trim() || null, updatedAt: new Date() } }
  );
  const fresh = await getCurrentUser();
  return NextResponse.json({ user: fresh });
}
