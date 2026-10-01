import { SITE_URL } from './lib/site';

/** /robots.txt */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep /api and /api1 crawlable: product pages load their data from them.
      disallow: ['/checkout', '/account', '/wishlist'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
