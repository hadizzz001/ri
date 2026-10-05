'use client';

import { useEffect, useRef, useState } from 'react';
import { getPricing, productPath } from '../components1/shop/productInfo';
import { useQuickAdd } from '../components1/shop/useQuickAdd';

/**
 * "Curated for You — Featured Products": the product carousel that follows the
 * hero on amadeussabra.com. Eight products in the shop's "Featured" order;
 * swipe on phones, arrows (on hover) or drag with a mouse.
 */
const PRODUCTS_URL = '/api1/productsz1?page=1&limit=8&sort=featured';

const isVideo = (u) => /\.(mp4|webm|ogg|mov)$/i.test(u);
/** Cloudinary: a 720px auto-format copy; other hosts are used as-is. */
const sized = (u) => (u.includes('/upload/') ? u.replace('/upload/', '/upload/f_auto,q_auto,w_720/') : u);

const Arrow = ({ d }) => (
  <svg aria-hidden="true" focusable="false" fill="none" width="16" viewBox="0 0 16 18">
    <path d={d} stroke="currentColor" strokeLinecap="square" />
  </svg>
);

function FeaturedCard({ product, index }) {
  const { onAdd, label, soldOut } = useQuickAdd(product);
  const [main, alt] = (Array.isArray(product.img) ? product.img : []).filter((u) => u && !isVideo(u));
  const { now, was, isSale } = getPricing(product);
  const href = productPath(product);

  return (
    <div className="fp-card" style={{ '--i': index }}>
      <div className={`fp-card__figure${alt ? ' has-alt' : ''}`}>
        <a href={href} className="fp-card__media" draggable="false">
          {main ? (
            <img src={sized(main)} alt={product.title} className="fp-card__img" loading="lazy" draggable="false" />
          ) : (
            <span className="fp-card__img fp-card__img--empty" role="img" aria-label={product.title} />
          )}
          {alt && <img src={sized(alt)} alt="" className="fp-card__img fp-card__img--alt" loading="lazy" draggable="false" />}
        </a>

        {soldOut ? (
          <span className="fp-card__badge">Sold out</span>
        ) : (
          <button type="button" className="fp-card__add" onClick={onAdd} aria-label={`${label}: ${product.title}`}>
            <svg aria-hidden="true" focusable="false" fill="none" width="12" viewBox="0 0 12 12">
              <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        )}
      </div>

      <div className="fp-card__info">
        <a href={href} className="fp-card__title" draggable="false">{product.title}</a>
        <div className="fp-card__price">
          <span className={isSale ? 'is-sale' : undefined}>${now.toFixed(2)}</span>
          {was && <s>${was.toFixed(2)}</s>}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState(null); // null while loading
  const [canScroll, setCanScroll] = useState({ prev: false, next: false });
  const [revealed, setRevealed] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetch(PRODUCTS_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => alive && setProducts(Array.isArray(data?.products) ? data.products : []))
      .catch(() => alive && setProducts([]));
    return () => {
      alive = false;
    };
  }, []);

  // Each arrow only shows while there is something to scroll to on its side
  useEffect(() => {
    const el = listRef.current;
    if (!el || !products?.length) return undefined;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanScroll({ prev: el.scrollLeft > 1, next: el.scrollLeft < max - 1 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      resize.disconnect();
    };
  }, [products]);

  // The cards fade up, one after another, the first time the row comes into view
  useEffect(() => {
    const el = listRef.current;
    if (!el || !products?.length) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setRevealed(true);
      observer.disconnect();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [products]);

  // Arrows move by a whole "page" of fully visible cards
  const page = (direction) => {
    const el = listRef.current;
    const card = el?.querySelector('.fp-card');
    if (!card) return;
    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap) || 0;
    const visible = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const step = card.offsetWidth + gap;
    const perPage = Math.max(1, Math.floor((visible + gap) / step));
    el.scrollBy({ left: direction * perPage * step, behavior: 'smooth' });
  };

  // Mouse drag scrolling (touch scrolls natively)
  const onPointerDown = (e) => {
    const el = listRef.current;
    if (e.pointerType !== 'mouse' || e.button !== 0 || !el || el.scrollWidth <= el.clientWidth) return;
    const startX = e.clientX;
    const startLeft = el.scrollLeft;
    let dragging = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      if (!dragging && Math.abs(dx) > 5) {
        dragging = true;
        el.classList.add('is-dragging');
      }
      if (dragging) el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (!dragging) return;
      el.classList.remove('is-dragging');
      // the click that ends a drag must not open a product
      const swallow = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      el.addEventListener('click', swallow, true);
      setTimeout(() => el.removeEventListener('click', swallow, true), 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  if (products && products.length === 0) return null;

  return (
    <section className="fp" aria-labelledby="fp-title">
      <div className="fp__inner">
        <div className="fp__head">
          <p className="fp__kicker">Curated for You</p>
          <h2 id="fp-title" className="fp__title">Featured Products</h2>
        </div>

        <div className={`fp__list${canScroll.prev || canScroll.next ? ' is-scrollable' : ''}`}>
          <button
            type="button"
            className="fp__arrow fp__arrow--prev"
            onClick={() => page(-1)}
            disabled={!canScroll.prev}
            aria-label="Previous"
          >
            <Arrow d="M11 1 3 9l8 8" />
          </button>

          <div
            ref={listRef}
            className={`fp__scroller${revealed ? ' is-revealed' : ''}`}
            onPointerDown={onPointerDown}
          >
            {products
              ? products.map((product, i) => <FeaturedCard key={product._id} product={product} index={i} />)
              : Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="fp-card fp-card--ghost" aria-hidden="true">
                    <span className="fp-card__img" />
                  </div>
                ))}
          </div>

          <button
            type="button"
            className="fp__arrow fp__arrow--next"
            onClick={() => page(1)}
            disabled={!canScroll.next}
            aria-label="Next"
          >
            <Arrow d="m5 17 8-8-8-8" />
          </button>
        </div>

        <div className="fp__all">
          <a href="/shop" className="rd-btn rd-btn--auto">View all</a>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
/* top padding leaves room for the hero's round "next section" button */
.fp{background:#efefef;color:#1c1c1c;border-top:1px solid #cfcfcf!important;padding:65px 0 40px}
@media(min-width:1000px){.fp{padding:89px 0 64px}}
.fp__inner{display:grid;grid-template-columns:minmax(0,1fr);gap:36px;margin:0 20px}
@media(min-width:700px){.fp__inner{margin:0 32px}}
@media(min-width:1000px){.fp__inner{gap:48px;margin:0 48px}}

.fp__head{display:grid;justify-items:center;gap:16px;text-align:center}
@media(min-width:700px){.fp__head{gap:20px}}
.fp__kicker,.fp__title{margin:0!important;font-family:var(--font-heading)!important;font-weight:400!important;
  letter-spacing:.18em!important;text-transform:uppercase;color:#1c1c1c!important;overflow-wrap:anywhere}
.fp__kicker{font-size:12px!important;line-height:1.7!important}
.fp__title{font-size:clamp(20px,17.07px + .78vw,28px)!important;line-height:1.5!important}

/* the row bleeds to the screen edges until 1000px, then sits in the container */
.fp__list{position:relative}
.fp__scroller{--fp-gap:20px;--fp-card:min(300px,65%);
  display:grid;grid:auto/auto-flow var(--fp-card);column-gap:var(--fp-gap);align-items:start;
  justify-content:start;justify-content:safe center;
  overflow:auto hidden;overscroll-behavior-x:contain;scrollbar-width:none;
  margin:0 -20px;padding:0 20px;scroll-padding-inline:20px}
.fp__scroller::-webkit-scrollbar{display:none}
@media(min-width:700px){.fp__scroller{--fp-gap:24px;--fp-card:calc(100%/3 - var(--fp-gap)*2/3);
  margin:0 -32px;padding:0 32px;scroll-padding-inline:32px}}
@media(min-width:1000px){.fp__scroller{--fp-gap:48px;--fp-card:calc(100%/4 - var(--fp-gap)*3/4);
  margin:0;padding:0;scroll-padding-inline:0;scroll-snap-type:x mandatory}}
@media(min-width:1150px){.fp__scroller{--fp-card:calc(100%/5 - var(--fp-gap)*4/5)}}
@media(min-width:1400px){.fp__scroller{--fp-gap:60px}}
@media(pointer:fine){.fp__list.is-scrollable .fp__scroller{cursor:grab}}
.fp__scroller.is-dragging{cursor:grabbing!important;scroll-snap-type:none;user-select:none}

.fp-card{display:grid;grid-template-columns:minmax(0,1fr);align-content:start;gap:20px;position:relative;scroll-snap-align:start}
.fp-card__figure{position:relative}
.fp-card__media{position:relative;display:block;isolation:isolate}
.fp-card__img{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:contain;object-position:center;margin:0 auto;
  transition:opacity .1s ease-in-out}
.fp-card__img--empty{background:rgba(28,28,28,.05)}
.fp-card__img--alt{display:none;position:absolute;inset:0;height:100%}
@media(pointer:fine){
  .fp-card__img--alt{display:block;opacity:0;mix-blend-mode:plus-lighter}
  .fp-card__figure.has-alt:hover .fp-card__img:not(.fp-card__img--alt){opacity:0}
  .fp-card__figure.has-alt:hover .fp-card__img--alt{opacity:1}
}
.fp-card--ghost .fp-card__img{background:rgba(28,28,28,.05)}
.fp-card--ghost::after{content:"";height:66px}

.fp-card__add{position:absolute;z-index:1;right:8px;bottom:8px;display:grid;place-items:center;padding:10px;border:0;
  background:#fff;color:#1c1c1c;cursor:pointer;line-height:0}
.fp-card__add svg{display:block;width:12px;height:12px;transition:transform .2s ease-in-out}
.fp-card__add:hover svg{transform:rotate(90deg)}
.fp-card__add:focus-visible{outline:2px solid #1c1c1c!important;outline-offset:2px}
@media(pointer:fine){
  .fp-card__add{opacity:0;transform:translateY(5px);transition:opacity .2s ease-in-out,transform .2s ease-in-out}
  .fp-card:hover .fp-card__add,.fp-card__add:focus-visible{opacity:1;transform:translateY(0)}
}
.fp-card__badge{position:absolute;z-index:1;top:4px;left:4px;padding:1px 5px;background:#efefef;color:rgba(0,0,0,.65);
  font-family:var(--font-heading)!important;font-size:10px;line-height:1.7;letter-spacing:.18em;text-transform:uppercase}
@media(min-width:700px){.fp-card__badge{top:8px;left:8px}}

.fp-card__info{display:grid;justify-items:center;gap:4px;text-align:center}
.fp-card__title,.fp-card__price,.fp-card__price *{font-family:var(--font-heading)!important;font-weight:400!important;
  font-size:12px;line-height:1.7;letter-spacing:.18em;text-transform:uppercase}
.fp-card__title,.fp-card__title:hover{color:#1c1c1c!important;text-decoration:none!important;overflow-wrap:anywhere}
.fp-card__price{display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;column-gap:8px;color:rgba(28,28,28,.65)}
.fp-card__price .is-sale{color:var(--rd-sale)}

/* cards fade up in sequence the first time the row is seen */
@media(prefers-reduced-motion:no-preference){
  .fp__scroller:not(.is-revealed) .fp-card:not(.fp-card--ghost){opacity:0}
  .fp__scroller.is-revealed .fp-card{animation:fpReveal .2s ease-in-out both;animation-delay:calc(.4s + var(--i) * .05s)}
}
@keyframes fpReveal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

/* round arrows, shown on hover where the row can scroll that way */
.fp__arrow{display:none;position:absolute;z-index:2;top:calc(50% - 25px);width:44px;height:44px;place-items:center;
  padding:0;border:0;border-radius:9999px;background:#fff;color:#1c1c1c;cursor:pointer;
  box-shadow:0 2px 10px rgba(28,28,28,.15);transition:opacity .2s,transform .2s,visibility .2s}
.fp__arrow svg{display:block;width:12px;height:auto}
.fp__arrow--prev{left:24px}
.fp__arrow--next{right:24px}
@media(hover:hover){
  .fp__list.is-scrollable .fp__arrow{display:grid;opacity:0;visibility:hidden;transform:translateY(-10px)}
  .fp__list.is-scrollable:hover .fp__arrow:not(:disabled){opacity:1;visibility:visible;transform:translateY(0)}
}
@media(pointer:fine) and (prefers-reduced-motion:no-preference){
  .fp__arrow:hover svg{animation:fpArrow .35s ease-in-out forwards}
  .fp__arrow--prev:hover svg{animation-direction:reverse}
}
@keyframes fpArrow{
  0%{opacity:1;transform:translateX(0)}
  50%{opacity:0;transform:translateX(100%)}
  51%{opacity:0;transform:translateX(-100%)}
  to{opacity:1;transform:translateX(0)}
}

.fp__all{display:flex;justify-content:center}
.fp__all .rd-btn{--btn-fill:#1c1c1c;min-height:0;padding:10.4px 28px}
`,
        }}
      />
    </section>
  );
}
