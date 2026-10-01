'use client';

import { useEffect, useRef, useState } from 'react';

// Service promises strip (amadeussabra.com style): all four side by side on
// larger screens, a swipeable one-at-a-time carousel on phones.

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ITEMS = [
  {
    title: 'Worldwide Delivery',
    text: 'Bringing our exquisite products directly to your doorstep, wherever you are.',
    icon: (
      <Icon>
        <path d="M23.25 13.5V6a1.5 1.5 0 0 0-1.5-1.5h-12A1.5 1.5 0 0 0 8.25 6v6m0 0V6h-3a4.5 4.5 0 0 0-4.5 4.5v6a1.5 1.5 0 0 0 1.5 1.5H3" />
        <path d="M.75 12h3a1.5 1.5 0 0 0 1.5-1.5V6" />
        <path clipRule="evenodd" d="M7.5 19.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm12 0a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
        <path d="M12 18h3" />
      </Icon>
    ),
  },
  {
    title: 'Your Satisfaction, Guaranteed',
    text: 'We stand behind the quality of our services and products. Your happiness is our priority.',
    icon: (
      <Icon>
        <path clipRule="evenodd" d="M15.75 23.238a3 3 0 0 0-3-3H9a3 3 0 0 0-3-3H.75v6h15Z" />
        <path d="M6 20.238h3m2.25-3H21a.75.75 0 0 0 .75-.75v-6.75m-13.5 0v4.5" />
        <path clipRule="evenodd" d="M6.75 6.738a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-2.25Z" />
        <path d="M15 17.238V5.988" />
        <path clipRule="evenodd" d="M19.265 3.867a11.855 11.855 0 0 1-4.242 2.121 11.856 11.856 0 0 1 2.121-4.242C18.463.428 19.21.63 19.8 1.216c.59.586.784 1.333-.535 2.651Zm-8.531 0c1.257.985 2.7 1.707 4.242 2.121a11.838 11.838 0 0 0-2.121-4.242C11.537.428 10.79.63 10.2 1.216c-.59.586-.784 1.333.534 2.651Z" />
      </Icon>
    ),
  },
  {
    title: 'Expert Guidance',
    text: 'Our knowledgeable team is here to assist you with personalized advice and support.',
    icon: (
      <Icon>
        <path d="M12.75 15.75h3v4.5l4.5-4.5h1.494c.832 0 1.506-.674 1.506-1.506V2.25a1.5 1.5 0 0 0-1.5-1.5h-12a1.5 1.5 0 0 0-1.5 1.5v4.5" />
        <path d="M19.875 7.875a.375.375 0 1 0 0 .75.375.375 0 0 0 0-.75m-7.5 0a.375.375 0 1 0 0 .75.375.375 0 0 0 0-.75m3.75 0a.375.375 0 1 0 0 .75.375.375 0 0 0 0-.75" />
        <path clipRule="evenodd" d="M6.75 16.5a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75Z" />
        <path d="M12.75 23.25a6.054 6.054 0 0 0-12 0" />
      </Icon>
    ),
  },
  {
    title: 'Secure & Seamless Shopping',
    text: 'Shop with confidence through our encrypted and trusted payment gateways.',
    icon: (
      <Icon>
        <path clipRule="evenodd" d="M3.75 11.25a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v10.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-10.5Z" />
        <path d="M6.75 9.75V6a5.25 5.25 0 0 1 10.5 0v3.75M12 15v3" />
      </Icon>
    ),
  },
];

const AUTOPLAY_MS = 4500;

const ServiceHighlights = () => {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const mobile = window.matchMedia('(max-width: 699px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const index = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
    let timer = 0;

    const onScroll = () => setActive(index());
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!mobile.matches || reducedMotion.matches) return;
      timer = window.setInterval(() => {
        const next = (index() + 1) % ITEMS.length;
        track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
      }, AUTOPLAY_MS);
    };

    start();
    track.addEventListener('scroll', onScroll, { passive: true });
    // Once someone swipes, stop moving things under their finger.
    track.addEventListener('pointerdown', stop, { passive: true });
    track.addEventListener('touchstart', stop, { passive: true });
    mobile.addEventListener?.('change', start);

    return () => {
      stop();
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('pointerdown', stop);
      track.removeEventListener('touchstart', stop);
      mobile.removeEventListener?.('change', start);
    };
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <section className="serviceHighlights" aria-label="Why shop with us">
      <div ref={trackRef} className="rd-icon-cols serviceHighlights__track">
        {ITEMS.map((item) => (
          <div key={item.title}>
            {item.icon}
            <div className="rd-icon-cols__text">
              <h3 className="rd-icon-cols__title">{item.title}</h3>
              <p className="rd-icon-cols__body">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="serviceHighlights__dots">
        {ITEMS.map((item, i) => (
          <button
            key={item.title}
            type="button"
            className={i === active ? 'is-active' : ''}
            aria-label={`Show “${item.title}”`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.serviceHighlights{background:#fff;color:#1c1c1c;border-top:1px solid #dddddd !important;padding:2.5rem 1.25rem;margin-top:2rem}
.serviceHighlights *{color:#1c1c1c}
.serviceHighlights__track{max-width:1360px;margin:0 auto}
.serviceHighlights__dots{display:none}
@media (max-width:699px){
  .serviceHighlights{padding:2.5rem 0 1.75rem}
  .serviceHighlights__track{flex-wrap:nowrap;justify-content:flex-start;gap:0;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .serviceHighlights__track::-webkit-scrollbar{display:none}
  .serviceHighlights__track>*{flex:0 0 100%;max-width:100%;padding:0 2.5rem;scroll-snap-align:center}
  .serviceHighlights__dots{display:flex;justify-content:center;gap:.5rem;margin-top:1.5rem}
  .serviceHighlights__dots button{width:6px;height:6px;padding:0;border-radius:50%;border:0;background:#1c1c1c;opacity:.2;cursor:pointer;transition:opacity .3s,width .3s}
  .serviceHighlights__dots button.is-active{opacity:1;width:18px;border-radius:3px}
}
@media (min-width:1000px){.serviceHighlights{padding:4rem 3rem}}
`,
        }}
      />
    </section>
  );
};

export default ServiceHighlights;
