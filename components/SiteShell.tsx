'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'
import Navbar2 from './Navbar2'
import GifLoader from './GifLoader'
import WhatsAppIcon from './WhatsAppIcon'
import Appoint from './Appoint'
import BodyStyleController from './BodyStyleController'
import ClientWrapper from './ClientWrapper'
import { CartProvider } from '../app/context/CartContext'
import { BooleanProvider } from '../app/context/CartBoolContext'
import { AuthProvider } from '../app/context/AuthContext'

/**
 * Everything inside <body>: providers, site chrome and the page. Kept out of
 * the root layout so the layout stays a server component (page metadata).
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === '/'

  return (
    <ClientWrapper>
      <GifLoader />
      <BodyStyleController />
      <AuthProvider>
        <CartProvider>
          <BooleanProvider>
            <Navbar2 />
            <WhatsAppIcon />
            <Appoint />
            {isHome ? children : <main className="site-container">{children}</main>}
            <Footer />
          </BooleanProvider>
        </CartProvider>
      </AuthProvider>
    </ClientWrapper>
  )
}
