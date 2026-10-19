"use client";

import Stars from "./Stars";
import FavButton from "./FavButton";
import { getPricing, productPath } from "./productInfo";
import { useQuickAdd } from "./useQuickAdd";

export { isOutOfStock } from "./useQuickAdd";

/**
 * Product tile. `variant="collection"` is the shop grid's look (after
 * amadeussabra.com): image with a round "+" quick-add, then the name and price
 * centred in small capitals.
 */
export default function ProductCard({ product, variant }) {
  const { onAdd, label, soldOut, added } = useQuickAdd(product);

  if (!product) return null;
  const { _id, title, img = [], factory, arrival, rating } = product;
  const { now, was, isSale, pct } = getPricing(product);
  const href = productPath(product);
  const main = img[0];
  const alt = img[1];
  const optimise = (u) => (u ? u.replace("/upload/", "/upload/f_auto,q_auto,w_600/") : u);

  const media = (
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
  );

  if (variant === "collection") {
    return (
      <article className="pc pc--collection">
        <div className="pc__figure">
          {media}
          <FavButton productId={_id} />
          {!soldOut && (
            <button type="button" className={`pc__quick ${added ? "is-added" : ""}`} onClick={onAdd} aria-label={`${label}: ${title}`} title={label}>
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                {added ? <path d="M1 6.5l3 3L11 2.5" stroke="currentColor" strokeWidth="1.5" /> : <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" />}
              </svg>
            </button>
          )}
        </div>
        <div className="pc__info">
          <h3 className="pc__name"><a href={href}>{title}</a></h3>
          {rating?.count > 0 && (
            <span className="pc__rating">
              <Stars value={rating.avg || 0} size="sm" />
              <span>({rating.count})</span>
            </span>
          )}
          <div className="pc__prices">
            <span className={isSale ? "is-sale" : ""}>${now.toFixed(2)}</span>
            {was && <s>${was.toFixed(2)}</s>}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="pc">
      {media}
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
