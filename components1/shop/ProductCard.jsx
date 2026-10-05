"use client";

import Stars from "./Stars";
import FavButton from "./FavButton";
import { getPricing, productPath } from "./productInfo";
import { useQuickAdd } from "./useQuickAdd";

export { isOutOfStock } from "./useQuickAdd";

export default function ProductCard({ product }) {
  const { onAdd, label, soldOut, added } = useQuickAdd(product);

  if (!product) return null;
  const { _id, title, img = [], factory, arrival, rating } = product;
  const { now, was, isSale, pct } = getPricing(product);
  const href = productPath(product);
  const main = img[0];
  const alt = img[1];
  const optimise = (u) => (u ? u.replace("/upload/", "/upload/f_auto,q_auto,w_600/") : u);

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
