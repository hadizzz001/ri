"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="au">
      <h1 className="au__title">Create account</h1>
      <p className="au__sub">Save your favourites, track orders and share reviews.</p>
      <form className="au__form" onSubmit={submit}>
        {error && <div className="rd-error">{error}</div>}
        <div>
          <label className="rd-label" htmlFor="name">Full name</label>
          <input id="name" className="rd-input" value={form.name} onChange={set("name")} required autoComplete="name" />
        </div>
        <div>
          <label className="rd-label" htmlFor="email">Email</label>
          <input id="email" className="rd-input" type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </div>
        <div>
          <label className="rd-label" htmlFor="phone">Phone (optional)</label>
          <input id="phone" className="rd-input" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
        </div>
        <div className="au__row">
          <div>
            <label className="rd-label" htmlFor="password">Password</label>
            <input id="password" className="rd-input" type="password" value={form.password} onChange={set("password")} required minLength={6} autoComplete="new-password" />
          </div>
          <div>
            <label className="rd-label" htmlFor="confirm">Confirm</label>
            <input id="confirm" className="rd-input" type="password" value={form.confirm} onChange={set("confirm")} required minLength={6} autoComplete="new-password" />
          </div>
        </div>
        <button className="rd-btn" type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="au__foot">
        Already have an account? <a href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</a>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
