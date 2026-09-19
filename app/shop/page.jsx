"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../../components1/shop/ProductCard";

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  ["featured", "Featured"],
  ["best-selling", "Best selling"],
  ["title-asc", "Alphabetically, A–Z"],
  ["title-desc", "Alphabetically, Z–A"],
  ["price-asc", "Price, low to high"],
  ["price-desc", "Price, high to low"],
  ["newest", "Date, new to old"],
  ["oldest", "Date, old to new"],
];

/* ────────── small pieces ────────── */

const Chevron = () => (
  <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 1l4 4 4-4" /></svg>
);
const Cross = () => (
  <svg viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.3" fill="none"><path d="M1 1l8 8M9 1L1 9" /></svg>
);
const Tick = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.6"><path d="M1.5 5.2l2.3 2.3L8.5 2.5" /></svg>
);

function FilterGroup({ title, defaultOpen = true, children, scroll = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="fg">
      <button type="button" className={`fg__head ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}
        <Chevron />
      </button>
      {open && <div className={`fg__body ${scroll ? "is-scroll" : ""}`}>{children}</div>}
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="chk">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="chk__box"><Tick /></span>
      <span>{label}</span>
    </label>
  );
}

function PriceRange({ bounds, value, onCommit }) {
  const [lo, setLo] = useState(value[0] ?? bounds.min);
  const [hi, setHi] = useState(value[1] ?? bounds.max);
  useEffect(() => {
    setLo(value[0] ?? bounds.min);
    setHi(value[1] ?? bounds.max);
  }, [value, bounds.min, bounds.max]);

  const span = Math.max(1, bounds.max - bounds.min);
  const pct = (v) => ((v - bounds.min) / span) * 100;
  const commit = () => onCommit([Math.min(lo, hi), Math.max(lo, hi)]);

  return (
    <div className="price-range">
      <div className="price-range__slider">
        <div className="price-range__track" />
        <div className="price-range__fill" style={{ left: `${pct(Math.min(lo, hi))}%`, right: `${100 - pct(Math.max(lo, hi))}%` }} />
        <input type="range" min={bounds.min} max={bounds.max} value={lo} onChange={(e) => setLo(+e.target.value)} onMouseUp={commit} onTouchEnd={commit} onKeyUp={commit} />
        <input type="range" min={bounds.min} max={bounds.max} value={hi} onChange={(e) => setHi(+e.target.value)} onMouseUp={commit} onTouchEnd={commit} onKeyUp={commit} />
      </div>
      <div className="price-range__inputs">
        <input className="rd-input" type="number" value={lo} min={bounds.min} max={bounds.max} onChange={(e) => setLo(+e.target.value)} onBlur={commit} aria-label="Min price" />
        <span>to</span>
        <input className="rd-input" type="number" value={hi} min={bounds.min} max={bounds.max} onChange={(e) => setHi(+e.target.value)} onBlur={commit} aria-label="Max price" />
      </div>
    </div>
  );
}

function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const push = (p) => pages.push(p);
  const win = 2;
  push(1);
  if (page - win > 2) push("…");
  for (let p = Math.max(2, page - win); p <= Math.min(totalPages - 1, page + win); p++) push(p);
  if (page + win < totalPages - 1) push("…");
  if (totalPages > 1) push(totalPages);

  return (
    <nav className="sk__pager" aria-label="Pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M9 2L4 7l5 5" /></svg>
      </button>
      {pages.map((p, i) =>
        p === "…" ? <span key={`e${i}`} style={{ padding: "0 .3rem", color: "var(--rd-gray)" }}>…</span> : (
          <button key={p} className={p === page ? "is-current" : ""} onClick={() => onChange(p)} aria-current={p === page ? "page" : undefined}>{p}</button>
        )
      )}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M5 2l5 5-5 5" /></svg>
      </button>
    </nav>
  );
}

/* ────────── page ────────── */

function ShopInner() {
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [subs, setSubs] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allSizes, setAllSizes] = useState([]);

  const [selCats, setSelCats] = useState(() => searchParams.getAll("cat"));
  const [selSubs, setSelSubs] = useState(() => searchParams.getAll("sub"));
  const [selBrands, setSelBrands] = useState(() => searchParams.getAll("brnd"));
  const [selSizes, setSelSizes] = useState([]);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [price, setPrice] = useState([null, null]);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });
  const boundsLocked = useRef(false);

  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);

  const q = searchParams.get("q") || "";

  /* reference data */
  useEffect(() => {
    const get = (u, set) => fetch(u).then((r) => r.json()).then((d) => set(Array.isArray(d) ? d : [])).catch(() => set([]));
    get("/api1/category", setCategories);
    get("/api1/sub", setSubs);
    get("/api1/brand", setBrands);
    fetch("/api1/productsz1?page=1&limit=1000")
      .then((r) => r.json())
      .then((d) => {
        const set = new Set();
        (d.products || []).forEach((p) => p.color?.forEach((c) => c.sizes?.forEach((s) => s.size && set.add(s.size))));
        setAllSizes([...set]);
        if (d.priceRange && !boundsLocked.current) {
          setBounds(d.priceRange);
          boundsLocked.current = true;
        }
      })
      .catch(() => {});
  }, []);

  /* products */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(PAGE_SIZE));
    p.set("sort", sort);
    if (q) p.set("q", q);
    selCats.forEach((c) => p.append("cat", c));
    selSubs.forEach((c) => p.append("sub", c));
    selBrands.forEach((c) => p.append("brnd", c));
    selSizes.forEach((c) => p.append("size", c));
    if (inStock) p.set("inStock", "1");
    if (onSale) p.set("onSale", "1");
    if (price[0] != null) p.set("minPrice", String(price[0]));
    if (price[1] != null) p.set("maxPrice", String(price[1]));
    try {
      const res = await fetch(`/api1/productsz1?${p.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, q, selCats, selSubs, selBrands, selSizes, inStock, onSale, price]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page]);
  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [drawer]);

  const toggle = (setter) => (val) => { setPage(1); setter((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val])); };
  const toggleCat = toggle(setSelCats), toggleSub = toggle(setSelSubs), toggleBrand = toggle(setSelBrands), toggleSize = toggle(setSelSizes);

  const chips = useMemo(() => {
    const out = [];
    selCats.forEach((v) => out.push({ k: "cat", v, label: v, rm: () => toggleCat(v) }));
    selSubs.forEach((v) => out.push({ k: "sub", v, label: v, rm: () => toggleSub(v) }));
    selBrands.forEach((v) => out.push({ k: "brnd", v, label: v, rm: () => toggleBrand(v) }));
    selSizes.forEach((v) => out.push({ k: "size", v, label: `Size ${v}`, rm: () => toggleSize(v) }));
    if (inStock) out.push({ k: "stock", v: 1, label: "In stock", rm: () => setInStock(false) });
    if (onSale) out.push({ k: "sale", v: 1, label: "On sale", rm: () => setOnSale(false) });
    if (price[0] != null || price[1] != null) out.push({ k: "price", v: 1, label: `$${price[0] ?? bounds.min} – $${price[1] ?? bounds.max}`, rm: () => setPrice([null, null]) });
    return out;
  }, [selCats, selSubs, selBrands, selSizes, inStock, onSale, price, bounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAll = () => { setSelCats([]); setSelSubs([]); setSelBrands([]); setSelSizes([]); setInStock(false); setOnSale(false); setPrice([null, null]); setPage(1); };

  const heading = q ? `Search: “${q}”` : selCats.length === 1 ? selCats[0] : selBrands.length === 1 ? selBrands[0] : "Shop";

  const Filters = (
    <>
      <FilterGroup title="Availability">
        <Check label="In stock" checked={inStock} onChange={() => { setPage(1); setInStock(!inStock); }} />
        <Check label="On sale" checked={onSale} onChange={() => { setPage(1); setOnSale(!onSale); }} />
      </FilterGroup>
      {bounds.max > bounds.min && (
        <FilterGroup title="Price">
          <PriceRange bounds={bounds} value={price} onCommit={(v) => { setPage(1); setPrice(v[0] <= bounds.min && v[1] >= bounds.max ? [null, null] : v); }} />
        </FilterGroup>
      )}
      {categories.length > 0 && (
        <FilterGroup title="Category" scroll>
          {categories.map((c) => <Check key={c.id || c.name} label={c.name} checked={selCats.includes(c.name)} onChange={() => toggleCat(c.name)} />)}
        </FilterGroup>
      )}
      {subs.length > 0 && (
        <FilterGroup title="Product type" scroll defaultOpen={false}>
          {subs.map((c) => <Check key={c.id || c.name} label={c.name} checked={selSubs.includes(c.name)} onChange={() => toggleSub(c.name)} />)}
        </FilterGroup>
      )}
      {brands.length > 0 && (
        <FilterGroup title="Brand" scroll>
          {brands.map((c) => <Check key={c.id || c.name} label={c.name} checked={selBrands.includes(c.name)} onChange={() => toggleBrand(c.name)} />)}
        </FilterGroup>
      )}
      {allSizes.length > 0 && (
        <FilterGroup title="Size" defaultOpen={false}>
          {allSizes.map((s) => <Check key={s} label={s} checked={selSizes.includes(s)} onChange={() => toggleSize(s)} />)}
        </FilterGroup>
      )}
    </>
  );

  return (
    <div className="sk">
      <header className="sk__head">
        <nav className="sk__crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>{heading}</span></nav>
        <h1 className="sk__title">{heading}</h1>
        <p className="sk__desc">Professional haircare and beauty essentials, hand-picked by Rafi Daham. 100% genuine products.</p>
      </header>

      <div className="sk__toolbar">
        <div className="sk__toolbar-l">
          <button type="button" className="sk__filter-btn" onClick={() => setDrawer(true)}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4h13M1.5 8h13M1.5 12h13" /><circle cx="5" cy="4" r="1.4" fill="#fff" /><circle cx="11" cy="8" r="1.4" fill="#fff" /><circle cx="6.5" cy="12" r="1.4" fill="#fff" /></svg>
            Filter{chips.length ? ` (${chips.length})` : ""}
          </button>
          <span className="sk__count">{loading && products === null ? "Loading…" : `${totalItems} item${totalItems === 1 ? "" : "s"}`}</span>
        </div>
        <label className="sk__sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => { setPage(1); setSort(e.target.value); }} aria-label="Sort by">
            {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      <div className="sk__layout">
        <aside className="sk__aside" aria-label="Filters">{Filters}</aside>

        {drawer && (
          <>
            <div className="sk__backdrop" onClick={() => setDrawer(false)} />
            <aside className="sk__aside is-drawer" aria-label="Filters">
              <div className="sk__drawer-head">
                <h3>Filters</h3>
                <button onClick={() => setDrawer(false)} aria-label="Close filters"><svg width="18" height="18" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2" fill="none"><path d="M1 1l8 8M9 1L1 9" /></svg></button>
              </div>
              {Filters}
              <div className="sk__drawer-foot">
                <button className="rd-btn rd-btn--ghost" onClick={clearAll}>Clear</button>
                <button className="rd-btn" onClick={() => setDrawer(false)}>Show {totalItems} results</button>
              </div>
            </aside>
          </>
        )}

        <section>
          {chips.length > 0 && (
            <div className="sk__active">
              {chips.map((c) => (
                <button key={`${c.k}-${c.v}`} className="sk__chip" onClick={c.rm}>{c.label}<Cross /></button>
              ))}
              <button className="sk__clear" onClick={clearAll}>Clear all</button>
            </div>
          )}

          {products === null ? (
            <div className="sk__grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sk__skel" />)}</div>
          ) : products.length === 0 ? (
            <div className="sk__empty">
              <p>No products match your selection.</p>
              {chips.length > 0 && <button className="rd-btn rd-btn--sm" style={{ width: "auto", marginTop: "1rem" }} onClick={clearAll}>Clear filters</button>}
            </div>
          ) : (
            <div className={`sk__grid ${loading ? "is-loading" : ""}`}>
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <Pager page={page} totalPages={totalPages} onChange={setPage} />
        </section>
      </div>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="sk" style={{ minHeight: "60vh" }} />}>
      <ShopInner />
    </Suspense>
  );
}
