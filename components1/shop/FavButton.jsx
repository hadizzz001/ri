"use client";

import { useAuth } from "../../app/context/AuthContext";

export const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4.5 6.9 4.5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.3 0 5.5 3.1 4.2 6.6C19.5 15.9 12 20.5 12 20.5z" strokeLinejoin="round" />
  </svg>
);

/**
 * Heart toggle. `variant` = "card" (floating on product tile) | "block" (product page square).
 */
export default function FavButton({ productId, variant = "card", className = "" }) {
  const { isFavorite, toggleFavorite } = useAuth();
  const active = isFavorite(productId);

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(productId);
  };

  const cls = variant === "card" ? "pc__fav" : "pd__wish";
  return (
    <button
      type="button"
      className={`${cls} ${active ? "is-active" : ""} ${className}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon filled={active} />
    </button>
  );
}
