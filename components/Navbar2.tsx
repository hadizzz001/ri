'use client';

import { useState } from 'react'; 
import {
  Menu,
  X,
  Search,
} from 'lucide-react';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false); 



 









  return (

    <> 

      <header
        className="w-full sticky top-0 z-50"
        style={{
          background: '#fff',
        }}
      >

        <div className="px-4 py-6 flex justify-between items-center text-black">
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
                src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1766829842/black123_fbqmfb.webp"
                alt="Logo"
                className="h-10"
                style={{ maxHeight: '50px' }}
              />
            </a>
          </div>


          {/* Search & Cart */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="w-6 h-6 stroke-[1]" />
            </button> 
          </div>
        </div>

        {/* Fullscreen Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-[#cab8ac] text-black flex flex-col items-center justify-center z-50">
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
              <a href="/service?id=6946dd036a445eca9603c163" onClick={() => setMenuOpen(false)}>Extensions</a> 
              <a href="/vid" onClick={() => setMenuOpen(false)}>Interviews</a>
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
          </div>
        )}
      </header>

    </>

  );
}