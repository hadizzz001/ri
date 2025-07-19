'use client';

import { useState } from 'react';
import Cart from "../components/Cart"
import { useBooleanValue } from '../app/context/CartBoolContext';
import { useCart } from '../app/context/CartContext';
import {
  Menu,
  X,
  Search,
} from 'lucide-react';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();
  const { isBooleanValue, setBooleanValue } = useBooleanValue();



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









  return (

    <>
      <Cart />

      <header
        className="w-full sticky top-0 z-50"
        style={{
          background: 'linear-gradient(180deg, #000000e5, transparent)',
        }}
      >

        <div className="px-4 py-3 flex justify-between items-center text-white">
          {/* Hamburger */}
<button
  onClick={() => setMenuOpen(true)}
  aria-label="Open menu"
  className="flex items-center space-x-2"
>
  <Menu className="w-6 h-6 stroke-[1]" />
  <span className="hidden sm:inline">Menu</span>
</button>


          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a href="/">
              <img
                src="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751022677/RAFI_WHITE_NAME1_dmsyxu.webp"
                alt="Logo"
                className="h-8"
                style={{ maxHeight: '40px' }}
              />
            </a>
          </div>


          {/* Search & Cart */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="w-6 h-6 stroke-[1]" />
            </button>
            <span onClick={handleClickc} className="menuicon">

              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4061 7.35962C16.4121 5.32492 14.3273 4 12 4C9.67273 4 7.56364 5.30126 6.59394 7.35962H4V19H20V7.35962H17.4061ZM12 4.70978C13.9394 4.70978 15.6848 5.72713 16.6061 7.35962H7.39394C8.31515 5.72713 10.0606 4.70978 12 4.70978ZM19.2727 18.2902H4.72727V8.0694H6.27879H17.7455H19.297V18.2902H19.2727Z"
                  fill="#ffffff"
                />
              </svg>


              {cart && cart.length > 0 ? (
                <span className="MiniCart_CartIndicator_Badge1"></span>
              ) :
                (<div></div>)
              }
            </span>
          </div>
        </div>

        {/* Fullscreen Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-white text-black flex flex-col items-center justify-center z-50">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close menu"
            >
              <X className="w-8 h-8 stroke-[1]" />
            </button>
            <nav className="flex flex-col items-center gap-6 mt-12 text-3xl font-bold">
              <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
              <a href="/appointment" onClick={() => setMenuOpen(false)}>Appointment</a>
              <a href="/services" onClick={() => setMenuOpen(false)}>Hair Services</a>
              <a href="/ext" onClick={() => setMenuOpen(false)}>Extensions</a>
              <a href="/shop" onClick={() => setMenuOpen(false)}>Shop</a>
              <a href="/vid" onClick={() => setMenuOpen(false)}>Videos</a>
              <a href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
            </nav>

          </div>
        )}

        {/* Search Overlay */}
        {searchOpen && (
          <div className="fixed inset-0 bg-white text-black flex flex-col items-center justify-center z-50">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close search"
            >
              <X className="w-8 h-8 stroke-[1]" />
            </button>





            <form action={'/search'} method="get" className="searchOverlay">
              <button type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.6 36">
                  <path d="M35 32.6l-8.4-8.4A14.96 14.96 0 0 0 14.9 0C6.7 0 0 6.7 0 14.9s6.7 14.9 14.9 14.9c3.3 0 6.3-1.1 8.8-2.9l8.5 8.5c.4.4.9.6 1.4.6s1-.2 1.4-.6c.8-.8.8-2 0-2.8zM4 14.9C4 8.9 8.9 4 14.9 4s10.9 4.9 10.9 10.9-4.9 10.9-10.9 10.9S4 20.9 4 14.9z" />
                </svg>
              </button>



              <input
                type="text"
                name="q"
                placeholder="Search..."
                className="w-3/4 max-w-md text-2xl border-b-2 border-gray-400 outline-none py-2 text-center"
                autoFocus
              />
            </form>










          </div>
        )}

        {/* Cart Overlay */}
        {cartOpen && (
          <div className="fixed inset-0 bg-white text-black z-50 overflow-y-auto">
            <button
              onClick={() => setCartOpen(false)}
              className="absolute top-4 right-4"
              aria-label="Close cart"
            >
              <X className="w-8 h-8 stroke-[1]" />
            </button>
            <div className="mt-20 px-4">
              <Cart />
            </div>
          </div>
        )}
      </header>

    </>

  );
}
