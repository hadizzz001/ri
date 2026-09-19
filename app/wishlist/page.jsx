"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../../components1/shop/ProductCard";

export default function WishlistPage() {
  const { user, loading, favoriteIds } = useAuth();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    if (!user) { setProducts([]); return; }
    fetch("/api1/favorites?full=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, [user, favoriteIds.length]);

  return (
    <div className="sk">
      <header className="sk__head">
        <nav className="sk__crumbs"><a href="/">Home</a><span>/</span><span>Wishlist</span></nav>
        <h1 className="sk__title">Wishlist</h1>
        <p className="sk__desc">Products you have saved for later.</p>
      </header>

      {loading ? null : !user ? (
        <div className="sk__empty">
          <p>Sign in to see your saved products.</p>
          <a className="rd-btn rd-btn--sm" style={{ width: "auto", marginTop: "1rem" }} href="/login?next=/wishlist">Sign in</a>
        </div>
      ) : products === null ? null : products.length === 0 ? (
        <div className="sk__empty">
          <p>Your wishlist is empty.</p>
          <a className="rd-btn rd-btn--sm" style={{ width: "auto", marginTop: "1rem" }} href="/shop">Browse the shop</a>
        </div>
      ) : (
        <div className="sk__grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}
    </div>
  );
}
