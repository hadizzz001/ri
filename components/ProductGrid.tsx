"use client";

import { useEffect, useState } from "react";

type Product = {
  _id: string;
  title: string;
  cat: string;
  price: string;
};

type CartItem = Product & {
  qty: number;
};

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => ({
      ...prev,
      [product._id]: { ...product, qty: 1 },
    }));
  };

  const increaseQty = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: { ...prev[id], qty: prev[id].qty + 1 },
    }));
  };

  const decreaseQty = (id: string) => {
    setCart((prev) => {
      const qty = prev[id].qty - 1;
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: { ...prev[id], qty },
      };
    });
  };

  return (
    <div className="pg-grid">
      {products.map((p) => {
        const item = cart[p._id];

        return (
          <div key={p._id} className="pg-card">
            <div className="pg-info">
              <h3 className="pg-title">{p.title}</h3>
              <p className="pg-cat">{p.cat}</p>
              <p className="pg-price">${p.price}</p>
            </div>

            <div className="pg-action">
              {!item ? (
                <button
                  onClick={() => addToCart(p)}
                  className="pg-add-btn"
                >
                  Add
                </button>
              ) : (
                <div className="pg-qty">
                  <button
                    onClick={() => decreaseQty(p._id)}
                    className="pg-qty-btn"
                  >
                    −
                  </button>
                  <span className="pg-qty-value">{item.qty}</span>
                  <button
                    onClick={() => increaseQty(p._id)}
                    className="pg-qty-btn"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
