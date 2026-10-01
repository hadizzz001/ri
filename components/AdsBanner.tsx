"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCreative, Pagination, Navigation, Keyboard } from "swiper/modules";
import type SwiperCore from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import "swiper/css/navigation";

type Ad = {
  id: string;
  url: string;
  img: string[];
};

const isExternal = (url: string) => /^https?:\/\//i.test(url);

const AdsBanner = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loaded, setLoaded] = useState(false);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch("/api1/ads");
        const data = await res.json();
        if (Array.isArray(data)) setAds(data);
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchAds();
  }, []);

  if (!loaded || ads.length === 0) return null;

  return (
    <section className="adsBanner">
      <Swiper
        modules={[Autoplay, EffectCreative, Pagination, Navigation, Keyboard]}
        effect="creative"
        grabCursor
        loop={ads.length > 1}
        speed={1100}
        keyboard={{ enabled: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, el: ".adsBanner__dots" }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper: SwiperCore) => {
          if (typeof swiper.params.navigation === "object") {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        creativeEffect={{
          limitProgress: 2,
          prev: {
            translate: ["-22%", 0, -420],
            rotate: [0, 0, -3],
            opacity: 0,
            scale: 0.9,
          },
          next: {
            translate: ["100%", 0, 0],
            rotate: [0, 0, 3],
            scale: 1.05,
          },
        }}
        className="adsBanner__swiper"
      >
        {ads.map((ad) => {
          const image = ad.img?.[0];
          const external = isExternal(ad.url);

          return (
            <SwiperSlide key={ad.id} className="adsBanner__slide">
              <a
                href={ad.url || "#"}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="adsBanner__link"
                aria-label="Advertisement"
              >
                <img src={image} alt="" className="adsBanner__img" loading="lazy" />
                <span className="adsBanner__veil" />
                <span className="adsBanner__shine" />
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {ads.length > 1 && (
        <>
          <button
            type="button"
            ref={prevRef}
            className="adsBanner__arrow adsBanner__arrow--prev"
            aria-label="Previous"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            ref={nextRef}
            className="adsBanner__arrow adsBanner__arrow--next"
            aria-label="Next"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </>
      )}

      <div className="adsBanner__dots" />

      {/* Shop Now */}
      <div className="adsBanner__cta">
        <a href="/shop" className="rd-btn rd-btn--auto">
          Shop Now
        </a>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
.adsBanner{position:relative;margin:28px auto 10px;padding:0;max-width:none;width:100%}
@media (min-width:768px){.adsBanner{padding:0;margin:40px auto 16px}}
.adsBanner__swiper{border-radius:0;overflow:hidden;background:#0b0b0b}
.adsBanner__slide{overflow:hidden;background:#0b0b0b}
.adsBanner__link{position:relative;display:block;width:100%;height:42vw;max-height:520px;min-height:190px;overflow:hidden}
@media (min-width:1024px){.adsBanner__link{height:30vw}}
.adsBanner__img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.14);filter:saturate(.85);transition:filter .8s ease}
.swiper-slide-active .adsBanner__img{animation:adsKenBurns 7s ease-out forwards;filter:saturate(1.05)}
@keyframes adsKenBurns{0%{transform:scale(1.14) translate3d(2%,1%,0)}100%{transform:scale(1) translate3d(0,0,0)}}
.adsBanner__veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 45%,rgba(0,0,0,.25) 100%);pointer-events:none}
.adsBanner__shine{position:absolute;top:0;left:-60%;width:45%;height:100%;pointer-events:none;background:linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.28) 50%,rgba(255,255,255,0) 100%);transform:skewX(-18deg);opacity:0}
.swiper-slide-active .adsBanner__shine{animation:adsShine 1.5s .35s ease-out forwards}
@keyframes adsShine{0%{left:-60%;opacity:0}25%{opacity:1}100%{left:120%;opacity:0}}
.adsBanner__link:hover .adsBanner__img{filter:saturate(1.15) brightness(1.03)}
.adsBanner__arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:20;width:34px;height:34px;border:none;border-radius:50%;cursor:pointer;background:rgba(255,255,255,.55);backdrop-filter:blur(4px);box-shadow:0 4px 12px -6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:.55;transition:opacity .3s ease,background .3s ease}
.adsBanner:hover .adsBanner__arrow{opacity:.9}
.adsBanner__arrow:hover{background:#fff;opacity:1}
.adsBanner__arrow--prev{left:12px}
.adsBanner__arrow--next{right:12px}
.adsBanner__arrow svg{color:#111;pointer-events:none}
.adsBanner__arrow.swiper-button-disabled{opacity:.2 !important;pointer-events:none}
@media (min-width:768px){.adsBanner__arrow{width:40px;height:40px}.adsBanner__arrow--prev{left:20px}.adsBanner__arrow--next{right:20px}}
.adsBanner__dots{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px}
.adsBanner__dots .swiper-pagination-bullet{width:26px;height:3px;border-radius:2px;background:#c9c9c9;opacity:1;margin:0 !important;transition:width .35s ease,background .35s ease}
.adsBanner__dots .swiper-pagination-bullet-active{width:52px;background:#100501}
.adsBanner__cta{display:flex;justify-content:center;margin-top:18px}
@media (min-width:768px){.adsBanner__cta{margin-top:24px}}
`,
        }}
      />
    </section>
  );
};

export default AdsBanner;
