/**
 * Appointment price rules, shared by the booking page (live summary) and
 * /api/booking (which re-prices server side) so the client always sees the
 * amount that gets stored.
 *
 *  - Outside Lebanon every service is priced at the travelling rate (×4).
 *  - Home service costs double inside Lebanon; abroad the travelling rate
 *    already covers coming to the client.
 *  - Tax — a percentage set in the dashboard — is added on top, for salon
 *    and home service alike. The 25% deposit is taken from the taxed total.
 *
 * Plain data + pure helpers only — safe to import from client and server.
 */

export const SERVICE_TYPES = ['salon', 'home'];

const round2 = (n) => Math.round(n * 100) / 100;

/** Multiplier applied to each service price for the booking country. */
export const locationFactor = (country) => (country && country !== 'Lebanon' ? 4 : 1);

/** Multiplier applied to the services subtotal for the chosen service type. */
export const homeFactor = (serviceType, country) =>
  serviceType === 'home' && country === 'Lebanon' ? 2 : 1;

/**
 * Totals for cart lines of { price, qty }, prices already at the location
 * rate (see locationFactor).
 */
export function bookingTotals(items, { country, serviceType, taxPercent }) {
  const subtotal = round2(
    items.reduce((a, i) => a + Number(i.price) * (Number(i.qty) || 1), 0)
  );
  const homeFee = round2(subtotal * (homeFactor(serviceType, country) - 1));
  const rate = Math.max(0, Number(taxPercent) || 0);
  const tax = round2(((subtotal + homeFee) * rate) / 100);
  const total = round2(subtotal + homeFee + tax);

  return { subtotal, homeFee, taxPercent: rate, tax, total, deposit: round2(total * 0.25) };
}
