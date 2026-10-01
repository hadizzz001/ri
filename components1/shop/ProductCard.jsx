"use client";

import { useState } from "react";
import { useCart } from "../../app/context/CartContext";
import { useBooleanValue } from "../../app/context/CartBoolContext";
import Stars from "./Stars";
import FavButton from "./FavButton";
import { getPricing, productPath } from "./productInfo";

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

export default function ProductCard({ product }) {
  const { cart, addToCart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const [added, setAdded] = useState(false);

  if (!product) return null;
  const { _id, title, img = [], factory, arrival, rating } = product;
  const { now, was, isSale, pct } = getPricing(product);
  const soldOut = isOutOfStock(product);
  const href = productPath(product);
  const main = img[0];
  const alt = img[1];
  const optimise = (u) => (u ? u.replace("/upload/", "/upload/f_auto,q_auto,w_600/") : u);
  const inCart = Array.isArray(cart) && cart.some((c) => c._id === _id);
  const pickOptions = needsOptions(product);

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
      window.location.href = href;
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

  return (
    <article className="pc">
      <a href={href} className="pc__media" aria-label={title}>
        {main ? (
          <img src={optimise(main)} alt={title} className={`pc__img pc__img--main ${alt ? "has-alt" : ""}`} loading="lazy" />
        ) : (
          <span className="pc__img pc__img--empty" />
        )}
        {alt && <img src={optimise(alt)} alt="" className="pc__img pc__img--alt" loading="lazy" />}

        <div className="pc__badges">
          {soldOut && <span className="pc__badge pc__badge--soldout">Sold out</span>}
          {!soldOut && isSale && <span className="pc__badge pc__badge--sale">-{pct}%</span>}
          {arrival === "yes" && <span className="pc__badge pc__badge--new">New</span>}
        </div>
      </a>
      <FavButton productId={_id} />

      <div className="pc__body">
        {factory && <span className="pc__brand">{factory}</span>}
        <h3 className="pc__title"><a href={href}>{title}</a></h3>
        {rating?.count > 0 && (
          <span className="pc__rating">
            <Stars value={rating.avg || 0} size="sm" />
            <span>({rating.count})</span>
          </span>
        )}
        <div className="pc__price">
          <span className={`pc__price-now ${isSale ? "is-sale" : ""}`}>${now.toFixed(2)}</span>
          {was && <span className="pc__price-was">${was.toFixed(2)}</span>}
        </div>
        <button type="button" className={`pc__add ${added ? "is-added" : ""}`} onClick={onAdd} disabled={soldOut} aria-label={`${label}: ${title}`}>
          {label}
        </button>
      </div>
    </article>
  );
}
