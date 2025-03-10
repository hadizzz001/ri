"use client"
import {  Footer,Navbar2 } from '../components'
import './globals.css'
import './custom.css'
import './bootstrap.min.css'
import './bs-select.css'
import './slick.css'
import { useSearchParams } from 'next/navigation'
import { CartProvider } from './context/CartContext';
import { BooleanProvider } from './context/CartBoolContext'; 
import GifLoader from '../components/GifLoader'
import WhatsAppIcon from '../components/WhatsAppIcon'; 

 

 

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {

 

  return (
    <html className="no-js no-touch supports-no-cookies" lang="en"> 
    <>
  <meta content="text/html; charset=utf-8" httpEquiv="Content-Type" />
  <meta content="en" httpEquiv="Content-Language" />
  <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
  <meta
    content="width=device-width, initial-scale=1, maximum-scale=1"
    name="viewport"
  />
  <meta content="max-image-preview:large" name="robots" />
  <title>
    Rafi Daham - Hair Repair Studio
  </title>
  <meta
    content="At Rafi Daham - Hair Repair Studio, we're reshaping the way businesses connect."
    name="description" 
  />
  <meta content="Rafi Daham - Hair Repair Studio" name="keywords" property="abbasbaba, shoes, men, women" />
  <meta
    content="Rafi Daham - Hair Repair Studio"
    name=""
    property="og:title"
  />
  <meta
    content="https://abbasbaba.com/"
    name=""
    property="og:url"
  />
  <meta content="website" name="" property="og:type" />
  <meta
    content="At Rafi Daham - Hair Repair Studio, we're reshaping the way businesses connect."
    name=""
    property="og:description"
  />
  <meta
    content="/logo.png"
    name=""
    property="og:image"
  />
   
  <link
    href="/favicon.ico"
    rel="apple-touch-icon"
    sizes="180x180"
  />
  <link
    href="/favicon.ico"
    rel="icon"
    sizes="32x32" 
  />
  <link
    href="/favicon.ico"
    rel="icon"
    sizes="16x16" 
  /> 
 
  <meta content="#ffffff" name="msapplication-TileColor" />
  <meta content="#ffffff" name="theme-color" />
  <link href="https://assets.bellroy.com" rel="preconnect" />
  <link href="https://bellroy.imgix.net" rel="preconnect" /> 
  

 
 










  <link
    href="css/webfonts-3e3c2400.css"
    rel="preload"
    as="style"
  />
  <link
    rel="stylesheet"
    href="css/webfonts-3e3c2400.css"
    media="print" 
  />
  <link
    rel="stylesheet"
    href="css/style-4109db2b.css"
  />

<link href="https://fonts.cdnfonts.com/css/lato" rel="stylesheet"/> 
 
<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?display=swap&amp;family=Poiret+One%3A300%2C400" media="all"/>
                
                

 
  
</>

      <body>

 
      {/* <GifLoader />

        
        <BooleanProvider>
        <CartProvider>
          <Navbar2 />
          <WhatsAppIcon />
          {children} 
          <Footer />
        </CartProvider>
        </BooleanProvider> */}

<main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-center">
      <img
        src="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1740569515/hwradvwzkboymjfkms7y.png"
        alt="Logo"
        className="w-48 h-auto mb-6"
      />
      <h1 className="text-3xl font-bold text-gray-800">Coming Soon</h1>
      <p className="text-gray-600 mt-2">We are working on something amazing. Stay tuned!</p>
    </main>
        
      </body>
    </html>
  )
}
