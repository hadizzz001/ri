import { notFound } from "next/navigation";
import ProductView from "../ProductView";
import ProductJsonLd from "../ProductJsonLd";
import { getProductByBarcode, productMetadata } from "../../lib/products";

export const dynamic = "force-dynamic";

const barcodeOf = (params) => {
  try {
    return decodeURIComponent(params.code);
  } catch {
    return params.code;
  }
};

export async function generateMetadata({ params }) {
  const product = await getProductByBarcode(barcodeOf(params));
  return product ? productMetadata(product) : { title: "Product not found" };
}

/**
 * /product/<barcode> — the page Google shows when someone searches the code.
 * Any casing works (/product/RAFI010203); the canonical URL uses the saved one.
 */
export default async function Page({ params }) {
  const product = await getProductByBarcode(barcodeOf(params));
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductView id={product._id} />
    </>
  );
}
