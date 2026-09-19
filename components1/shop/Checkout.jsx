"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "../../app/context/CartContext";
import { useAuth } from "../../app/context/AuthContext";

const WHATSAPP = "96178808100";
const FREE_DELIVERY_FROM = 50;

const COUNTRY_CODES = {
  Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Argentina: "AR", Australia: "AU", Austria: "AT", Bahrain: "BH", Bangladesh: "BD",
  Belgium: "BE", Brazil: "BR", Canada: "CA", China: "CN", Colombia: "CO", Cyprus: "CY", Denmark: "DK", Egypt: "EG", Finland: "FI",
  France: "FR", Germany: "DE", Greece: "GR", India: "IN", Indonesia: "ID", Iran: "IR", Iraq: "IQ", Ireland: "IE", Italy: "IT",
  Japan: "JP", Jordan: "JO", Kuwait: "KW", Lebanon: "LB", Libya: "LY", Malaysia: "MY", Mexico: "MX", Morocco: "MA", Netherlands: "NL",
  "New Zealand": "NZ", Nigeria: "NG", Norway: "NO", Oman: "OM", Pakistan: "PK", Palestine: "PS", Philippines: "PH", Poland: "PL",
  Portugal: "PT", Qatar: "QA", Russia: "RU", "Saudi Arabia": "SA", Singapore: "SG", "South Africa": "ZA", "South Korea": "KR",
  Spain: "ES", Sudan: "SD", Sweden: "SE", Switzerland: "CH", Syria: "SY", Taiwan: "TW", Thailand: "TH", Tunisia: "TN", Turkey: "TR",
  Ukraine: "UA", "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US", Vietnam: "VN", Yemen: "YE",
};

const unitPrice = (it) => {
  const d = parseFloat(String(it?.discount ?? "0")) || 0;
  const p = parseFloat(String(it?.price ?? "0")) || 0;
  return d > 0 ? d : p;
};
const lineKey = (it) => `${it._id}|${it.selectedColor || ""}|${it.selectedSize || ""}`;
const thumb = (u) => (u ? u.replace("/upload/", "/upload/f_auto,q_auto,w_200/") : u);

const Chevron = () => (<svg viewBox="0 0 12 12" fill="none" strokeWidth="1.3"><path d="M2 4l4 4 4-4" /></svg>);

