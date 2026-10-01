import { notFound } from "next/navigation";
import ProductView from "./ProductView";
import ProductJsonLd from "./ProductJsonLd";
import { getProductById, productMetadata } from "../lib/products";

// Title, price and stock must be current, so render on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const product = await getProductById(searchParams?.id);
  return product ? productMetadata(product) : { title: "Product not found" };
}

/** /product?id=<id> — products with a barcode name /product/<barcode> as canonical. */
export default async function Page({ searchParams }) {
  const product = await getProductById(searchParams?.id);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductView id={product._id} />
    </>
  );
}
