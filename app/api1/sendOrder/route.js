import clientPromise from '../../lib/mongodb'; // Adjust path as needed
import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../lib/auth';
import { GUEST_COOKIE, guestCookieOptions, guestSession, notifyShopOrder } from '../../lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { inputs, items, total, delivery, code } = body;

        // Stamp the order with the signed-in shopper (if any) so it shows in their history
        let user = null;
        try { user = await getCurrentUser(); } catch { user = null; }
        const guest = user ? null : guestSession();

        const client = await clientPromise;
        const db = client.db('test'); // Replace with your database name
        const collection = db.collection('Order1'); // Replace with your collection name

        // Get the next oid
        const lastOrder = await collection.find().sort({ oid: -1 }).limit(1).toArray();
        const nextOid = lastOrder.length > 0 ? lastOrder[0].oid + 1 : 1000;

        // Format current date
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.toLocaleString('default', { month: 'long' })}/${currentDate.getFullYear()}`;

        // Insert the new order
        const result = await collection.insertOne({
            oid: nextOid, // 👈 Add oid here
            userInfo: items,
            cartItems: inputs,
            total: total,
            delivery: delivery + "",
            code: code,
            date: formattedDate,
            createdAt: currentDate,
            userId: user?._id || null,
            userEmail: (user?.email || inputs?.email || '').trim().toLowerCase() || null,
            ...(guest ? { guestKey: guest.hash } : {}),
        });

        await notifyShopOrder(db, {
            _id: result.insertedId,
            oid: nextOid,
            name: [inputs?.fname, inputs?.lname].filter(Boolean).join(' ') || user?.name || '',
            count: Array.isArray(items) ? items.reduce((n, it) => n + (parseInt(it?.quantity, 10) || 1), 0) : 0,
            total,
            userId: user?._id,
            email: user?.email || inputs?.email,
            guestKey: guest?.hash,
        });

        const response = NextResponse.json({ success: true, insertedId: result.insertedId, oid: nextOid });
        if (guest) response.cookies.set(GUEST_COOKIE, guest.key, guestCookieOptions());
        return response;
    } catch (error) {
        console.error('Error inserting data into MongoDB:', error);
        return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 });
    }
}
