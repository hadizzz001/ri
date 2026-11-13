'use client';

import { useEffect, useState } from 'react';
import { outsideIncreasePercent } from '../lib/bookingPrice';

/**
 * "Services provided outside Lebanon will incur a …% increase.", worked out
 * from the outside-Lebanon multiplier set in the dashboard (Prices & Tax), so
 * the menu always says what the booking page charges. Nothing is shown until
 * it has loaded, or when there is no increase (×1).
 */
export default function OutsideIncrease() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    fetch('/api/tax', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => json && setPct(outsideIncreasePercent(json.outsideFactor)))
      .catch(() => {});
  }, []);

  if (!(pct > 0)) return null;
  // One text node, so the site's AR / FR translation gets the whole sentence
  return <li>{`Services provided outside Lebanon will incur a ${pct}% increase.`}</li>;
}
