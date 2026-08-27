import { NextResponse } from 'next/server';
import clientPromise from '../../lib/mongodb';
import { sendClientConfirmation } from '../../lib/appointmentEmails';

export const dynamic = 'force-dynamic';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));

const makeReference = () =>
  'RD-' + Math.random().toString(36).slice(2, 8).toUpperCase();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      notes = '',
      country,
      city,
      date,
      hour,
      cart = [],
      lang = 'en',
    } = body;

    if (!name || !phone || !isEmail(email) || !country || !city || !date || !hour) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'No services selected' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('test');

    // ---- Re-price server side from the DB so prices can never be tampered with
    const services = await db
      .collection('Product')
      .find({ _id: { $in: cart.map((c) => c.id) } })
      .toArray();

    const outsideLebanon = country !== 'Lebanon';
    const priceFactor = outsideLebanon ? 4 : 1;

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

    const total = lineItems.reduce((a, i) => a + i.price * i.qty, 0);
    const deposit = Number((total * 0.25).toFixed(2));
    const reference = makeReference();

    // ---- Make sure the slot is still free, and take it
    const taken = await db.collection('Booking').findOne({
      country,
      city,
      date,
      hour,
      status: { $ne: 'cancelled' },
    });
    if (taken) {
      return NextResponse.json(
        { error: 'This time slot has just been taken. Please pick another one.' },
        { status: 409 }
      );
    }

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
      lang: lang === 'ar' ? 'ar' : 'en',
      cart: lineItems,
      total,
      deposit,
      status: 'pending',
      remindersSent: [], // e.g. [2, 1]
      createdAt: new Date(),
    };

    const result = await db.collection('Booking').insertOne(booking);

    // Keep the legacy `Order` collection in sync
    await db.collection('Order').insertOne({
      ...booking,
      total: String(total),
      bookingId: result.insertedId,
    });

    // Flag the hour as booked inside the Appointment availability document
    await db.collection('Appointment').updateOne(
      { 'info.country': country, 'info.city': city },
      { $set: { 'info.dates.$[d].hours.$[h].booked': true } },
      {
        arrayFilters: [
          { 'd.date': { $regex: `^${date}` } },
          { 'h.hour': hour },
        ],
      }
    );

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
