/**
 * Appointment price rules, shared by the booking page (live summary) and
 * /api/booking (which re-prices server side) so the client always sees the
 * amount that gets stored.
 *
 *  - Outside Lebanon every service is priced at the travelling rate: its
 *    price × a multiplier set in the dashboard ("Prices & Tax" page, saved
 *    as `outsideFactor` in the Tax document; 4 until one is saved).
 *  - Home service costs double inside Lebanon; abroad the travelling rate
 *    already covers coming to the client.
 *  - Tax — a percentage set in the dashboard — is added on top for home
 *    service only (salon bookings are tax free), except in Beirut, which
 *    is always tax free.
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

/** The travelling rate before one is saved in the dashboard (and for older bookings). */
export const DEFAULT_OUTSIDE_FACTOR = 4;
export const MAX_OUTSIDE_FACTOR = 20;

/** The dashboard's outside-Lebanon multiplier, or the default when it is missing or invalid. */
export const outsideFactorOf = (value) => {
  const n = Number(value);
  return value !== null && value !== '' && Number.isFinite(n) && n >= 1 && n <= MAX_OUTSIDE_FACTOR
    ? n
    : DEFAULT_OUTSIDE_FACTOR;
};

/** Multiplier applied to each service price for the booking country. */
export const locationFactor = (country, outsideFactor) =>
  country && !isLebanon(country) ? outsideFactorOf(outsideFactor) : 1;

/** A service's price at a location multiplier, to the cent (×2.5 can leave fractions). */
export const priceAt = (price, factor) => round2(Number(price) * (Number(factor) || 1));

/** How much more a service costs outside Lebanon, in % (×4 → 300). */
export const outsideIncreasePercent = (outsideFactor) =>
  Math.round((outsideFactorOf(outsideFactor) - 1) * 10000) / 100;

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
  // Tax applies to home service only — salon bookings are tax free.
  const rate = serviceType === 'home' ? taxPercentFor({ country, city }, taxPercent) : 0;
  const tax = round2(((subtotal + homeFee) * rate) / 100);
  const total = round2(subtotal + homeFee + tax);

  return { subtotal, homeFee, taxPercent: rate, tax, total, deposit: round2(total * depositRate(country)) };
}
