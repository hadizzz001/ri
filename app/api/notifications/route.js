import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import { notificationsOf, viewerKeys } from '../../lib/notifications';

export const dynamic = 'force-dynamic';

const LIST = { enabled: false, items: [], unread: 0, hasMore: false };

const shape = (n) => ({
  id: String(n._id),
  type: n.type,
  actor: n.actor,
  params: n.params || {},
  createdAt: n.createdAt,
  read: !!n.readAt,
});

/**
 * The bell on the website: the notifications of the signed-in client, or of
 * the guest who booked from this browser. Visitors who have done neither get
 * `enabled: false` and no bell.
 *
 *   GET /api/notifications?limit=15&before=<id of the last one shown>
 */
export async function GET(request) {
  const owners = await viewerKeys();
  if (!owners.length) return NextResponse.json(LIST);

  try {
    const url = new URL(request.url);
    const limit = Math.min(30, Math.max(1, Number(url.searchParams.get('limit')) || 15));
    const before = url.searchParams.get('before');
    const mine = { audience: 'client', owners: { $in: owners } };

    const client = await clientPromise;
    const col = notificationsOf(client.db('test'));
    const [items, unread] = await Promise.all([
      col
        .find({ ...mine, ...(before && ObjectId.isValid(before) ? { _id: { $lt: new ObjectId(before) } } : {}) })
        .sort({ _id: -1 })
        .limit(limit + 1)
        .toArray(),
      col.countDocuments({ ...mine, readAt: null }),
    ]);

    return NextResponse.json({
      enabled: true,
      items: items.slice(0, limit).map(shape),
      unread,
      hasMore: items.length > limit,
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Could not load notifications' }, { status: 500 });
  }
}

/** Marks them all as read (the client has opened the bell). */
export async function PATCH() {
  const owners = await viewerKeys();
  if (!owners.length) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const client = await clientPromise;
    await notificationsOf(client.db('test')).updateMany(
      { audience: 'client', owners: { $in: owners }, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications update error:', error);
    return NextResponse.json({ error: 'Could not update notifications' }, { status: 500 });
  }
}