export default function Checkout() {
  const { cart, removeFromCart, clearCart, subtotal } = useCart();
  const { user } = useAuth();

  const [inputs, setInputs] = useState({ fname: "", lname: "", phone: "", country: "", city: "", apt: "", address: "", email: "" });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [dial, setDial] = useState({ code: "", flag: "", dial: "" });

  const [promoCode, setPromoCode] = useState("");
  const [promoCodes, setPromoCodes] = useState([]);
  const [promo, setPromo] = useState(null); // { code, pct }
  const [promoMsg, setPromoMsg] = useState("");

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null); // { oid, total }
  const prefilled = useRef(false);

  /* ── prefill from account ── */
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    const [fname = "", ...rest] = String(user.name || "").trim().split(/\s+/);
    setInputs((p) => ({ ...p, fname: p.fname || fname, lname: p.lname || rest.join(" "), email: p.email || user.email || "", phone: p.phone || user.phone || "" }));
  }, [user]);

  /* ── reference data ── */
  useEffect(() => {
    fetch("/api1/offer").then((r) => r.json()).then((d) => setPromoCodes(Array.isArray(d) ? d : [])).catch(() => {});

    fetch("https://ipwho.is/").then((r) => r.json()).then((d) => {
      if (!d?.country_code) return;
      setDial({ code: d.country_code, flag: `https://flagcdn.com/24x18/${d.country_code.toLowerCase()}.png`, dial: `+${d.calling_code}` });
      setInputs((p) => (p.country ? p : { ...p, country: d.country || "" }));
    }).catch(() => {});

    (async () => {
      try {
        const r = await fetch("https://restcountries.com/v3.1/all?fields=name");
        const d = await r.json();
        setCountries(d.map((c) => c.name.common).sort());
      } catch {
        try {
          const r = await fetch("https://countriesnow.space/api/v0.1/countries");
          const d = await r.json();
          if (d?.data) setCountries(d.data.map((c) => c.country).sort());
        } catch {}
      }
    })();
  }, []);

  /* ── cities for the selected country ── */
  useEffect(() => {
    const country = inputs.country;
    if (!country) { setCities([]); return; }
    let cancelled = false;
    setLoadingCities(true);
    setCities([]);
    (async () => {
      let list = [];
      try {
        const r = await fetch("https://countriesnow.space/api/v0.1/countries/cities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country }) });
        const d = await r.json();
        if (d?.data?.length) list = d.data;
      } catch {}
      if (!list.length) {
        try {
          const cc = COUNTRY_CODES[country];
          if (cc) {
            const r = await fetch(`https://secure.geonames.org/searchJSON?country=${cc}&featureClass=P&maxRows=1000&username=demo`);
            const d = await r.json();
            if (d?.geonames) list = [...new Set(d.geonames.map((g) => g.name))].sort();
          }
        } catch {}
      }
      if (!cancelled) { setCities(list); setLoadingCities(false); }
    })();
    return () => { cancelled = true; };
  }, [inputs.country]);

  /* ── money ── */
  const deliveryFee = useMemo(() => {
    if (subtotal >= FREE_DELIVERY_FROM || promo?.freeDelivery) return 0;
    return inputs.city?.trim().toLowerCase() === "beirut" ? 3 : 4;
  }, [subtotal, inputs.city, promo]);
  const discount = useMemo(() => (promo?.pct ? +((subtotal + deliveryFee) * (promo.pct / 100)).toFixed(2) : 0), [promo, subtotal, deliveryFee]);
  const total = useMemo(() => Math.max(0, subtotal + deliveryFee - discount).toFixed(2), [subtotal, deliveryFee, discount]);

  const applyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toLowerCase();
    if (!code) return;
    if (code === "freedelivery1") { setPromo({ code, pct: 0, freeDelivery: true }); setPromoMsg("Free delivery applied."); return; }
    if (code === "abcd1234") {
      if (typeof window !== "undefined" && localStorage.getItem("usedAbcd1234") === "true") { setPromoMsg("This code has already been used."); return; }
      setPromo({ code, pct: 10, once: true }); setPromoMsg("10% discount applied."); return;
    }
    const found = promoCodes.find((p) => String(p.code || "").toLowerCase() === code);
    if (found) { setPromo({ code, pct: Number(found.per) || 0 }); setPromoMsg(`${found.per}% discount applied.`); }
    else { setPromo(null); setPromoMsg("Invalid promo code."); }
  };

  /* ── form ── */
  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === "phone") v = v.startsWith("+") ? "+" + v.slice(1).replace(/\D/g, "") : v.replace(/\D/g, "");
    if (k === "country") setInputs((p) => ({ ...p, country: v, city: "" }));
    else setInputs((p) => ({ ...p, [k]: v }));
  };

  const fullPhone = useMemo(() => {
    const raw = inputs.phone.trim();
    if (!raw) return "";
    if (raw.startsWith("+")) return raw;
    const d = dial.dial.replace("+", "");
    return d && !raw.startsWith(d) ? `${dial.dial}${raw.replace(/^0+/, "")}` : `+${raw}`;
  }, [inputs.phone, dial]);

  const validate = () => {
    const { fname, lname, email, country, city, address } = inputs;
    if (!fname || !lname || !email || !country || !city || !address || !inputs.phone) return "Please fill in all required fields.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (inputs.phone.replace(/\D/g, "").length < 6) return "Please enter a valid phone number.";
    return "";
  };

  const buildMessage = (payload) => {
    const lines = payload.items.map((it, i) =>
      `Item ${i + 1}: ${it.title}\n  Qty: ${it.quantity || 1}  ·  Price: $${unitPrice(it).toFixed(2)}${it.selectedColor ? `\n  Colour: ${it.selectedColor}` : ""}${it.selectedSize ? `\n  Size: ${it.selectedSize}` : ""}\n  ${it.img?.[0] || ""}`
    ).join("\n\n");
    return `*New order${payload.oid ? ` #${payload.oid}` : ""}*\n\n*Customer*\nName: ${payload.inputs.fname} ${payload.inputs.lname}\nEmail: ${payload.inputs.email}\nPhone: ${payload.inputs.phone}\nCountry: ${payload.inputs.country}\nCity: ${payload.inputs.city}\nAddress: ${payload.inputs.address}${payload.inputs.apt ? `\nApt / Floor: ${payload.inputs.apt}` : ""}\n\n*Order*\n${lines}\n\nSubtotal: $${subtotal.toFixed(2)}\nDelivery: $${deliveryFee.toFixed(2)}${discount ? `\nDiscount (${payload.code}): -$${discount.toFixed(2)}` : ""}\n*Total: $${payload.total}*`;
  };

  const placeOrder = useCallback(async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setPlacing(true);

    const items = cart.map((it) => ({ ...it, quantity: parseInt(it.quantity, 10) || 1 }));
    const finalInputs = { ...inputs, phone: fullPhone };
    const payload = { items, inputs: finalInputs, total, delivery: deliveryFee, code: promo?.code || "" };

    try {
      // 1. stock
      for (const it of items) {
        let url, body;
        if (it.type === "single") { url = `/api1/stock/${it._id}`; body = { qty: it.quantity }; }
        else if (it.type === "collection" && it.selectedSize) { url = `/api1/stock2/${it._id}`; body = { id: it._id, qty: it.quantity, color: it.selectedColor, size: it.selectedSize }; }
        else { url = `/api1/stock1/${it._id}`; body = { id: it._id, color: it.selectedColor, qty: it.quantity }; }
        const r = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || `Not enough stock for ${it.title}.`); }
      }
      // 2. order
      const r = await fetch("/api1/sendOrder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error("We couldn't save your order. Please try again.");
      const saved = await r.json().catch(() => ({}));
      // 3. email (non-blocking)
      fetch("/api1/sendEmail3", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, inputs: finalInputs, subtotal, delivery: deliveryFee, total }) }).catch(() => {});

      if (promo?.once && typeof window !== "undefined") localStorage.setItem("usedAbcd1234", "true");

      // 4. WhatsApp
      const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage({ ...payload, oid: saved.oid }))}`;
      window.open(url, "_blank", "noopener");

      clearCart();
      setPlaced({ oid: saved.oid, total, wa: url });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }, [cart, inputs, fullPhone, total, deliveryFee, promo, subtotal, discount, clearCart]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── views ── */
  if (placed) {
    return (
      <div className="co">
        <div className="co__success">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-7" /></svg>
          <h2>Thank you{inputs.fname ? `, ${inputs.fname}` : ""}</h2>
          <p>Your order{placed.oid ? ` #${placed.oid}` : ""} has been received. We've opened WhatsApp so you can confirm it with our team — if it didn't open, use the button below.</p>
          <a className="rd-btn" href={placed.wa} target="_blank" rel="noreferrer">Confirm on WhatsApp</a>
          <div><a className="co__back" href="/shop"><svg viewBox="0 0 12 12"><path d="M7.5 2L3.5 6l4 4" /></svg>Continue shopping</a></div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="co">
        <div className="co__empty">
          <svg viewBox="0 0 24 24"><path d="M4 7.5h16v12H4z" /><path d="M7.5 7.5c0-2.6 2-4.5 4.5-4.5s4.5 1.9 4.5 4.5" /></svg>
          <p>Your bag is empty.</p>
          <a className="rd-btn" style={{ width: "auto" }} href="/shop">Continue shopping</a>
        </div>
      </div>
    );
  }

  const Summary = (
    <aside className="co__summary">
      <button type="button" className={`co__summary-head ${summaryOpen ? "is-open" : ""}`} onClick={() => setSummaryOpen((o) => !o)} aria-expanded={summaryOpen}>
        <h2>Order summary <Chevron /></h2>
        <b>${total}</b>
      </button>

      <div className={`co__summary-body ${summaryOpen ? "is-open" : ""}`}>
        <div className="co__items">
          {cart.map((it) => {
            const q = parseInt(it.quantity, 10) || 1;
            return (
              <div className="co__item" key={lineKey(it)}>
                <div className="co__item-img">
                  <span className="co__item-qty">{q}</span>
                  {it.img?.[0] && <img src={thumb(it.img[0])} alt={it.title} />}
                </div>
                <div>
                  <div className="co__item-name">{it.title}</div>
                  {(it.selectedColor || it.selectedSize) && (
                    <div className="co__item-meta">{[it.selectedColor, it.selectedSize].filter(Boolean).join(" · ")}</div>
                  )}
                </div>
                <div className="co__item-right">
                  <span className="co__item-price">${(unitPrice(it) * q).toFixed(2)}</span>
                  <button type="button" className="co__item-rm" onClick={() => removeFromCart(it._id)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>

        <form className="co__promo" onSubmit={applyPromo}>
          <input className="rd-input" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} disabled={!!promo} />
          {promo ? (
            <button type="button" className="rd-btn rd-btn--ghost" onClick={() => { setPromo(null); setPromoCode(""); setPromoMsg(""); }}>Remove</button>
          ) : (
            <button type="submit" className="rd-btn">Apply</button>
          )}
        </form>
        {promoMsg && <div className={promo ? "rd-success" : "rd-error"} style={{ marginBottom: "1rem" }}>{promoMsg}</div>}

        <div className="co__totals">
          <div><span className="muted">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div><span className="muted">Delivery</span>{deliveryFee === 0 ? <span className="free">Free</span> : <span>${deliveryFee.toFixed(2)}</span>}</div>
          {discount > 0 && <div><span className="muted">Discount</span><span>-${discount.toFixed(2)}</span></div>}
          <div className="grand"><span>Total</span><span>${total}</span></div>
        </div>
        {subtotal < FREE_DELIVERY_FROM && deliveryFee > 0 && (
          <p className="co__hint" style={{ marginTop: ".75rem" }}>Add ${(FREE_DELIVERY_FROM - subtotal).toFixed(2)} more for free delivery.</p>
        )}

        <div className="co__trust">
          <div><svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z" /></svg>Genuine</div>
          <div><svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17.5" cy="17.5" r="1.5" /></svg>Fast delivery</div>
          <div><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2z" /></svg>WhatsApp</div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="co">
      <header className="co__head">
        <nav className="co__steps" aria-label="Progress"><a href="/shop">Shop</a><span>/</span><span>Bag</span><span>/</span><span className="cur">Checkout</span></nav>
        <h1>Checkout</h1>
        <p>Cash on delivery · confirmed with you on WhatsApp</p>
      </header>

      <div className="co__layout">
        <form onSubmit={placeOrder} noValidate>
          <section className="co__section">
            <h2 className="co__section-title"><i>1</i>Contact</h2>
            <div>
              <label className="rd-label" htmlFor="co-email">Email *</label>
              <input id="co-email" className="rd-input" type="email" autoComplete="email" value={inputs.email} onChange={set("email")} required />
              {!user && <p className="co__hint">Have an account? <a href="/login?next=/checkout1">Sign in</a> to track your orders.</p>}
            </div>
            <div>
              <label className="rd-label" htmlFor="co-phone">Phone *</label>
              <div className="co__phone">
                <span className="co__dial">{dial.flag && <img src={dial.flag} alt={dial.code} />}{dial.dial || "+"}</span>
                <input id="co-phone" className="rd-input" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Phone number" value={inputs.phone} onChange={set("phone")} required />
              </div>
            </div>
          </section>

          <section className="co__section">
            <h2 className="co__section-title"><i>2</i>Delivery</h2>
            <div className="co__row">
              <div>
                <label className="rd-label" htmlFor="co-fname">First name *</label>
                <input id="co-fname" className="rd-input" autoComplete="given-name" value={inputs.fname} onChange={set("fname")} required />
              </div>
              <div>
                <label className="rd-label" htmlFor="co-lname">Last name *</label>
                <input id="co-lname" className="rd-input" autoComplete="family-name" value={inputs.lname} onChange={set("lname")} required />
              </div>
            </div>
            <div className="co__row">
              <div>
                <label className="rd-label" htmlFor="co-country">Country *</label>
                <select id="co-country" className="rd-input" value={inputs.country} onChange={set("country")} required>
                  <option value="">Select country</option>
                  {inputs.country && !countries.includes(inputs.country) && <option value={inputs.country}>{inputs.country}</option>}
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="rd-label" htmlFor="co-city">City *</label>
                {cities.length > 0 ? (
                  <select id="co-city" className="rd-input" value={inputs.city} onChange={set("city")} disabled={loadingCities || !inputs.country} required>
                    <option value="">{loadingCities ? "Loading cities…" : "Select city"}</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input id="co-city" className="rd-input" placeholder={loadingCities ? "Loading cities…" : !inputs.country ? "Select a country first" : "City"} value={inputs.city} onChange={set("city")} disabled={!inputs.country} required />
                )}
              </div>
            </div>
            <div>
              <label className="rd-label" htmlFor="co-address">Address *</label>
              <input id="co-address" className="rd-input" autoComplete="street-address" placeholder="Street, building" value={inputs.address} onChange={set("address")} required />
            </div>
            <div>
              <label className="rd-label" htmlFor="co-apt">Apartment / floor <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input id="co-apt" className="rd-input" value={inputs.apt} onChange={set("apt")} />
            </div>
          </section>

          {/* On mobile the summary sits between the form and the CTA */}
          <div className="lg:hidden" style={{ marginBottom: "1.5rem" }}>{Summary}</div>

          <section className="co__section">
            <h2 className="co__section-title"><i>3</i>Payment</h2>
            <div className="ac__card" style={{ fontSize: 13, lineHeight: 1.7 }}>
              <b style={{ fontWeight: 500 }}>Cash on delivery.</b> When you place the order we save it and open WhatsApp with your order details so our team can confirm delivery time with you.
            </div>
          </section>

          {error && <div className="rd-error" style={{ marginBottom: "1rem" }}>{error}</div>}

          <div className="co__place">
            <button type="submit" className="rd-btn" disabled={placing}>{placing ? "Placing order…" : `Place order · $${total}`}</button>
            <p>By placing your order you agree to our <a href="/term" style={{ textDecoration: "underline" }}>terms</a> and <a href="/privacy" style={{ textDecoration: "underline" }}>privacy policy</a>.</p>
          </div>
          <a className="co__back" href="/shop"><svg viewBox="0 0 12 12"><path d="M7.5 2L3.5 6l4 4" /></svg>Continue shopping</a>
        </form>

        <div className="hidden lg:block">{Summary}</div>
      </div>
    </div>
  );
}
