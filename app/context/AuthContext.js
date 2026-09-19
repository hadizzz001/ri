"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api1/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
      if (data.user) {
        const f = await fetch("/api1/favorites", { cache: "no-store" }).then((r) => r.json());
        setFavoriteIds(f.ids || []);
      } else {
        setFavoriteIds([]);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const res = await fetch("/api1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    await refresh();
    return data.user;
  }, [refresh]);

  const register = useCallback(async (payload) => {
    const res = await fetch("/api1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setUser(data.user);
    setFavoriteIds([]);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api1/auth/logout", { method: "POST" });
    setUser(null);
    setFavoriteIds([]);
  }, []);

  const isFavorite = useCallback((id) => favoriteIds.includes(String(id)), [favoriteIds]);

  /** Toggles a favourite. Returns false (and redirects to login) when signed out. */
  const toggleFavorite = useCallback(
    async (productId) => {
      if (!user) {
        if (typeof window !== "undefined") {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?next=${next}`;
        }
        return false;
      }
      const id = String(productId);
      // optimistic
      setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      try {
        const res = await fetch("/api1/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id }),
        });
        const data = await res.json();
        if (res.ok) setFavoriteIds(data.ids || []);
        return !!data.favorited;
      } catch {
        return false;
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, favoriteIds, isFavorite, toggleFavorite }),
    [user, loading, login, register, logout, refresh, favoriteIds, isFavorite, toggleFavorite]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Safe fallback so components never crash outside the provider
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      refresh: async () => {},
      favoriteIds: [],
      isFavorite: () => false,
      toggleFavorite: async () => false,
    };
  }
  return ctx;
}
