/**
 * Appointment price rules, shared by the booking page (live summary) and
 * /api/booking (which re-prices server side) so the client always sees the
 * amount that gets stored.
 *
 *  - Outside Lebanon every service is priced at the travelling rate (×4).
 *  - Home service costs double inside Lebanon; abroad the travelling rate
 *    already covers coming to the client.
 *  - Tax — a percentage set in the dashboard — is added on top, for salon
 *    and home service alike, except in Beirut, which is tax free.
 *  - Bookings outside Lebanon are confirmed with a 25% deposit of the taxed
 *    total; bookings inside Lebanon need none.
 *
 * Plain data + pure helpers only — safe to import from client and server.
 */
import { LEBANON } from './bookingOptions.js';

export const SERVICE_TYPES = ['salon', 'home'];

export const TAX_FREE_CITY = 'Beirut';
export const DEPOSIT_RATE = 0.25;

const round2 = (n) => Math.round(n * 100) / 100;

export const isLebanon = (country) => country === LEBANON;

/** Multiplier applied to each service price for the booking country. */
export const locationFactor = (country) => (country && !isLebanon(country) ? 4 : 1);

/** Multiplier applied to the services subtotal for the chosen service type. */
export const homeFactor = (serviceType, country) =>
  serviceType === 'home' && isLebanon(country) ? 2 : 1;

/** The dashboard's tax percentage, or 0 in Beirut. */
export const taxPercentFor = ({ country, city }, dashboardPercent) =>
  !country || !city || (isLebanon(country) && city === TAX_FREE_CITY)
    ? 0
    : Math.max(0, Number(dashboardPercent) || 0);

/** Share of the total paid upfront: 25% abroad, nothing inside Lebanon (or before a country is picked). */
export const depositRate = (country) => (country && !isLebanon(country) ? DEPOSIT_RATE : 0);

/**
 * Totals for cart lines of { price, qty }, prices already at the location
 * rate (see locationFactor). `taxPercent` is the dashboard's percentage; the
 * one applied (0 in Beirut) is returned.
 */
export function bookingTotals(items, { country, city, serviceType, taxPercent }) {
  const subtotal = round2(
    items.reduce((a, i) => a + Number(i.price) * (Number(i.qty) || 1), 0)
  );
  const homeFee = round2(subtotal * (homeFactor(serviceType, country) - 1));
  const rate = taxPercentFor({ country, city }, taxPercent);
  const tax = round2(((subtotal + homeFee) * rate) / 100);
  const total = round2(subtotal + homeFee + tax);

  return { subtotal, homeFee, taxPercent: rate, tax, total, deposit: round2(total * depositRate(country)) };
}
