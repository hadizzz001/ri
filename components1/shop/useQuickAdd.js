"use client";

import { useState } from "react";
import { useCart } from "../../app/context/CartContext";
import { useBooleanValue } from "../../app/context/CartBoolContext";
import { productPath } from "./productInfo";

const qty = (v) => parseInt(String(v ?? "0"), 10) || 0;

export function isOutOfStock(p) {
  if (!p) return false;
  if (p.type === "single") return qty(p.stock) === 0;
  if (p.type === "collection") {
    const colors = Array.isArray(p.color) ? p.color : [];
    if (!colors.length) return false;
    return colors.every((c) => {
      const sizes = Array.isArray(c.sizes) ? c.sizes.reduce((a, s) => a + qty(s.qty), 0) : 0;
      return qty(c.qty) + sizes === 0;
    });
  }
  return false;
}

/** True when the shopper must pick a colour / size before the item can be added. */
function needsOptions(p) {
  if (p?.type !== "collection") return false;
  const colors = Array.isArray(p.color) ? p.color : [];
  const inStock = colors.filter((c) => qty(c.qty) > 0 || (c.sizes || []).some((s) => qty(s.qty) > 0));
  if (inStock.length > 1) return true;
  const sizes = (inStock[0]?.sizes || []).filter((s) => qty(s.qty) > 0);
  return sizes.length > 1;
}

/**
 * One-tap "add to bag" for product cards: adds the first in-stock colour / size
 * and opens the mini cart, or sends the shopper to the product page when there
 * are options to choose from.
 */
export function useQuickAdd(product) {
  const { cart, addToCart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const [added, setAdded] = useState(false);

  const soldOut = isOutOfStock(product);
  const pickOptions = needsOptions(product);
  const inCart = Array.isArray(cart) && cart.some((c) => c._id === product?._id);

  const openCart = () => {
    const cartb2 = document.getElementById("cartid2");
    setBooleanValue(!isBooleanValue);
    if (cartb2) {
      if (isBooleanValue) cartb2.className += " MiniCart_Cart-visible";
      else cartb2.classList.remove("MiniCart_Cart-visible");
    }
  };

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    if (pickOptions) {
      window.location.href = productPath(product);
      return;
    }
    if (!inCart) {
      const colors = Array.isArray(product.color) ? product.color : [];
      const firstColor = colors.find((c) => qty(c.qty) > 0 || (c.sizes || []).some((s) => qty(s.qty) > 0)) || colors[0];
      const firstSize = (firstColor?.sizes || []).find((s) => qty(s.qty) > 0);
      addToCart(product, 1, firstColor?.title, firstSize?.size);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    openCart();
  };

  const label = soldOut ? "Sold out" : pickOptions ? "Choose options" : added ? "Added" : inCart ? "In your bag" : "Add to cart";

  return { onAdd, label, soldOut, added };
}
