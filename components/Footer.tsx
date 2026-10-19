'use client';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import ServiceHighlights from './ServiceHighlights';
import Subscribe from './Subscribe';

const LOGO = 'https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/black_bgez4v.webp';

const ABOUT =
    'Rafi Daham embarked on his hairstyling journey in 1994, transforming his passion for artistry and precision into a lifelong career. At Rafi Daham Salon, we believe that hair is a crown you never take off.';

const QUICK_LINKS = [
    { href: '/privacy', text: 'Privacy Policy' },
    { href: '/term', text: 'Terms of Service' },
    { href: '/contact', text: 'Contact us' },
    { href: '/services', text: 'Services' },
    { href: '/ext', text: 'Extensions' },
];

const SOCIAL = [
    { href: 'https://www.instagram.com/rafidaham_hairdressing', label: 'Instagram', Icon: FaInstagram },
    { href: 'https://www.facebook.com/1raffidahamhairdressing/', label: 'Facebook', Icon: FaFacebookF },
    { href: 'https://wa.me/9613896074', label: 'WhatsApp', Icon: FaWhatsapp },
    { href: 'https://lb.linkedin.com/in/rafi-daham-aa74a492', label: 'Linkedin', Icon: FaLinkedinIn },
    { href: 'https://www.tiktok.com/@rafidaham_hairdressing', label: 'TikTok', Icon: FaTiktok },
    { href: 'https://pin.it/7p9wCp9ex', label: 'Pinterest Hair Colorist', Icon: FaPinterestP },
];

/**
 * End of every page, laid out like amadeussabra.com's: the four service
 * promises, the "Stay up to date" newsletter band, then the dark footer —
 * logo, About, Quick Links and Newsletter columns spread across the width,
 * a row of social icons and the copyright line.
 */
const Footer = () => (
    <footer className="rdFooter">
        <ServiceHighlights />

        {/* Newsletter — the "Stay up to date" band, edge to edge above the links */}
        <Subscribe />

        <div className="rdFooter__main">
            <div className="rdFooter__inner">
                <div className="rdFooter__blocks">
                    <div className="rdFooter__block rdFooter__block--image">
                        <img className="rdFooter__logo" src={LOGO} alt="Rafi Daham" width={160} height={160} loading="lazy" />
                    </div>

                    <div className="rdFooter__block rdFooter__block--text">
                        <p className="rdFooter__heading">About Rafi Daham</p>
                        <p className="rdFooter__about">{ABOUT}</p>
                    </div>

                    <div className="rdFooter__block rdFooter__block--links">
                        <p className="rdFooter__heading">Quick Links</p>
                        <ul className="rdFooter__links">
                            {QUICK_LINKS.map((item) => (
                                <li key={item.href}>
                                    <a href={item.href} className="rdFooter__link">{item.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rdFooter__block rdFooter__block--newsletter">
                        <Subscribe variant="footer" />
                    </div>
                </div>

                <ul className="rdFooter__social">
                    {SOCIAL.map(({ href, label, Icon }) => (
                        <li key={label}>
                            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                                <Icon aria-hidden="true" />
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="rdFooter__aside">
                    <p className="rdFooter__copy">Rafi Daham {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
                </div>
            </div>
        </div>

        <style
            dangerouslySetInnerHTML={{
                __html: `
/* Colours, type and spacing follow amadeussabra.com's footer (Prestige theme,
   colour scheme 3). globals.css makes every link white, every border
   transparent and every list a bulleted one, hence the !important rules. */
.rdFooter__main{background:#1c1c1c;color:#fff;padding:40px 0 64px} /* bottom: clears the chat / booking buttons fixed at the bottom */
@media(min-width:1000px){.rdFooter__main{padding-top:64px}}
.rdFooter__inner{display:grid;row-gap:40px;margin:0 20px}
@media(min-width:700px){.rdFooter__inner{margin:0 32px}}
@media(min-width:1000px){.rdFooter__inner{row-gap:48px;margin:0 48px}}

/* phones: stacked; from 700px: one row, spread out — the About and Newsletter
   columns take the spare width, the logo and links keep theirs */
.rdFooter__blocks{display:grid;justify-content:start;align-items:start;gap:40px}
@media(min-width:700px){
  .rdFooter__blocks{display:flex;flex-wrap:wrap;justify-content:space-between;gap:48px}
  .rdFooter__block{flex:auto}
  .rdFooter__block--image,.rdFooter__block--links{flex-grow:0;max-width:14rem}
  .rdFooter__block--text{flex-basis:14rem;max-width:24rem}
  .rdFooter__block--newsletter{flex-basis:14rem;max-width:18rem}
}
@media(min-width:1150px){.rdFooter__blocks{column-gap:60px}}
@media(min-width:1400px){.rdFooter__blocks{column-gap:80px}}
.rdFooter__block{display:grid;align-content:start;gap:16px}
@media(min-width:700px){.rdFooter__block{gap:20px}}
.rdFooter__logo{display:block;width:160px;max-width:100%;height:auto;filter:brightness(0) invert(1)}

.rdFooter__heading,.rdFooter__copy{margin:0!important;font-family:var(--font-heading)!important;font-weight:400!important;
  letter-spacing:.18em!important;text-transform:uppercase;overflow-wrap:anywhere}
.rdFooter__heading{font-size:12px!important;line-height:1.7!important;color:#fff!important}
.rdFooter__about{margin:0!important;font-size:14px;line-height:1.65;color:rgba(255,255,255,.65)!important}
.rdFooter__links{display:grid;gap:10px;margin:0;padding:0}
.rdFooter :is(ul,li){list-style:none!important}
.rdFooter a.rdFooter__link{font-size:14px!important;line-height:1.65;color:rgba(255,255,255,.65)!important;
  text-decoration:none!important;transition:color .2s ease-in-out}
.rdFooter a.rdFooter__link:hover{color:#fff!important}

.rdFooter__social{display:flex;flex-wrap:wrap;align-items:center;gap:12px 32px;margin:0;padding:0}
.rdFooter__social a{position:relative;display:block;color:#fff!important;opacity:.65;transition:opacity .2s}
.rdFooter__social a:hover{color:#fff!important;opacity:1}
.rdFooter__social a::before{content:"";position:absolute;inset:-8px} /* bigger tap target */
.rdFooter__social svg{display:block;width:20px;height:20px}

/* copyright: centred on phones, at the start of the row from 1000px */
.rdFooter__aside{display:grid;justify-content:center;text-align:center}
@media(min-width:1000px){.rdFooter__aside{justify-content:start;text-align:start}}
.rdFooter__copy{font-size:11px!important;line-height:1.7!important;color:rgba(255,255,255,.65)!important}
`,
            }}
        />
    </footer>
);

export default Footer;
