import type { Metadata, Viewport } from 'next'
import SiteShell from '../components/SiteShell'
import './globals.css'
import './custom.css'
import './bootstrap.min.css'
import './bs-select.css'
import './slick.css'
import './shop.css'
import { SITE_NAME, SITE_URL } from './lib/site'

const DESCRIPTION =
  'Rafi Daham embarked on his hairstyling journey in 1994, transforming his passion for artistry and precision into a lifelong career.'
const SHARE_IMAGE = 'https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2'

// Site-wide defaults; a page overrides them with its own metadata (product pages do).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  robots: { 'max-image-preview': 'large' },
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html className="light no-js no-touch supports-no-cookies" lang="en" style={{ colorScheme: 'light' }}>
<head>
  {/* Standard Meta Tags (title, description, robots, charset & viewport come from `metadata` / `viewport`) */}
  <meta httpEquiv="Content-Language" content="en" />
  <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
  <meta name="msapplication-TileColor" content="#ffffff" />

  {/* Icons */}
  <link rel="apple-touch-icon" sizes="180x180" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />
  <link rel="icon" sizes="32x32" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />
  <link rel="icon" sizes="16x16" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" />
  <link rel="icon" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" type="image/x-icon" />
  <link rel="shortcut icon" href="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1756638279/icon_bng0gm.png?v=2" type="image/x-icon" />

  {/* Fonts & Styles (root-relative, so nested pages like /product/<code> load them too) */}
  <link rel="preload" as="style" href="/css/webfonts-3e3c2400.css" />
  <link rel="stylesheet" href="/css/webfonts-3e3c2400.css" media="print" />
  <link rel="stylesheet" href="/css/style-4109db2b.css" />

  {/* Brand fonts: Instrument Sans (headings), Nunito (text & buttons), Tajawal (Arabic) */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Nunito:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap"
  />

  {/* Structured Data */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: SHARE_IMAGE,
      }),
    }}
  />
</head>


      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
