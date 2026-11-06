'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Cart from "../components1/Cart"
import { useBooleanValue } from '../app/context/CartBoolContext';
import { useCart } from '../app/context/CartContext';
import { useAuth } from '../app/context/AuthContext';
import NotificationBell from './NotificationBell';

/* One icon family: 24×24 viewBox, 1px stroke, no fill — identical weight to the bag icon. */
const Ico = {
  Menu: () => (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7h17M3.5 12h17M3.5 17h17" /></svg>
  ),
  Search: () => (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M15.8 15.8L20.5 20.5" /></svg>
  ),
  Heart: () => (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-7.6-4.7-9.3-9.4C1.4 7.4 3.6 4.3 6.9 4.3c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.3 0 5.5 3.1 4.2 6.5-1.7 4.7-9.3 9.4-9.3 9.4z" /></svg>
  ),
  User: () => (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4" /><path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" /></svg>
  ),
  Bag: () => (
    <svg className="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16v12H4z" /><path d="M7.5 7.5c0-2.6 2-4.5 4.5-4.5s4.5 1.9 4.5 4.5" /></svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
  ),
};

const LINKS = [
  ['/', 'Home'],
  ['/shop', 'Shop'],
  ['/appointment', 'Appointment'],
  ['/services', 'Hair Services'],
  ['/service?id=69d909a6c7e932b41d1b1734', 'Extensions'],
  ['/vid', 'Interviews'],
  ['/contact', 'Contact Us'],
];

// Pages that open on a full-width banner the header sits on top of
const OVER_HERO_PATHS = ['/', '/shop'];

