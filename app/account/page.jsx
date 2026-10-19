"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../../components1/shop/ProductCard";
import { bookingDeposit, bookingText, longDate, money } from "../lib/bookingMessage";

const TABS = [["profile", "Profile"], ["appointments", "Appointments"], ["wishlist", "Wishlist"], ["orders", "Orders"]];

const pad = (n) => String(n).padStart(2, "0");
/** "YYYY-MM-DD HH:mm" now, on this device's clock */
const nowStamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const isUpcoming = (b) => b.status !== "cancelled" && `${b.date} ${b.hour}` > nowStamp();

/** Upcoming appointments first (soonest first), then the rest (latest first). */
const sortBookings = (list) => {
  const upcoming = list.filter(isUpcoming).sort((a, b) => `${a.date} ${a.hour}`.localeCompare(`${b.date} ${b.hour}`));
  const rest = list.filter((b) => !isUpcoming(b)).sort((a, b) => `${b.date} ${b.hour}`.localeCompare(`${a.date} ${a.hour}`));
  return [...upcoming, ...rest];
};

export default function AccountPage() {
  const { user, loading, logout, refresh } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [favs, setFavs] = useState(null);
  const [orders, setOrders] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [confirming, setConfirming] = useState(null); // id of the appointment awaiting "yes, cancel"
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState(null); // { ok, text }
  const [form, setForm] = useState({ name: "", phone: "" });
  const [msg, setMsg] = useState("");

  // /account?tab=appointments (link in the booking confirmation) opens that tab
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("tab");
    if (TABS.some(([k]) => k === wanted)) setTab(wanted);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/account${window.location.search}`)}`);
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (tab === "wishlist" && favs === null) {
      fetch("/api1/favorites?full=1", { cache: "no-store" }).then((r) => r.json()).then((d) => setFavs(d.products || []));
    }
    if (tab === "orders") {
      setOrders(null);
      fetch("/api1/orders/mine", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setOrders(Array.isArray(d.orders) ? d.orders : []))
        .catch(() => setOrders([]));
    }
    if (tab === "appointments") {
      setBookings(null);
      setNotice(null);
      fetch("/api/booking/mine", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setBookings(Array.isArray(d.bookings) ? sortBookings(d.bookings) : []))
        .catch(() => setBookings([]));
    }
  }, [tab, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancelBooking = async (id) => {
    setCancelling(true);
    setNotice(null);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not cancel this appointment. Please try again.");
      setBookings((list) => sortBookings(list.map((b) => (b._id === id ? data.booking : b))));
      setNotice({
        ok: true,
        text: data.emails?.client
          ? `Your appointment ${data.booking.reference} has been cancelled. A confirmation email is on its way to ${user.email}.`
          : `Your appointment ${data.booking.reference} has been cancelled.`,
      });
    } catch (err) {
      setNotice({ ok: false, text: err.message });
    } finally {
      setCancelling(false);
      setConfirming(null);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api1/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setMsg("Saved."); refresh(); } else setMsg("Could not save.");
  };

  if (loading || !user) return <div className="ac" style={{ minHeight: "40vh" }} />;

  return (
    <div className="ac">
      <div className="ac__head">
        <div>
          <span className="rd-eyebrow">My account</span>
          <h1>Hello, {user.name?.split(" ")[0]}</h1>
        </div>
        <button className="rd-btn rd-btn--ghost rd-btn--sm" style={{ width: "auto" }} onClick={async () => { await logout(); router.push("/"); }}>
          Sign out
        </button>
      </div>

      <div className="ac__tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={`ac__tab ${tab === k ? "is-active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "profile" && (
        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <div className="ac__card">
            <h3>Account details</h3>
            <dl className="ac__kv">
              <dt>Name</dt><dd>{user.name}</dd>
              <dt>Email</dt><dd>{user.email}</dd>
              <dt>Phone</dt><dd>{user.phone || "—"}</dd>
              <dt>Member since</dt><dd>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd>
            </dl>
          </div>
          <form className="ac__card au__form" onSubmit={save}>
            <h3 style={{ marginBottom: 0 }}>Edit details</h3>
            {msg && <div className="rd-success">{msg}</div>}
            <div>
              <label className="rd-label">Full name</label>
              <input className="rd-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="rd-label">Phone</label>
              <input className="rd-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <button className="rd-btn rd-btn--sm" type="submit">Save changes</button>
          </form>
        </div>
      )}

      {tab === "appointments" && (
        bookings === null ? <p className="sk__empty">Loading…</p> : (
          <div className="ac__orders">
            {notice && <div className={notice.ok ? "rd-success" : "rd-error"} role="status">{notice.text}</div>}
            {bookings.length === 0 ? (
              <div className="sk__empty">
                <p>No appointments booked with {user.email} yet.</p>
                <a className="rd-btn rd-btn--sm" style={{ width: "auto", marginTop: "1rem" }} href="/appointment">Book an appointment</a>
              </div>
            ) : (
              bookings.map((b) => {
                const upcoming = isUpcoming(b);
                const deposit = bookingDeposit(b);
                const services = (b.cart || []).map((i) => `${i.title}${i.qty > 1 ? ` × ${i.qty}` : ""}`).join(", ");
                return (
                  <div className="ac__order" key={b._id}>
                    <div>
                      <b>{longDate(b.date)} · {b.hour}</b>
                      <div><small>{b.city}, {b.country} · {bookingText("en").serviceTypes[b.serviceType] || "Appointment"} · Ref {b.reference}</small></div>
                      {services && <div><small>{services}</small></div>}
                      <div><small>Total {money(b.total)}{deposit ? ` · Deposit to confirm ${money(deposit)}` : ""}</small></div>
                      {b.status === "cancelled" && b.cancelledAt && (
                        <div><small>Cancelled on {new Date(b.cancelledAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</small></div>
                      )}

                      {upcoming && (confirming === b._id ? (
                        <div className="ac__confirm">
                          <span>Cancel this appointment? The salon will be told by email.</span>
                          <div>
                            <button type="button" className="rd-btn rd-btn--sm rd-btn--auto" disabled={cancelling} onClick={() => cancelBooking(b._id)}>
                              {cancelling ? "Cancelling…" : "Yes, cancel it"}
                            </button>
                            <button type="button" className="rd-btn rd-btn--ghost rd-btn--sm rd-btn--auto" disabled={cancelling} onClick={() => setConfirming(null)}>
                              Keep it
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" className="ac__cancel" onClick={() => { setNotice(null); setConfirming(b._id); }}>
                          Cancel appointment
                        </button>
                      ))}
                    </div>
                    <span className={`ac__pill ${upcoming ? "" : "is-muted"}`}>
                      {b.status === "cancelled" ? "Cancelled" : upcoming ? "Upcoming" : "Past"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )
      )}

      {tab === "wishlist" && (
        favs === null ? <p className="sk__empty">Loading…</p> :
        favs.length === 0 ? (
          <div className="sk__empty">
            <p>Your wishlist is empty.</p>
            <a className="rd-btn rd-btn--sm" style={{ width: "auto", marginTop: "1rem" }} href="/shop">Browse the shop</a>
          </div>
        ) : (
          <div className="sk__grid">
            {favs.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )
      )}

      {tab === "orders" && (
        orders === null ? <p className="sk__empty">Loading…</p> :
        orders.length === 0 ? (
          <div className="sk__empty">
            <p>No orders yet.</p>
            <a className="rd-btn rd-btn--sm" style={{ width: "auto", marginTop: "1rem" }} href="/shop">Start shopping</a>
          </div>
        ) : (
          <div className="ac__orders">
            {orders.map((o) => {
              const items = Array.isArray(o.items) ? o.items : Array.isArray(o.userInfo) ? o.userInfo : [];
              const count = items.reduce((n, it) => n + (parseInt(it.quantity, 10) || 1), 0);
              return (
                <div className="ac__order" key={o._id}>
                  <div>
                    <b>Order #{o.oid}</b> <small>· {o.date}</small>
                    <div><small>{count} item{count === 1 ? "" : "s"} · Total ${o.total}</small></div>
                    {items.length > 0 && (
                      <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem", flexWrap: "wrap" }}>
                        {items.slice(0, 6).map((it, i) => (
                          <a key={`${it._id}-${i}`} href={`/product?id=${it._id}`} title={it.title} style={{ width: 44, height: 44, background: "var(--rd-light)", overflow: "hidden", display: "block", position: "relative" }}>
                            {it.img?.[0] && <img src={it.img[0]} alt={it.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                          </a>
                        ))}
                        {items.length > 6 && <small style={{ alignSelf: "center" }}>+{items.length - 6}</small>}
                      </div>
                    )}
                  </div>
                  <span className={`ac__pill ${o.fulfillment ? "" : "is-muted"}`}>{o.fulfillment ? "Fulfilled" : o.paid ? "Paid" : "Processing"}</span>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
