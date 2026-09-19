import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";
import { AUTH_COOKIE, signSession, sessionCookieOptions, publicUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    const normEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("test");
    const users = db.collection("User");

    const exists = await users.findOne({ email: normEmail });
    if (exists) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const now = new Date();
    const doc = {
      name: name.trim(),
      email: normEmail,
      password: await bcrypt.hash(password, 10),
      phone: phone?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await users.insertOne(doc);

    const token = await signSession({ uid: insertedId.toString(), email: normEmail });
    const res = NextResponse.json({ user: publicUser({ ...doc, _id: insertedId }) }, { status: 201 });
    res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
