import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';
import { getCurrentUser } from '../../../lib/auth';
import { sendCancellationEmails } from '../../../lib/appointmentEmails';
import { cancelHourReminder } from '../../../lib/hourReminders';
import { cancellableFrom, ownBookingsFilter, shapeBooking } from '../../../lib/clientBookings';
import { notifyBooking } from '../../../lib/notifications';

export const dynamic = 'force-dynamic';

/**
 * Cancels one of the signed-in client's upcoming appointments: the booking
 * and its dashboard copy (`Order`) are marked cancelled, which frees the
 * time for others, then the client and the salon are both emailed.
 *
 *   POST /api/booking/cancel   { id }
 */
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('test');
    const _id = new ObjectId(id);

    const booking = await db.collection('Booking').findOne({ _id, ...ownBookingsFilter(user) });
    if (!booking) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'This appointment is already cancelled.' }, { status: 409 });
    }
    if (String(booking.date) < cancellableFrom()) {
      return NextResponse.json({ error: 'This appointment has already taken place.' }, { status: 400 });
    }

    const change = { status: 'cancelled', cancelledAt: new Date(), cancelledBy: 'client' };
    const { modifiedCount } = await db
      .collection('Booking')
      .updateOne({ _id, status: { $ne: 'cancelled' } }, { $set: change });
    if (!modifiedCount) {
      return NextResponse.json({ error: 'This appointment is already cancelled.' }, { status: 409 });
    }
    await db.collection('Order').updateMany({ bookingId: _id }, { $set: change });
    await cancelHourReminder(db, booking).catch((e) =>
      console.error('Cancelling the 1-hour reminder failed:', e?.message || e)
    );

    const cancelled = { ...booking, ...change };
    const order = await db.collection('Order').findOne({ bookingId: _id }, { projection: { _id: 1 } }).catch(() => null);
    await notifyBooking(db, 'booking.cancelled', cancelled, { orderId: order?._id });

    // Emails never undo the cancellation; the response says which went out
    let emails = { client: false, salon: false };
    try {
      emails = await sendCancellationEmails(cancelled);
    } catch (e) {
      console.error('Cancellation emails failed:', e?.message || e);
    }

    return NextResponse.json({ success: true, booking: shapeBooking(cancelled), emails });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Could not cancel this appointment. Please try again.' }, { status: 500 });
  }
}
