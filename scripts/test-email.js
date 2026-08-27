/**
 * Sends a test appointment email so you can confirm your mail setup works.
 *
 *   node scripts/test-email.js you@example.com
 *   node scripts/test-email.js you@example.com ar     (Arabic version)
 */
require('dotenv').config({ path: __dirname + '/../.env' });

const to = process.argv[2];
const lang = process.argv[3] === 'ar' ? 'ar' : 'en';

if (!to) {
  console.error('Usage: node scripts/test-email.js <email-address> [ar]');
  process.exit(1);
}

const inTwoDays = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
};

(async () => {
  // The app code is ESM, so load it dynamically from this CommonJS script.
  const { verifyMailer } = await import('../app/lib/mailer.js');
  const { sendClientConfirmation, sendClientReminder } = await import(
    '../app/lib/appointmentEmails.js'
  );

  const provider = await verifyMailer();
  if (provider === 'none') {
    console.error(
      '\nNo email provider configured.\n' +
        'Add SMTP_USER + SMTP_PASS to .env (Gmail app password) and try again.\n'
    );
    process.exit(1);
  }
  console.log(`Provider: ${provider}  →  sending to ${to} (${lang})`);

  const booking = {
    reference: 'RD-TEST01',
    name: lang === 'ar' ? 'تجربة' : 'Test Client',
    phone: '96170000000',
    email: to,
    country: 'Lebanon',
    city: 'Beirut',
    date: inTwoDays(),
    hour: '15:00',
    lang,
    cart: [
      { id: '1', title: 'Hair Cut', price: 50, qty: 1, duration: 45 },
      { id: '2', title: 'Blow Dry', price: 25, qty: 1, duration: 30 },
    ],
    total: 75,
    deposit: 18.75,
  };

  await sendClientConfirmation(booking);
  console.log('  ✓ confirmation email sent');

  await sendClientReminder(booking, 2);
  console.log('  ✓ reminder email sent');

  console.log('\nDone — check the inbox (and the spam folder).');
})().catch((e) => {
  console.error('\nFailed:', e.message);
  if (/Invalid login|BadCredentials|535/i.test(e.message)) {
    console.error(
      'Gmail rejected the credentials. Make sure you used an App Password\n' +
        '(https://myaccount.google.com/apppasswords), not your normal password.'
    );
  }
  process.exit(1);
});