export default function NavBar() {
  const pathname = usePathname();
  const overHero = OVER_HERO_PATHS.includes(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { cart } = useCart();
  const { user, favoriteIds } = useAuth();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();
  const headerRef = useRef<HTMLElement | null>(null);

  // Expose the real header height as --header-h so every page can offset itself
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setVar = () => {
      document.documentElement.style.setProperty(
        '--header-h',
        `${Math.round(el.getBoundingClientRect().height)}px`
      );
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener('resize', setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);

  // amadeussabra.com's header: solid as soon as the page leaves the top, slides
  // away after 100px of scrolling down, and comes back on any scroll up (or
  // when the mouse nears the top of the window).
  useEffect(() => {
    let fromY = 0; // the next "100px down" is measured from here
    const finePointer = window.matchMedia('(pointer: fine)');

    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 10);
      if (y - fromY > 100) {
        fromY = y;
        setHidden(true);
      } else if (y < fromY) {
        fromY = y;
        setHidden(false);
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.clientY < 100 && finePointer.matches) {
        fromY = 0;
        setHidden(false);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  const overlayOpen = menuOpen || searchOpen;
  const isHidden = hidden && !overlayOpen;
  const transparent = overHero && !scrolled && !overlayOpen;

  // Sticky bars on other pages (shop toolbar, checkout summary…) slide up with it
  useEffect(() => {
    document.documentElement.style.setProperty('--header-is-visible', isHidden ? '0' : '1');
  }, [isHidden]);

  // Lock scroll + close on Escape while an overlay is open
  useEffect(() => {
    const open = menuOpen || searchOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [menuOpen, searchOpen]);

  const handleClickc = () => {
    var cartb = document.getElementById("cartid");
    var cartb2 = document.getElementById("cartid2");
    setBooleanValue(!isBooleanValue);
    if (cartb && cartb2) {
      if (isBooleanValue) {
        cartb2.className += " MiniCart_Cart-visible";
      }
      else {
        cartb2.classList.remove("MiniCart_Cart-visible");
      }
    }
  };

  const favCount = favoriteIds?.length || 0;
  const cartCount = Array.isArray(cart) ? cart.length : 0;

  return (

    <>
      <Cart />

      <header
        ref={headerRef}
        className={`rd-header${overHero ? ' rd-header--over-hero' : ''}${transparent ? ' is-transparent' : ''}${isHidden ? ' is-hidden' : ''}`}
        onFocusCapture={() => setHidden(false)}
      >
        <div className="rd-header__bar">
          {/* Hamburger (+ wishlist on mobile); computers get the link row below instead */}
          <div className="rd-header__left">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="nav-btn rd-header__menu-btn">
              <Ico.Menu />
              <span className="rd-header__menu-label">Menu</span>
            </button>
            <a href="/wishlist" aria-label="Wishlist" className="nav-btn nav-only-sm">
              <Ico.Heart />
              {favCount > 0 && <span className="nav-badge">{favCount}</span>}
            </a>
          </div>

          {/* Logo */}
          <a href="/" className="rd-header__logo" aria-label="Rafi Daham — home">
            <img
              src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1766829842/black123_fbqmfb.webp"
              alt="Rafi Daham"
            />
          </a>

          {/* Actions — search + wishlist live in the drawer on mobile */}
          <div className="rd-header__right">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="nav-btn nav-hide-sm">
              <Ico.Search />
            </button>
            <a href="/wishlist" aria-label="Wishlist" className="nav-btn nav-hide-sm">
              <Ico.Heart />
              {favCount > 0 && <span className="nav-badge">{favCount}</span>}
            </a>
            <NotificationBell />
            <a href={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Sign in'} className="nav-btn">
              <Ico.User />
            </a>
            <button type="button" onClick={handleClickc} aria-label="Open bag" className="nav-btn menuicon">
              <Ico.Bag />
              {cartCount > 0 && <span className="nav-badge nav-badge--dot" />}
            </button>
          </div>
        </div>

        {/* Computers: the menu as a centred row under the logo (as on amadeussabra.com) */}
        <nav className="rd-header__nav" aria-label="Main">
          <ul>
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <a href={href} aria-current={href === pathname ? 'page' : undefined}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Menu drawer — slides in from the left. Rendered outside <header> so its
          z-index is not trapped in the header's stacking context. */}
      {menuOpen && (
        <div className="rd-menu" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="rd-menu__backdrop" onClick={() => setMenuOpen(false)} />
          <div className="rd-menu__panel">
            <div className="rd-menu__head">
              <a href="/" onClick={() => setMenuOpen(false)} aria-label="Home">
                <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1766829842/black123_fbqmfb.webp" alt="Rafi Daham" />
              </a>
              <button type="button" onClick={() => setMenuOpen(false)} className="rd-menu__close" aria-label="Close menu">
                <Ico.Close />
              </button>
            </div>

            {/* Search — mobile only (the header icon is hidden there) */}
            <form action="/search" method="get" className="rd-menu__search">
              <button type="submit" aria-label="Search"><Ico.Search /></button>
              <input type="text" name="q" placeholder="Search products…" autoComplete="off" />
            </form>

            <nav className="rd-menu__nav">
              {LINKS.map(([href, label]) => (
                <a key={href} href={href} className="rd-menu__link" onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
            </nav>

            <div className="rd-menu__sec">
              <a href={user ? '/account' : '/login'} className="rd-menu__link" onClick={() => setMenuOpen(false)}>
                {user ? 'My Account' : 'Sign In / Register'}
              </a>
              <a href="/wishlist" className="rd-menu__link" onClick={() => setMenuOpen(false)}>Wishlist{favCount > 0 ? ` (${favCount})` : ''}</a>
              <a href="/checkout1" className="rd-menu__link" onClick={() => setMenuOpen(false)}>Bag{cartCount > 0 ? ` (${cartCount})` : ''}</a>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="rd-search" role="dialog" aria-modal="true" aria-label="Search">
          <button type="button" onClick={() => setSearchOpen(false)} className="rd-search__close" aria-label="Close search">
            <Ico.Close />
          </button>
          <form action="/search" method="get" className="rd-search__form">
            <button type="submit" aria-label="Search"><Ico.Search /></button>
            <input type="text" name="q" placeholder="Search products…" autoFocus autoComplete="off" />
          </form>
        </div>
      )}
    </>

  );
}