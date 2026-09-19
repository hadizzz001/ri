import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

export const AUTH_COOKIE = "rd_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.JWT_SECRET || "rafi-daham-dev-secret-change-me";
  return new TextEncoder().encode(s);
}

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

/** Returns the sanitized user document for the current request, or null. */
export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload?.uid) return null;

  const client = await clientPromise;
  const db = client.db("test");
  const user = await db
    .collection("User")
    .findOne({ _id: new ObjectId(payload.uid) }, { projection: { password: 0 } });
  if (!user) return null;
  return { ...user, _id: user._id.toString() };
}

export function publicUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return { ...rest, _id: rest._id?.toString?.() ?? rest._id };
}
