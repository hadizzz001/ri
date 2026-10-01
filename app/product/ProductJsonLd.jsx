import { productJsonLd } from "../lib/products";

/** schema.org Product data, read by Google from the server-rendered HTML. */
export default function ProductJsonLd({ product }) {
  // "<" is escaped so product text can never close the script tag.
  const json = JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
