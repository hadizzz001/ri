import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { runHourReminders } from '../../../../lib/hourReminders';

export const dynamic = 'force-dynamic';

/**
 * Emails the client and the salon 1 hour before each appointment.
 * Call it every 5–10 minutes from a scheduler (e.g. cron-job.org):
 *
 *   GET /api/booking/reminders/hour       (protected by CRON_SECRET if set)
 *   Authorization: Bearer <CRON_SECRET>   or  ?secret=<CRON_SECRET>
 *
 * The booking page also runs this check while visitors browse it.
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}` && url.searchParams.get('secret') !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  try {
    const client = await clientPromise;
    const report = await runHourReminders(client.db('test'));
    return NextResponse.json({ success: true, processed: report.length, report });
  } catch (error) {
    console.error('1-hour reminder job error:', error);
    return NextResponse.json({ error: 'Reminder job failed' }, { status: 500 });
  }
}
