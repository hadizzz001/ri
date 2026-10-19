"use client";

/**
 * Shop, laid out like amadeussabra.com/collections/all: a banner under the
 * (transparent) header, a sticky toolbar (filter · product count · sort ·
 * grid density), filters in collapsible groups — a sidebar on computers, a
 * drawer on phones — and 3 products per row.
 */

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

// Banner: a still from the home page film
const bannerSrc = (w) =>
  `https://res.cloudinary.com/dgi9mfldc/video/upload/so_1,q_auto,f_auto,w_${w}/v1792417191/IMG_7607_xt9low.jpg`;

/* ────────── icons ────────── */

const Chevron = () => (
  <svg className="shp-chevron" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="m1 3 4 4 4-4" stroke="currentColor" strokeLinecap="square" />
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="m1 1 14 14M1 15 15 1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const Arrow = ({ back }) => (
  <svg viewBox="0 0 16 18" fill="none" aria-hidden="true" style={back ? { transform: "scaleX(-1)" } : undefined}>
    <path d="m5 17 8-8-8-8" stroke="currentColor" strokeLinecap="square" />
  </svg>
);

/** Grid density buttons: phones show 1 or 2 per row, computers 2, 3 or 4. */
const LAYOUTS = {
  mobile: [
    ["large", "Show larger product images", "M0 0h18v18H0z"],
    ["medium", "Show smaller product images", "M0 0h8v8H0zM0 10h8v8H0zM10 0h8v8h-8zM10 10h8v8h-8z"],
  ],
  desktop: [
    ["large", "Show larger product images", "M0 0h8v8H0zM0 10h8v8H0zM10 0h8v8h-8zM10 10h8v8h-8z"],
    ["medium", "Show smaller product images", "M0 0h4v4H0zM0 7h4v4H0zM0 14h4v4H0zM7 0h4v4H7zM7 7h4v4H7zM7 14h4v4H7zM14 0h4v4h-4zM14 7h4v4h-4zM14 14h4v4h-4z"],
    ["compact", "Show compact product images", "M0 0h18v2H0zm0 4h18v2H0zm0 4h18v2H0zm0 4h18v2H0zm0 4h18v2H0z"],
  ],
};

/* ────────── filters ────────── */

function FacetGroup({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="shp-acc">
      <button type="button" className="shp-acc__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <Chevron />
      </button>
      {open && <div className="shp-acc__content">{children}</div>}
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="shp-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="shp-switch">
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} />
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
    <div className="shp-range">
      <div
        className="shp-range__track"
        style={{ "--lo": `${pct(Math.min(lo, hi))}%`, "--hi": `${pct(Math.max(lo, hi))}%` }}
      >
        <input type="range" aria-label="From price" min={bounds.min} max={bounds.max} value={lo} onChange={(e) => setLo(+e.target.value)} onMouseUp={commit} onTouchEnd={commit} onKeyUp={commit} />
        <input type="range" aria-label="To price" min={bounds.min} max={bounds.max} value={hi} onChange={(e) => setHi(+e.target.value)} onMouseUp={commit} onTouchEnd={commit} onKeyUp={commit} />
      </div>
      <div className="shp-range__inputs">
        <label className="shp-range__field">
          <span>$</span>
          <input type="number" inputMode="numeric" aria-label="From price" value={lo} min={bounds.min} max={bounds.max} onChange={(e) => setLo(+e.target.value)} onBlur={commit} />
        </label>
        <span>to</span>
        <label className="shp-range__field">
          <span>$</span>
          <input type="number" inputMode="numeric" aria-label="To price" value={hi} min={bounds.min} max={bounds.max} onChange={(e) => setHi(+e.target.value)} onBlur={commit} />
        </label>
      </div>
    </div>
  );
}

/* ────────── toolbar pieces ────────── */

