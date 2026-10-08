"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useBooleanValue } from "../context/CartBoolContext";
import QuantitySelector from "../../components1/QuantitySelector";
import OutOfStockComponent from "../../components1/OutOfStockComponent";
import ProductCard from "../../components1/shop/ProductCard";
import { getPricing, isSoldOut } from "../../components1/shop/productInfo";
import FavButton from "../../components1/shop/FavButton";
import Stars from "../../components1/shop/Stars";
import Reviews from "../../components1/shop/Reviews";

/* ────────── helpers ────────── */
const Plus = () => (<svg viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.2" fill="none"><path d="M6 1v10M1 6h10" /></svg>);
const ArrowL = () => (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M10 3L5 8l5 5" /></svg>);
const ArrowR = () => (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 3l5 5-5 5" /></svg>);

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="acc">
      <button type="button" className={`acc__head ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}<Plus />
      </button>
      {open && <div className="acc__body">{children}</div>}
    </div>
  );
}

const TRUST = [
  { t: "100% genuine products", i: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z" /><path d="M8.5 12l2.3 2.3L15.5 9.5" /></svg> },
  { t: "Salon-professional advice", i: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 5h16v11H9l-5 4V5z" /></svg> },
  { t: "Fast delivery across Lebanon", i: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17.5" cy="17.5" r="1.5" /></svg> },
  { t: "Secure checkout", i: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="10" width="16" height="10" /><path d="M8 10V7a4 4 0 018 0v3" /></svg> },
];

/* ────────── page ────────── */
/** The product page UI; rendered by /product?id=… and /product/<barcode>. */
export default function ProductView({ id }) {
  const router = useRouter();

  const { cart, addToCart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);

  /* fetch product */
  useEffect(() => {
    if (!id) return;
    setProduct(null);
    fetch(`/api1/products/${id}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d[0]) setProduct(d[0]); else setNotFound(true); })
      .catch(() => setNotFound(true));
  }, [id]);

  /* related */
  useEffect(() => {
    if (!product?.category) return;
    fetch(`/api1/products1/${encodeURIComponent(product.category)}`)
      .then((r) => r.json())
      .then((d) => setRelated((Array.isArray(d) ? d : []).filter((p) => p._id !== product._id).slice(0, 8)))
      .catch(() => {});
  }, [product?.category, product?._id]);

  /* derived */
  const imgs = product?.img || [];
  const colors = useMemo(() => (Array.isArray(product?.color) ? product.color : []), [product]);
  const isCollection = product?.type === "collection";
  const hasSizes = colors.some((c) => Array.isArray(c.sizes) && c.sizes.length > 0);
  const inCart = cart?.some((item) => item._id === id);

  const colorsWithSizes = colors.filter((c) => c.sizes?.some((s) => parseInt(s.qty) > 0));
  const colorsWithoutSizes = colors.filter((c) => (!c.sizes || c.sizes.length === 0) && parseInt(c.qty) > 0);
  const selectableColors = hasSizes ? colorsWithSizes : colorsWithoutSizes;
  const currentColor = colors.find((c) => c.title === selectedColor);
  const sizesForColor = (currentColor?.sizes || []).filter((s) => parseInt(s.qty) > 0);

  /* default selections */
  useEffect(() => {
    if (!colors.length) return;
    const first = colors.find((c) => c.sizes?.some((s) => parseInt(s.qty) > 0)) || colors.find((c) => parseInt(c.qty) > 0) || colors[0];
    if (!first) return;
    setSelectedColor(first.title);
    const firstSize = first.sizes?.find((s) => parseInt(s.qty) > 0);
    setSelectedSize(firstSize ? firstSize.size : null);
  }, [colors]);

  /* pricing (size-level price overrides when present) */
  const pricing = useMemo(() => {
    const base = getPricing(product || {});
    const sizeObj = sizesForColor.find((s) => s.size === selectedSize);
    if (sizeObj?.price != null && sizeObj.price !== "") {
      const p = parseFloat(String(sizeObj.price)) || 0;
      const orig = parseFloat(String(product?.price ?? "0")) || 0;
      const isSale = orig > p && orig > 0;
      return { now: p, was: isSale ? orig : null, isSale, pct: isSale ? Math.round(((orig - p) / orig) * 100) : 0 };
    }
    return base;
  }, [product, sizesForColor, selectedSize]);

  const outOfStock = useMemo(() => isSoldOut(product), [product]);

  const openCart = useCallback(() => {
    const cartb2 = document.getElementById("cartid2");
    setBooleanValue(!isBooleanValue);
    if (cartb2) {
      if (isBooleanValue) cartb2.className += " MiniCart_Cart-visible";
      else cartb2.classList.remove("MiniCart_Cart-visible");
    }
  }, [isBooleanValue, setBooleanValue]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (isCollection && !selectedColor) return alert("Please select a colour.");
    if (currentColor?.sizes?.length > 0 && !selectedSize) return alert("Please select a size.");
    addToCart(product, quantity, selectedColor, selectedSize);
    openCart();
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: product?.title, url }); return; } catch {} }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const rating = summary || product?.rating || { avg: 0, count: 0 };
  const scrollToReviews = () => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });

  /* keyboard for zoom */
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") setActive((a) => (a + 1) % imgs.length);
      if (e.key === "ArrowLeft") setActive((a) => (a - 1 + imgs.length) % imgs.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, imgs.length]);

  if (notFound) return <div className="sk__empty"><p>Product not found.</p><a className="rd-btn rd-btn--sm" style={{ width: "auto", marginTop: "1rem" }} href="/shop">Back to shop</a></div>;
  if (!product) return <div className="pd" style={{ minHeight: "70vh" }} />;

  const big = (u) => (u ? u.replace("/upload/", "/upload/f_auto,q_auto,w_1200/") : u);
  const thumb = (u) => (u ? u.replace("/upload/", "/upload/f_auto,q_auto,w_160/") : u);

  return (
    <div className="pd">
      {/* Zoom overlay */}
      {zoom && imgs.length > 0 && (
        <div className="pd__zoom" onClick={() => setZoom(false)}>
          <button aria-label="Close" onClick={() => setZoom(false)}>×</button>
          {imgs.length > 1 && (<>
            <button className="pd__nav pd__nav--prev" onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + imgs.length) % imgs.length); }} aria-label="Previous"><ArrowL /></button>
            <button className="pd__nav pd__nav--next" onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % imgs.length); }} aria-label="Next"><ArrowR /></button>
          </>)}
          <img src={imgs[active]} alt={product.title} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <nav className="pd__crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a><span>/</span>
        <a href="/shop">Shop</a><span>/</span>
        {product.category && (<><a href={`/shop?cat=${encodeURIComponent(product.category.trim())}`}>{product.category}</a><span>/</span></>)}
        <span className="cur">{product.title}</span>
      </nav>

      <div className="pd__top">
        {/* Gallery */}
        <div className={`pd__gallery ${imgs.length > 1 ? "has-thumbs" : ""}`}>
          {imgs.length > 1 && (
            <div className="pd__thumbs">
              {imgs.map((u, i) => (
                <button key={i} type="button" className={`pd__thumb ${i === active ? "is-active" : ""}`} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}>
                  <img src={thumb(u)} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className="pd__main" onClick={() => setZoom(true)}>
            <div className="pc__badges">
              {outOfStock && <span className="pc__badge pc__badge--soldout">Sold out</span>}
              {!outOfStock && pricing.isSale && <span className="pc__badge pc__badge--sale">Save {pricing.pct}%</span>}
              {product.arrival === "yes" && <span className="pc__badge pc__badge--new">New</span>}
            </div>
            {imgs[active] ? <img src={big(imgs[active])} alt={product.title} /> : <div style={{ aspectRatio: "1/1" }} />}
            {imgs.length > 1 && (<>
              <button className="pd__nav pd__nav--prev" onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + imgs.length) % imgs.length); }} aria-label="Previous image"><ArrowL /></button>
              <button className="pd__nav pd__nav--next" onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % imgs.length); }} aria-label="Next image"><ArrowR /></button>
            </>)}
          </div>
        </div>

        {/* Info */}
        <div className="pd__info">
          {product.factory && <a className="pd__brand" href={`/shop?brnd=${encodeURIComponent(product.factory.trim())}`}>{product.factory}</a>}
          <h1 className="pd__title">{product.title}</h1>
          {product.barcode && (
            <div className="pd__code">
              Item code <span>{product.barcode}</span>
              {/* Spaced codes are also shown compact so either spelling is searchable */}
              {/\s/.test(product.barcode) && <> ({product.barcode.replace(/\s+/g, "")})</>}
            </div>
          )}

          <button type="button" className="pd__rating" onClick={scrollToReviews}>
            <Stars value={rating.avg} />
            <span>{rating.count ? <>{rating.avg.toFixed(1)} · <u>{rating.count} review{rating.count === 1 ? "" : "s"}</u></> : <u>Be the first to review</u>}</span>
          </button>

          <div>
            <div className="pd__price">
              <span className={`pd__price-now ${pricing.isSale ? "is-sale" : ""}`}>${pricing.now.toFixed(2)}</span>
              {pricing.was && <span className="pd__price-was">${pricing.was.toFixed(2)}</span>}
              {pricing.isSale && <span className="pd__save">Save {pricing.pct}%</span>}
            </div>
            <div className="pd__tax">Tax included. Shipping calculated at checkout.</div>
          </div>

          <span className={`pd__stock ${outOfStock ? "is-out" : ""}`}><i />{outOfStock ? "Out of stock" : "In stock, ready to ship"}</span>

          {/* Variants */}
          {isCollection && selectableColors.length > 0 && (
            <div className="pd__opt">
              <span className="pd__opt-label">Colour<b>{selectedColor}</b></span>
              <div className="pd__swatches">
                {selectableColors.map((c, i) => (
                  <button key={i} type="button" className={`pd__swatch ${selectedColor === c.title ? "is-active" : ""}`} title={c.title} aria-label={c.title}
                    onClick={() => { setSelectedColor(c.title); const fs = c.sizes?.find((s) => parseInt(s.qty) > 0); setSelectedSize(fs ? fs.size : null); }}>
                    <span style={{ background: c.code || "#ddd" }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {isCollection && sizesForColor.length > 0 && (
            <div className="pd__opt">
              <span className="pd__opt-label">Size<b>{selectedSize}</b></span>
              <div className="pd__sizes">
                {sizesForColor.map((s, i) => (
                  <button key={i} type="button" className={`pd__size ${selectedSize === s.size ? "is-active" : ""}`} onClick={() => setSelectedSize(s.size)}>{s.size}</button>
                ))}
              </div>
            </div>
          )}

          {/* Buy */}
          {outOfStock ? (
            <OutOfStockComponent itemName={product.title} />
          ) : inCart ? (
            <div className="pd__buy" style={{ gridTemplateColumns: "1fr auto" }}>
              <button type="button" className="rd-btn" onClick={() => router.push("/checkout1")}>In your bag · Checkout now</button>
              <FavButton productId={product._id} variant="block" />
            </div>
          ) : (
            <form className="pd__buy" onSubmit={handleAdd}>
              <QuantitySelector initialQty={quantity} onChange={setQuantity} productId={product._id} type={product.type} selectedColor={selectedColor} selectedSize={selectedSize} />
              <button type="submit" className="rd-btn" disabled={isCollection && !selectedColor}>Add to bag · ${(pricing.now * quantity).toFixed(2)}</button>
              <FavButton productId={product._id} variant="block" />
            </form>
          )}

          <div className="pd__trust">
            {TRUST.map((t) => <div key={t.t}>{t.i}<span>{t.t}</span></div>)}
          </div>

          {/* Accordions */}
          <div>
            <Accordion title="Description" defaultOpen>
              {product.description ? <div dangerouslySetInnerHTML={{ __html: product.description }} /> : <p>No description available.</p>}
            </Accordion>
            <Accordion title="Details">
              <dl className="acc__meta">
                {product.factory && (<><dt>Brand</dt><dd>{product.factory}</dd></>)}
                {product.category && (<><dt>Category</dt><dd>{product.category}</dd></>)}
                {product.sub && (<><dt>Type</dt><dd>{product.sub}</dd></>)}
                {isCollection && colors.length > 0 && (<><dt>Colours</dt><dd>{colors.map((c) => c.title).filter(Boolean).join(", ")}</dd></>)}
                {hasSizes && (<><dt>Sizes</dt><dd>{[...new Set(colors.flatMap((c) => (c.sizes || []).map((s) => s.size)))].join(", ")}</dd></>)}
              </dl>
            </Accordion>
            <Accordion title="Shipping & returns">
              <p>Orders are prepared at the salon and dispatched within 1–2 working days. Delivery fees are calculated at checkout.</p>
              <p>Unopened products in original packaging may be returned within 7 days of delivery. Please contact us via WhatsApp to arrange a return.</p>
            </Accordion>
            <Accordion title="Need advice?">
              <p>Not sure this is the right product for your hair? Message our team on WhatsApp for personalised recommendations from Rafi Daham’s stylists.</p>
              <a className="rd-btn rd-btn--ghost rd-btn--sm" style={{ width: "auto" }} href={`https://wa.me/96178808100?text=${encodeURIComponent(`Hi, I have a question about ${product.title}`)}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
            </Accordion>
          </div>

          <div className="pd__share">
            <span>Share</span>
            <button type="button" onClick={share} aria-label="Copy link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></svg>
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(product.title + " " + (typeof window !== "undefined" ? window.location.href : ""))}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
            </a>
            {copied && <small style={{ letterSpacing: 0, textTransform: "none" }}>Link copied</small>}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <Reviews productId={product._id} onSummary={setSummary} />

      {/* Related */}
      {related.length > 0 && (
        <section className="pd__section">
          <h2 className="pd__section-title">You may also like</h2>
          <div className="pd__related-grid">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
