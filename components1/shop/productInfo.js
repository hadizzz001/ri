/**
 * Product helpers shared by the shop UI and the server (page metadata,
 * structured data, sitemap). No "use client": both sides import it.
 */

/** Normalised pricing for a product doc (price = original, discount = selling price). */
export function getPricing(p) {
  const orig = parseFloat(String(p?.price ?? "0")) || 0;
  const disc = parseFloat(String(p?.discount ?? "0")) || 0;
  const now = disc > 0 ? disc : orig;
  const isSale = disc > 0 && orig > disc;
  const pct = isSale ? Math.round(((orig - disc) / orig) * 100) : 0;
  return { now, was: isSale ? orig : null, isSale, pct };
}

/** Sold out, exactly as the product page shows it. */
export function isSoldOut(p) {
  if (!p) return false;
  if (p.type === "single") return Number(p.stock) === 0;
  if (p.type === "collection") {
    const colors = Array.isArray(p.color) ? p.color : [];
    if (!colors.length) return false;
    const hasSizes = colors.some((c) => Array.isArray(c.sizes) && c.sizes.length > 0);
    if (hasSizes) return colors.every((c) => (c.sizes || []).every((s) => parseInt(s.qty) === 0));
    return colors.every((c) => parseInt(c.qty) === 0);
  }
  return false;
}

/** A product's page: /product/<barcode> when it has one, else /product?id=<id>. */
export function productPath(p) {
  return p?.barcode ? `/product/${encodeURIComponent(p.barcode)}` : `/product?id=${p?._id}`;
}