/** "Sort by": a dropdown on computers, a sheet from the bottom on phones. */
function SortMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="shp-toolbar__cell" ref={ref}>
      <button type="button" className="shp-toolbar__btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        Sort by
        <Chevron />
      </button>
      {open && (
        <div className="shp-sort">
          <div className="shp-sort__backdrop" onClick={() => setOpen(false)} />
          <div className="shp-sort__panel">
            <div className="shp-sort__head">
              <p>Sort by</p>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
                <Cross />
              </button>
            </div>
            <ul className="shp-sort__list" role="listbox" aria-label="Sort by">
              {SORT_OPTIONS.map(([v, l]) => (
                <li key={v}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={v === value}
                    onClick={() => {
                      onChange(v);
                      setOpen(false);
                    }}
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function LayoutSwitch({ device, value, onChange }) {
  return (
    <div className={`shp-toolbar__layouts shp-toolbar__layouts--${device}`}>
      {LAYOUTS[device].map(([v, label, d]) => (
        <button
          key={v}
          type="button"
          className={`shp-toolbar__btn${v === value ? " is-active" : ""}`}
          aria-label={label}
          aria-pressed={v === value}
          onClick={() => onChange(v)}
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path fill="currentColor" d={d} />
          </svg>
        </button>
      ))}
    </div>
  );
}

function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const win = 2;
  pages.push(1);
  if (page - win > 2) pages.push("…");
  for (let p = Math.max(2, page - win); p <= Math.min(totalPages - 1, page + win); p++) pages.push(p);
  if (page + win < totalPages - 1) pages.push("…");
  pages.push(totalPages);

  return (
    <nav className="shp-pager" aria-label="Pagination">
      {page > 1 && (
        <button type="button" onClick={() => onChange(page - 1)} aria-label="Previous page">
          <Arrow back />
        </button>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap${i}`}>…</span>
        ) : (
          <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? "page" : undefined} aria-label={`Page ${p}`}>
            {p}
          </button>
        )
      )}
      {page < totalPages && (
        <button type="button" onClick={() => onChange(page + 1)} aria-label="Next page">
          <Arrow />
        </button>
      )}
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
  const [layout, setLayout] = useState({ mobile: "medium", desktop: "medium" });

  const bannerRef = useRef(null);
  const shownPage = useRef(page);

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

  // A new page of results starts at the toolbar, below the banner
  useEffect(() => {
    if (shownPage.current === page) return;
    shownPage.current = page;
    const banner = bannerRef.current;
    if (banner) window.scrollTo({ top: banner.offsetTop + banner.offsetHeight, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    if (!drawer) return undefined;
    const onKey = (e) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

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
  const countLabel = `${totalItems} product${totalItems === 1 ? "" : "s"}`;

  // Groups start closed, as on amadeussabra.com, unless something in them is picked
  const Filters = (
    <div className="shp-facets__list">
      <FacetGroup title="Availability" defaultOpen={inStock || onSale}>
        <Toggle label="In stock only" checked={inStock} onChange={() => { setPage(1); setInStock(!inStock); }} />
        <Toggle label="On sale only" checked={onSale} onChange={() => { setPage(1); setOnSale(!onSale); }} />
      </FacetGroup>
      {bounds.max > bounds.min && (
        <FacetGroup title="Price" defaultOpen={price[0] != null || price[1] != null}>
          <PriceRange bounds={bounds} value={price} onCommit={(v) => { setPage(1); setPrice(v[0] <= bounds.min && v[1] >= bounds.max ? [null, null] : v); }} />
        </FacetGroup>
      )}
      {categories.length > 0 && (
        <FacetGroup title="Category" defaultOpen={selCats.length > 0}>
          {categories.map((c) => <Check key={c.id || c.name} label={c.name} checked={selCats.includes(c.name)} onChange={() => toggleCat(c.name)} />)}
        </FacetGroup>
      )}
      {subs.length > 0 && (
        <FacetGroup title="Product type" defaultOpen={selSubs.length > 0}>
          {subs.map((c) => <Check key={c.id || c.name} label={c.name} checked={selSubs.includes(c.name)} onChange={() => toggleSub(c.name)} />)}
        </FacetGroup>
      )}
      {brands.length > 0 && (
        <FacetGroup title="Brand" defaultOpen={selBrands.length > 0}>
          {brands.map((c) => <Check key={c.id || c.name} label={c.name} checked={selBrands.includes(c.name)} onChange={() => toggleBrand(c.name)} />)}
        </FacetGroup>
      )}
      {allSizes.length > 0 && (
        <FacetGroup title="Size" defaultOpen={selSizes.length > 0}>
          {allSizes.map((s) => <Check key={s} label={s} checked={selSizes.includes(s)} onChange={() => toggleSize(s)} />)}
        </FacetGroup>
      )}
    </div>
  );

  return (
    <main className="shp">
      {/* ── banner (the header lies over it) ── */}
      <section className="shp-banner" ref={bannerRef}>
        <img
          className="shp-banner__img"
          src={bannerSrc(1920)}
          srcSet={[800, 1200, 1920].map((w) => `${bannerSrc(w)} ${w}w`).join(", ")}
          sizes="100vw"
          alt=""
          fetchPriority="high"
        />
        <div className="shp-banner__content">
          <h1 className="shp-banner__title">{heading}</h1>
          <p className="shp-banner__desc">Professional haircare and beauty essentials, hand-picked by Rafi Daham. 100% genuine products.</p>
        </div>
      </section>

      {/* ── toolbar ── */}
      <div className="shp-toolbar">
        <div className="shp-toolbar__buttons">
          <div className="shp-toolbar__cell shp-toolbar__cell--filter">
            <button type="button" className="shp-toolbar__btn" onClick={() => setDrawer(true)}>
              Filter{chips.length ? ` (${chips.length})` : ""}
            </button>
          </div>
          <SortMenu value={sort} onChange={(v) => { setPage(1); setSort(v); }} />
        </div>
        <p className="shp-toolbar__count">{loading && products === null ? "Loading…" : countLabel}</p>
        <LayoutSwitch device="mobile" value={layout.mobile} onChange={(v) => setLayout((l) => ({ ...l, mobile: v }))} />
        <LayoutSwitch device="desktop" value={layout.desktop} onChange={(v) => setLayout((l) => ({ ...l, desktop: v }))} />
      </div>

      <div className="shp-body">
        <div className="shp-collection">
          <aside className="shp-facets" aria-label="Filters">{Filters}</aside>

          <section className="shp-main" aria-label="Products">
            {chips.length > 0 && (
              <div className="shp-chips">
                {chips.map((c) => (
                  <button key={`${c.k}-${c.v}`} type="button" className="shp-chip" onClick={c.rm} aria-label={`Remove filter: ${c.label}`}>
                    {c.label}
                    <Cross />
                  </button>
                ))}
                <button type="button" className="shp-chips__clear" onClick={clearAll}>Clear all</button>
              </div>
            )}

            {products === null ? (
              <div className="shp-grid" data-mobile={layout.mobile} data-desktop={layout.desktop}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="shp-skel" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="shp-empty">
                <p>No products match your selection.</p>
                {chips.length > 0 && <button type="button" className="rd-btn rd-btn--sm rd-btn--auto" onClick={clearAll}>Clear filters</button>}
              </div>
            ) : (
              <div className={`shp-grid${loading ? " is-loading" : ""}`} data-mobile={layout.mobile} data-desktop={layout.desktop}>
                {products.map((p) => <ProductCard key={p._id} product={p} variant="collection" />)}
              </div>
            )}

            <Pager page={page} totalPages={totalPages} onChange={setPage} />
          </section>
        </div>
      </div>

      {/* ── filters drawer (phones and tablets) ── */}
      {drawer && (
        <div className="shp-drawer" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="shp-drawer__backdrop" onClick={() => setDrawer(false)} />
          <div className="shp-drawer__panel">
            <div className="shp-drawer__head">
              <p>Filters</p>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters">
                <Cross />
              </button>
            </div>
            <div className="shp-drawer__body">{Filters}</div>
            <div className="shp-drawer__foot">
              {chips.length > 0 && <button type="button" className="rd-btn rd-btn--ghost" onClick={clearAll}>Clear all</button>}
              <button type="button" className="rd-btn" onClick={() => setDrawer(false)}>
                View results{loading ? "" : ` (${totalItems})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="shp" style={{ minHeight: "100vh" }} />}>
      <ShopInner />
    </Suspense>
  );
}
