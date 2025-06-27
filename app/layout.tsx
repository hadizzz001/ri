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
import Appoint from '../components/Appoint'; 
import BackgroundImages from '../components/BackgroundImages';  
import { useEffect } from 'react';

 

 

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) { 

    useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  
 

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
    content="https://rafidaham.com/"
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
    content="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1747076728/vzuolw8ebi6acoynqyy6.webp"
    name=""
    property="og:image"
  />
   
  <link
    href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1747076728/vzuolw8ebi6acoynqyy6.webp"
    rel="apple-touch-icon"
    sizes="180x180"
  />
  <link
    href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1747076728/vzuolw8ebi6acoynqyy6.webp"
    rel="icon"
    sizes="32x32" 
  />
  <link
    href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1747076728/vzuolw8ebi6acoynqyy6.webp"
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
  
 
<link href="https://db.onlinewebfonts.com/c/fc650de7c3b3af62825a0e743b69425f?family=Helvetica+Neue+LT+W05+55+Roman" rel="stylesheet" type="text/css"/>             

 
  
</>

      <body>

 
      <GifLoader />

        
        <BooleanProvider>
        <CartProvider>
          <Navbar2 />
          <WhatsAppIcon />
          <Appoint />
          <BackgroundImages />
          {children} 
          <Footer />
        </CartProvider>
        </BooleanProvider>

 
        
      </body>
    </html>
  )
}














// export const metadata = {
//   title: 'Coming Soon',
// };

// export default function RootLayout() {
//   return (
//     <html lang="en">
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//       </head>
//       <body
//         style={{
//           margin: 0,
//           padding: 0,
//           height: '100vh',
//           width: '100vw',
//           overflow: 'hidden',
//           backgroundColor: '#282121',
//         }}
//       >
//         <picture>
//           <source
//             media="(max-width: 768px)"
//             srcSet="/mobile.webp"
//           />
//           <source
//             media="(min-width: 769px)"
//             srcSet="/pc.webp"
//           />
//           <img
//             src="/pc.webp"
//             alt="Coming Soon"
//             style={{
//               width: '100vw',
//               height: '100vh',
//               objectFit: 'contain',
//               display: 'block',
//               margin: '0 auto',
//             }}
//           />
//         </picture>
//       </body>
//     </html>
//   );
// }





 