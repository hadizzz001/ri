import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * POST only: link scanners (Outlook Safe Links, antivirus…) prefetch GET
 * URLs, which would unsubscribe people by accident. Called by
 *  - the /unsubscribe page:  JSON body { token }
 *  - mail providers' one-click unsubscribe (RFC 8058): ?token=… in the URL
 */
export async function POST(request) {
  let token = new URL(request.url).searchParams.get('token');
  if (!token) {
    try {
      token = (await request.json())?.token;
    } catch {
      /* one-click posts are form-encoded, the token is in the URL */
    }
  }
  token = String(token || '');

  if (!/^[a-f0-9]{48}$/.test(token)) {
    return NextResponse.json({ error: 'This unsubscribe link is not valid.' }, { status: 400 });
  }

  try {
    const col = (await clientPromise).db('test').collection('Subscriber');
    const result = await col.updateOne(
      { token, unsubscribedAt: null },
      { $set: { unsubscribedAt: new Date() } }
    );
    if (result.matchedCount === 0 && !(await col.findOne({ token }, { projection: { _id: 1 } }))) {
      return NextResponse.json({ error: 'This unsubscribe link is not valid.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[unsubscribe] failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
