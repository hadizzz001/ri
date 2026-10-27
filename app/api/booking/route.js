import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import { getCurrentUser } from '../../lib/auth';
import { sendClientConfirmation } from '../../lib/appointmentEmails';
import { SERVICE_TYPES, bookingTotals, locationFactor } from '../../lib/bookingPrice';
import { OPEN_HOURS, isCity } from '../../lib/bookingOptions';

export const dynamic = 'force-dynamic';

/** First booking step: does the client want a hijab-wearing team member? */
const STAFF_OPTIONS = ['hijab', 'regular'];

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));

const makeReference = () =>
  'RD-' + Math.random().toString(36).slice(2, 8).toUpperCase();

/** "YYYY-MM-DD" of yesterday (UTC): the earliest date accepted, so every time zone's "today" passes. */
const earliestDate = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      notes = '',
      date,
      hour,
      serviceType,
      cart = [],
      lang = 'en',
      staff,
    } = body;
    const country = String(body.country || '').trim();
    const city = String(body.city || '').trim();

    if (!name || !phone || !isEmail(email) || !country || !city || !date || !hour) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    // Lebanon, KSA and Kuwait are open every day, 08:00–23:30; the choices must still be real ones
    if (!isCity(country, city)) {
      return NextResponse.json({ error: 'Please choose your country and city' }, { status: 400 });
    }
    if (!isDate(date) || date < earliestDate() || !OPEN_HOURS.includes(hour)) {
      return NextResponse.json({ error: 'Please choose another date and time' }, { status: 400 });
    }
    if (!STAFF_OPTIONS.includes(staff)) {
      return NextResponse.json({ error: 'Please choose your preference (Hijab or not)' }, { status: 400 });
    }
    if (!SERVICE_TYPES.includes(serviceType)) {
      return NextResponse.json({ error: 'Please choose salon or home service' }, { status: 400 });
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'No services selected' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('test');

    // ---- Re-price server side from the DB so prices can never be tampered with.
    // Seeded services have readable string ids, services added from the
    // dashboard have ObjectIds, so each id is looked up in both forms.
    const ids = cart.map((c) => String(c.id));
    const services = await db
      .collection('Product')
      .find({
        _id: { $in: [...ids, ...ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id))] },
      })
      .toArray();

    const priceFactor = locationFactor(country);

    const lineItems = cart
      .map((c) => {
        const svc = services.find((s) => String(s._id) === String(c.id));
        if (!svc) return null;
        const qty = Math.max(1, Number(c.qty) || 1);
        return {
          id: String(svc._id),
          title: svc.title,
          cat: svc.cat,
          duration: svc.duration || null,
          price: Number(svc.price) * priceFactor,
          qty,
        };
      })
      .filter(Boolean);

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'Selected services not found' }, { status: 400 });
    }

    // Tax percentage is set from the dashboard (one document, absent = no
    // tax); Beirut is tax free and only bookings abroad take a deposit
    const taxDoc = await db.collection('Tax').findOne({});
    const { subtotal, homeFee, taxPercent, tax, total, deposit } = bookingTotals(lineItems, {
      country,
      city,
      serviceType,
      taxPercent: taxDoc?.percent,
    });
    const reference = makeReference();

    // ---- Make sure the slot is still free (the city in any letter case), and take it
    const taken = await db.collection('Booking').findOne(
      { date, hour, status: { $ne: 'cancelled' } },
      { collation: { locale: 'en', strength: 2 } }
    );
    if (taken) {
      return NextResponse.json(
        { error: 'This time slot has just been taken. Please pick another one.' },
        { status: 409 }
      );
    }

    // A signed-in client sees the booking (and can cancel it) under My account
    const user = await getCurrentUser().catch(() => null);

    const booking = {
      reference,
      name,
      phone,
      email,
      notes,
      country,
      city,
      date, // YYYY-MM-DD
      hour, // HH:mm
      lang: ['ar', 'fr'].includes(lang) ? lang : 'en',
      staff, // 'hijab' | 'regular' — shown as the team column on the dashboard
      serviceType, // 'salon' | 'home'
      cart: lineItems,
      subtotal,
      homeFee,
      taxPercent,
      tax,
      total,
      deposit,
      status: 'confirmed', // booked = confirmed, the time is taken right away
      remindersSent: [], // e.g. [2, 1]
      ...(user ? { userId: user._id } : {}),
      createdAt: new Date(),
    };

    const result = await db.collection('Booking').insertOne(booking);

    // Keep the legacy `Order` collection in sync (amounts as strings, as the
    // dashboard's Prisma `Order` model reads them)
    await db.collection('Order').insertOne({
      ...booking,
      subtotal: String(subtotal),
      homeFee: String(homeFee),
      taxPercent: String(taxPercent),
      tax: String(tax),
      total: String(total),
      bookingId: result.insertedId,
    });

    // ---- Email (never block the booking if the provider fails).
    // Only the client gets an email; the salon receives the booking
    // details through the WhatsApp handoff.
    const emailResults = { client: false };
    try {
      await sendClientConfirmation(booking);
      emailResults.client = true;
    } catch (e) {
      console.error('Client confirmation email failed:', e?.message || e);
    }

    return NextResponse.json({
      success: true,
      reference,
      insertedId: result.insertedId,
      city,
      serviceType,
      subtotal,
      homeFee,
      taxPercent,
      tax,
      total,
      deposit,
      cart: lineItems,
      emailResults,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
