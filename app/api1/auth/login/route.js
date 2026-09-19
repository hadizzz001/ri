import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";
import { AUTH_COOKIE, signSession, sessionCookieOptions, publicUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("test");
    const user = await db.collection("User").findOne({ email: email.trim().toLowerCase() });

    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const token = await signSession({ uid: user._id.toString(), email: user.email });
    const res = NextResponse.json({ user: publicUser(user) });
    res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
