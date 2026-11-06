/**
 * Notifications: one `Notification` collection in the database shared with the
 * dashboard (dash/app/api/notifications/notify.ts writes the same documents).
 *
 *   audience 'admin'   shown by the dashboard's bell
 *   audience 'client'  shown by the website's bell, to the people in `owners`
 *   actor              who did it: 'client' or 'admin'
 *   type + params      what happened; each app writes its own wording when it
 *                      shows them, so the website can follow the client's language
 *
 * A notification never gets in the way of what caused it: failures are only
 * logged. Server only.
 */
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getCurrentUser } from './auth';

const COLLECTION = 'Notification';
const KEEP_FOR_SECONDS = 180 * 24 * 60 * 60;

/** Remembers the browser of a client who booked without an account. */
export const GUEST_COOKIE = 'rd_guest';

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

export const guestCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 365 * 24 * 60 * 60,
});

/**
 * The guest behind this request. `key` goes in the cookie, `hash` on the
 * guest's bookings and notifications, so reading a stored document never gives
 * anybody the value of the cookie.
 */
export function guestSession() {
  const key = cookies().get(GUEST_COOKIE)?.value || crypto.randomUUID();
  return { key, hash: sha256(key) };
}

/** The ways a client can be recognised; a notification lists the ones it knows. */
export const ownerKeys = ({ userId, email, guestKey }) =>
  [
    userId && `user:${userId}`,
    email && `email:${String(email).trim().toLowerCase()}`,
    guestKey && `guest:${guestKey}`,
  ].filter(Boolean);

/** Who is asking, as owner keys ([] for a visitor who has never booked). */
export async function viewerKeys() {
  const user = await getCurrentUser().catch(() => null);
  if (user) return ownerKeys({ userId: user._id, email: user.email });
  const key = cookies().get(GUEST_COOKIE)?.value;
  return key ? ownerKeys({ guestKey: sha256(key) }) : [];
}

export const notificationsOf = (db) => db.collection(COLLECTION);

let indexing = null;

/** Same indexes as the dashboard's notify.ts. Old notifications delete themselves. */
const ensureIndexes = (col) => {
  indexing ||= col
    .createIndexes([
      { key: { audience: 1, _id: -1 }, name: 'audience_recent' },
      { key: { owners: 1, _id: -1 }, name: 'owners_recent' },
      { key: { createdAt: 1 }, name: 'expire_old', expireAfterSeconds: KEEP_FOR_SECONDS },
    ])
    .catch((e) => console.error('Notification indexes failed:', e?.message || e));
  return indexing;
};

async function add(db, docs) {
  try {
    const col = notificationsOf(db);
    await ensureIndexes(col);
    const createdAt = new Date();
    await col.insertMany(docs.map((d) => ({ readAt: null, createdAt, ...d })));
  } catch (e) {
    console.error('Saving a notification failed:', e?.message || e);
  }
}

/**
 * A client booked or cancelled on the website: the salon's bell and the
 * client's. `type` is booking.created, booking.short_notice or booking.cancelled.
 */
export const notifyBooking = (db, type, booking, { orderId } = {}) => {
  const place = { reference: booking.reference, date: booking.date, hour: booking.hour, city: booking.city, country: booking.country };
  const owners = ownerKeys(booking);
  return add(db, [
    {
      audience: 'admin',
      type,
      actor: 'client',
      orderId: orderId ? String(orderId) : null,
      params: {
        ...place,
        name: booking.name,
        phone: booking.phone,
        serviceType: booking.serviceType,
        services: (booking.cart || []).map((i) => i.title).join(', '),
        total: String(booking.total ?? ''),
      },
    },
    ...(owners.length ? [{ audience: 'client', type, actor: 'client', owners, params: place }] : []),
  ]);
};

/** A client placed a shop order. */
export const notifyShopOrder = (db, order) => {
  const params = { oid: String(order.oid), total: String(order.total ?? '') };
  const owners = ownerKeys(order);
  return add(db, [
    {
      audience: 'admin',
      type: 'order.created',
      actor: 'client',
      orderId: String(order._id),
      params: { ...params, name: order.name, count: String(order.count) },
    },
    ...(owners.length ? [{ audience: 'client', type: 'order.created', actor: 'client', owners, params }] : []),
  ]);
};

/** A client wrote their first review of a product: the salon's bell only. */
export const notifyReview = (db, { name, product, rating }) =>
  add(db, [
    {
      audience: 'admin',
      type: 'review.created',
      actor: 'client',
      orderId: null,
      params: { name, product: product || '', rating: String(rating) },
    },
  ]);
