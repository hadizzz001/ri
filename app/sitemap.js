import { listProductPaths } from './lib/products';
import { SITE_URL } from './lib/site';

// Built on every request, so new products and barcodes are listed right away.
export const dynamic = 'force-dynamic';

const PAGES = ['/', '/shop', '/services', '/appointment', '/vid', '/ext', '/contact', '/privacy', '/term'];

/** /sitemap.xml — submit it in Google Search Console so every product gets indexed. */
export default async function sitemap() {
  const products = await listProductPaths();
  return [...PAGES, ...products].map((path) => ({ url: new URL(path, SITE_URL).href }));
}
