/**
 * A signed-in client's own appointments (My account → Appointments):
 * bookings made while signed in, or with the account's email address.
 */

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Mongo filter for the bookings that belong to `user`. */
export const ownBookingsFilter = (user) => ({
  $or: [
    { userId: user._id },
    { email: new RegExp(`^${escapeRegex(String(user.email).trim())}$`, 'i') },
  ],
});

/** What My account gets to see of a booking. */
export const shapeBooking = (b) => ({
  _id: String(b._id),
  reference: b.reference,
  country: b.country,
  city: b.city,
  date: b.date,
  hour: b.hour,
  serviceType: b.serviceType,
  cart: (b.cart || []).map(({ id, title, qty, price, duration }) => ({ id, title, qty, price, duration })),
  subtotal: b.subtotal,
  homeFee: b.homeFee,
  taxPercent: b.taxPercent,
  tax: b.tax,
  total: b.total,
  deposit: b.deposit,
  notes: b.notes,
  status: b.status || 'pending',
  shortNotice: !!b.shortNotice,
  createdAt: b.createdAt,
  cancelledAt: b.cancelledAt || null,
});

/** "YYYY-MM-DD" of yesterday (UTC): appointments from then on can still be cancelled. */
export const cancellableFrom = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};
