"use client";

import { useCallback, useEffect, useState } from "react";
import Stars, { StarInput } from "./Stars";
import { useAuth } from "../../app/context/AuthContext";

export default function Reviews({ productId, onSummary }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    const res = await fetch(`/api1/reviews?productId=${productId}`, { cache: "no-store" });
    const d = await res.json();
    setData(d);
    onSummary?.(d.summary);
    if (d.mine) setForm({ rating: d.mine.rating, title: d.mine.title, comment: d.mine.comment });
  }, [productId, onSummary]);

  useEffect(() => { load(); }, [load, user?._id]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not submit review");
      setDone(true);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete your review?")) return;
    await fetch(`/api1/reviews?productId=${productId}`, { method: "DELETE" });
    setForm({ rating: 5, title: "", comment: "" });
    setDone(false);
    await load();
  };

  const s = data?.summary || { avg: 0, count: 0, histogram: {} };
  const reviews = data?.reviews || [];
  const loginHref = typeof window !== "undefined" ? `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}` : "/login";

  return (
    <section className="pd__section rv" id="reviews">
      <h2 className="pd__section-title">Customer reviews</h2>

      <div className="rv__summary">
        <div className="rv__avg">
          <div className="rv__avg-num">{s.count ? s.avg.toFixed(1) : "—"}</div>
          <Stars value={s.avg} size="lg" />
          <div className="rv__avg-count">Based on {s.count} review{s.count === 1 ? "" : "s"}</div>
        </div>
        <div className="rv__bars">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = s.histogram?.[n] || 0;
            const pct = s.count ? (c / s.count) * 100 : 0;
            return (
              <div className="rv__bar" key={n}>
                <span>{n} star{n > 1 ? "s" : ""}</span>
                <div className="rv__bar-track"><div className="rv__bar-fill" style={{ width: `${pct}%` }} /></div>
                <span>{c}</span>
              </div>
            );
          })}
        </div>
        <div className="rv__write">
          {user ? (
            <button className="rd-btn" onClick={() => setOpen(!open)}>{data?.mine ? "Edit your review" : "Write a review"}</button>
          ) : (
            <a className="rd-btn" href={loginHref}>Sign in to review</a>
          )}
        </div>
      </div>

      {open && user && (
        <form className="rv__form" onSubmit={submit}>
          {error && <div className="rd-error">{error}</div>}
          <div>
            <span className="rd-label">Your rating</span>
            <StarInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <div>
            <label className="rd-label" htmlFor="rv-title">Review title</label>
            <input id="rv-title" className="rd-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Give your review a title" maxLength={120} />
          </div>
          <div>
            <label className="rd-label" htmlFor="rv-comment">Review</label>
            <textarea id="rv-comment" className="rd-input" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="What did you think of this product?" required />
          </div>
          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <button className="rd-btn rd-btn--sm" type="submit" disabled={busy} style={{ width: "auto" }}>{busy ? "Submitting…" : "Submit review"}</button>
            <button className="rd-btn rd-btn--ghost rd-btn--sm" type="button" onClick={() => setOpen(false)} style={{ width: "auto" }}>Cancel</button>
          </div>
          <small style={{ color: "var(--rd-gray)" }}>Posting as {user.name}. Reviews are public.</small>
        </form>
      )}
      {done && !open && <div className="rd-success" style={{ marginBottom: "1.5rem" }}>Thank you — your review has been posted.</div>}

      <div className="rv__list">
        {data === null ? null : reviews.length === 0 ? (
          <p className="rv__empty">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          reviews.map((r) => (
            <article className="rv__item" key={r._id}>
              <div className="rv__who">
                <Stars value={r.rating} size="sm" />
                <b>{r.userName}</b>
                <small>{new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</small>
                {r.verified && (
                  <div className="rv__verified">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="6" r="5" /><path d="M3.5 6l1.7 1.7L8.7 4.3" /></svg>
                    Verified buyer
                  </div>
                )}
                {r.mine && <div className="rv__mine">Your review<button type="button" onClick={remove}>Delete</button></div>}
              </div>
              <div>
                {r.title && <h4 className="rv__title">{r.title}</h4>}
                <p className="rv__text">{r.comment}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
