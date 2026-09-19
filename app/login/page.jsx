"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="au">
      <h1 className="au__title">Sign in</h1>
      <p className="au__sub">Welcome back. Sign in to view your wishlist, orders and reviews.</p>
      <form className="au__form" onSubmit={submit}>
        {error && <div className="rd-error">{error}</div>}
        <div>
          <label className="rd-label" htmlFor="email">Email</label>
          <input id="email" className="rd-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className="rd-label" htmlFor="password">Password</label>
          <input id="password" className="rd-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <button className="rd-btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="au__foot">
        New here? <a href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
