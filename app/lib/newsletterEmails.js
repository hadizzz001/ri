/**
 * Newsletter welcome email. Table-based HTML so it renders the same in Gmail,
 * Apple Mail and Outlook. Apple Mail / iOS pick up the brand web fonts; other
 * clients fall back to the Helvetica / Arial stacks.
 */

// PNG, not WebP: Outlook for Windows cannot display WebP.
const LOGO = 'https://res.cloudinary.com/dtjcqfoxc/image/upload/w_144/v1751030325/black_bgez4v.png';

const HEADING = "'Instrument Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
const TEXT = "Nunito,'Helvetica Neue',Helvetica,Arial,sans-serif";

const button = (href, label, { outline = false } = {}) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto">
    <tr>
      <td align="center" bgcolor="${outline ? '#ffffff' : '#100501'}" style="border-radius:60px;border:1px solid ${outline ? '#d9d4ce' : '#100501'}">
        <a href="${href}" target="_blank" style="display:inline-block;padding:13px 32px;font-family:${TEXT};font-size:12px;letter-spacing:2.2px;text-transform:uppercase;text-decoration:none;color:${outline ? '#100501' : '#ffffff'};border-radius:60px">${label}</a>
      </td>
    </tr>
  </table>`;

/**
 * @param {object} opts
 * @param {string} opts.site            e.g. https://www.rafidaham.com (no trailing slash)
 * @param {string} opts.unsubscribeUrl
 */
export function welcomeEmail({ site, unsubscribeUrl }) {
  const subject = 'Welcome to Rafi Daham';
  const preheader =
    'You’re on the list — new services, exclusive offers and beauty insights, first.';

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${subject}</title>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans&family=Nunito:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:#f4f2ef;-webkit-text-size-adjust:100%">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f2ef">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff">
            <tr>
              <td align="center" style="padding:48px 40px 8px">
                <a href="${site}" target="_blank"><img src="${LOGO}" width="72" height="72" alt="Rafi Daham" style="display:block;border:0;width:72px;height:72px" /></a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 40px 0;font-family:${HEADING};font-size:11px;letter-spacing:2.2px;text-transform:uppercase;color:#7c7974">
                Thank you for subscribing
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:14px 40px 0;font-family:${HEADING};font-size:24px;line-height:1.35;letter-spacing:4px;text-transform:uppercase;color:#100501">
                Welcome to Rafi&nbsp;Daham
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:22px 48px 0;font-family:${TEXT};font-size:15px;line-height:1.75;color:#3b3835">
                You’re now part of our circle. Be the first to hear about new services, exclusive
                offers and expert hair &amp; beauty advice from Rafi Daham and the studio team.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:14px 48px 0;font-family:${TEXT};font-size:15px;line-height:1.75;color:#3b3835">
                Since 1994, Rafi Daham has turned a passion for artistry and precision into a
                lifelong craft — and we can’t wait to welcome you to the studio.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:34px 40px 0">
                ${button(`${site}/appointment`, 'Book an appointment')}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 40px 48px">
                ${button(`${site}/shop`, 'Shop the collection', { outline: true })}
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px"><div style="height:1px;line-height:1px;background:#ebe7e2">&nbsp;</div></td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 40px 36px;font-family:${TEXT};font-size:12px;line-height:1.7;color:#7c7974">
                Rafi Daham Hair Repair Studio · Beirut, Lebanon<br />
                You’re receiving this email because you subscribed on
                <a href="${site}" target="_blank" style="color:#7c7974;text-decoration:underline">our website</a>.<br />
                <a href="${unsubscribeUrl}" target="_blank" style="color:#7c7974;text-decoration:underline">Unsubscribe</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}
