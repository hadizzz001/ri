import { cache } from 'react';
import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';
import { attachRatings } from './ratings';
import { SITE_NAME, SITE_URL } from './site';
import { getPricing, isSoldOut, productPath } from '../../components1/shop/productInfo';

/**
 * Server-side product lookups for the product pages and the sitemap, plus the
 * metadata / schema.org data that lets Google find a product by its barcode.
 */

const productsCollection = async () => (await clientPromise).db('test').collection('Product1');

/** Same shape /api1/products/[id] returns: ObjectIds as strings, `rating` attached. */
async function toPlain(doc) {
  if (!doc) return null;
  await attachRatings((await clientPromise).db('test'), [doc]);
  return JSON.parse(JSON.stringify(doc));
}

// cache(): generateMetadata and the page share one lookup per request.
export const getProductById = cache(async (id) => {
  if (typeof id !== 'string' || !ObjectId.isValid(id)) return null;
  const products = await productsCollection();
  return toPlain(await products.findOne({ _id: new ObjectId(id) }));
});

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The dashboard saves barcodes without spaces; an exact match wins, then any case. */
export const getProductByBarcode = cache(async (code) => {
  const barcode = String(code ?? '').replace(/\s+/g, '');
  if (!barcode) return null;
  const products = await productsCollection();
  const doc =
    (await products.findOne({ barcode })) ||
    (await products.findOne({ barcode: { $regex: `^${escapeRegExp(barcode)}$`, $options: 'i' } }));
  return toPlain(doc);
});

/** Every product page, for the sitemap. */
export async function listProductPaths() {
  const products = await productsCollection();
  const docs = await products.find({}, { projection: { _id: 1, barcode: 1 } }).toArray();
  return docs.map((d) => productPath({ _id: String(d._id), barcode: d.barcode }));
}

/* ───────── metadata + structured data ───────── */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decodeEntity = (match, name) => {
  if (name[0] !== '#') return ENTITIES[name.toLowerCase()] ?? match;
  const n = /^#x/i.test(name) ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
  return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
};

/** The rich-text (HTML) description as one line of plain text. */
const plainText = (html) =>
  String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text, max) =>
  text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : text;

const imagesOf = (p) =>
  (Array.isArray(p.img) ? p.img : []).filter((u) => u && !/\.(mp4|webm|ogg|mov)$/i.test(u));

/** A real GS1 barcode (EAN-8, UPC-A, EAN-13, GTIN-14) with a valid check digit. */
function isGtin(code) {
  if (!/^(\d{8}|\d{12,14})$/.test(code)) return false;
  const digits = [...code].map(Number);
  const check = digits.pop();
  const sum = digits.reverse().reduce((acc, d, i) => acc + d * (i % 2 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === check;
}

/**
 * Title, description and canonical URL for a product page. The barcode goes
 * in the title and description: that is what Google matches when someone
 * searches (or scans with Google Lens) the code.
 */
export function productMetadata(product) {
  const code = product.barcode;
  const path = productPath(product);
  const title = code ? `${product.title} – ${code}` : product.title;
  const description = truncate(
    `${code ? `Item code ${code}. ` : ''}${plainText(product.description) || `Shop ${product.title} at ${SITE_NAME}.`}`,
    160
  );
  const images = imagesOf(product);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images: images.slice(0, 4),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.slice(0, 1),
    },
  };
}

/** schema.org Product: name, barcode (sku / gtin), brand, price and stock. */
export function productJsonLd(product) {
  const url = new URL(productPath(product), SITE_URL).href;
  const code = product.barcode;
  const images = imagesOf(product);
  const description = truncate(plainText(product.description), 5000);
  const { now } = getPricing(product);
  const rating = product.rating;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    url,
    ...(images.length > 0 && { image: images }),
    ...(description && { description }),
    ...(code && { sku: code }),
    ...(code && isGtin(code) && { gtin: code }),
    ...(product.factory && { brand: { '@type': 'Brand', name: product.factory } }),
    ...(product.category && { category: product.category }),
    ...(now > 0 && {
      offers: {
        '@type': 'Offer',
        url,
        price: now.toFixed(2),
        priceCurrency: 'USD',
        availability: `https://schema.org/${isSoldOut(product) ? 'OutOfStock' : 'InStock'}`,
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
    }),
    ...(rating?.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.avg,
        reviewCount: rating.count,
      },
    }),
  };
}
