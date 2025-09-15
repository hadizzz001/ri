'use client'

import { Footer, Navbar2 } from '../components'
import './globals.css'
import './custom.css'
import './bootstrap.min.css'
import './bs-select.css'
import './slick.css'
import { CartProvider } from './context/CartContext';
import { BooleanProvider } from './context/CartBoolContext';
import GifLoader from '../components/GifLoader'
import WhatsAppIcon from '../components/WhatsAppIcon';
import Appoint from '../components/Appoint';
import BodyStyleController from '../components/BodyStyleController';
import { useEffect } from 'react';

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const positions = [
      'center',
      'top',
      'top left',
      'top right',
      'bottom',
      'bottom left',
      'bottom right',
      'left',
      'right'
    ];
    const random = positions[Math.floor(Math.random() * positions.length)];
    document.body.style.backgroundPosition = random;
  }, []);

  return (
    <html className="no-js no-touch supports-no-cookies" lang="en">
<head>
  {/* Standard Meta Tags */}
  <meta charSet="utf-8" />
  <meta httpEquiv="Content-Language" content="en" />
  <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="robots" content="max-image-preview:large" />
  <meta name="theme-color" content="#ffffff" />
  <meta name="msapplication-TileColor" content="#ffffff" />

  {/* SEO */}
  <title>Rafi Daham</title>
  <meta
    name="description"
    content="Rafi Daham embarked on his hairstyling journey in 1994, transforming his passion for artistry and precision into a lifelong career."
  />

  {/* Open Graph */}
  <meta property="og:title" content="Rafi Daham" />
  <meta
    property="og:description"
    content="Rafi Daham embarked on his hairstyling journey in 1994, transforming his passion for artistry and precision into a lifelong career."
  />
  <meta property="og:url" content="https://rafidaham.com" />
  <meta property="og:site_name" content="Rafi Daham" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Rafi Daham" />
  <meta
    name="twitter:description"
    content="Rafi Daham embarked on his hairstyling journey in 1994, transforming his passion for artistry and precision into a lifelong career."
  />
  <meta name="twitter:image" content="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />

  {/* Icons */}
  <link rel="apple-touch-icon" sizes="180x180" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />
  <link rel="icon" sizes="32x32" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />
  <link rel="icon" sizes="16x16" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />
  <link rel="icon" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" type="image/x-icon" />
  <link rel="shortcut icon" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" type="image/x-icon" />

  {/* Fonts & Styles */}
  <link rel="preload" as="style" href="css/webfonts-3e3c2400.css" />
  <link rel="stylesheet" href="css/webfonts-3e3c2400.css" media="print" />
  <link rel="stylesheet" href="css/style-4109db2b.css" />
  <link href="https://fonts.cdnfonts.com/css/futura-std-4" rel="stylesheet" />

<link href="https://fonts.cdnfonts.com/css/neue-helvetica-bq" rel="stylesheet"/>
<link href="https://fonts.cdnfonts.com/css/helvetica-neue-55?styles=16016" rel="stylesheet" />
                               

  {/* Structured Data */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Rafi Daham",
        url: "https://rafidaham.com",
        logo: "https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2",
      }),
    }}
  />
</head>


      <body>
        <GifLoader />
        <BodyStyleController />
        <BooleanProvider>
          <CartProvider>
            <Navbar2 />
            <WhatsAppIcon />
            <Appoint />
            {children}
            <Footer />
          </CartProvider>
        </BooleanProvider>
      </body>
    </html>
  )
}
