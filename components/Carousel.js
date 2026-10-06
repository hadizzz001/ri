"use client";

import React, { useEffect, useRef, useState } from "react";

// Portrait montage. Cloudinary delivers it as H.264 MP4: the uploaded .mov is
// HEVC, which Chrome / Firefox on Android and Windows cannot play.
const VIDEO_SRC =
  "https://res.cloudinary.com/dgi9mfldc/video/upload/q_auto/v1790714141/IMG_7147_epw0az.mp4";
const VIDEO_POSTER =
  "https://res.cloudinary.com/dgi9mfldc/video/upload/so_0,q_auto,f_auto/v1790714141/IMG_7147_epw0az.jpg";

// Slides cycled over the video, like the slideshow of amadeussabra.com's hero
const SLIDES = [
  { kicker: "Where Artistry", title: "Meets Your Beauty Vision", cta: "Book Appointment", href: "/appointment" },
  { kicker: "Since 1994", title: "Crafting Beautiful Hair", cta: "View Our Services", href: "/services" },
  { kicker: "Salon Quality", title: "Hair Care for Home", cta: "Shop the Collection", href: "/shop" },
  {
    kicker: "Hair Extensions",
    title: "Length and Volume",
    cta: "Discover Extensions",
    href: "/service?id=69d909a6c7e932b41d1b1734",
  },
];

// Slide change timing of amadeussabra.com's theme (Prestige): the shown copy
// leaves, then the slides swap and the new copy enters. The CSS animations
// below are timed to match.
const LEAVE_MS = 350;
const ENTER_MS = 1200;

const MyCarousel = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const ambientRef = useRef(null);
  const timerRef = useRef(0);
  const swipeRef = useRef(null);
  // shown: the slide on screen; target: the slide being moved to (the dots
  // follow it); phase: the class of the change playing out on the shown slide
  const [view, setView] = useState({ shown: 0, target: 0, phase: "" });
  const viewRef = useRef(view);
  const [autoplay, setAutoplay] = useState(false);

  const patchView = (patch) => {
    viewRef.current = { ...viewRef.current, ...patch };
    setView(viewRef.current);
  };

  const select = (index) => {
    const { target, phase } = viewRef.current;
    if (index === target) return;
    // copy still leaving: the pending swap just lands on the new pick
    if (phase === "is-leaving") {
      patchView({ target: index });
      return;
    }
    clearTimeout(timerRef.current);
    patchView({ target: index, phase: "is-leaving" });
    timerRef.current = setTimeout(() => {
      patchView({ shown: viewRef.current.target, phase: "is-entering" });
      timerRef.current = setTimeout(() => patchView({ phase: "" }), ENTER_MS);
    }, LEAVE_MS);
  };

  const step = (delta) => select((viewRef.current.target + delta + SLIDES.length) % SLIDES.length);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // The countdown starts once hydrated: a ring ending before then would go unheard
  useEffect(() => setAutoplay(true), []);

  // Wide screens show the whole portrait clip centred; a tiny canvas mirrors
  // the playing frame and is blurred behind it, so the sides glow with the
  // scene's colours (no second download, always in sync).
  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    const canvas = ambientRef.current;
    if (!hero || !video || !canvas) return undefined;

    const wide = window.matchMedia("(min-aspect-ratio: 3/4)");
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let last = 0;
    let visible = true;

    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      if (time - last < 66 || video.readyState < 2) return; // ~15 fps is plenty for a blur
      last = time;
      // cover-crop the middle of the portrait frame into the landscape canvas
      const sourceHeight = Math.min(video.videoHeight, (video.videoWidth * canvas.height) / canvas.width);
      const sourceY = (video.videoHeight - sourceHeight) / 2;
      ctx.drawImage(video, 0, sourceY, video.videoWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    };

    const update = () => {
      cancelAnimationFrame(frame);
      if (wide.matches && visible) frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(hero);
    wide.addEventListener?.("change", update);
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      wide.removeEventListener?.("change", update);
    };
  }, []);

  const goToNextSection = () => {
    heroRef.current?.nextElementSibling?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  // The current dot's ring fills in 5s (CSS); when it completes, move on
  const onProgressEnd = (event) => {
    if (event.animationName === "homeHeroProgress") step(1);
  };

  // Arrow keys while the hero itself has focus, as in the theme
  const onKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  };

  // Swipes, with the theme's thresholds: 80px across within half a second
  const onPointerDown = (event) => {
    swipeRef.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };
  };

  const onPointerUp = (event) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || event.timeStamp - start.time > 500) return;
    const deltaX = event.clientX - start.x;
    if (Math.abs(deltaX) > 80 && Math.abs(event.clientY - start.y) < 80) step(deltaX < 0 ? 1 : -1);
  };

  return (
    <section
      ref={heroRef}
      className={`homeHero${autoplay ? " is-autoplay" : ""}`}
      aria-roledescription="carousel"
      aria-label="Welcome"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeRef.current = null;
      }}
    >
      <div className="homeHero__media">
        <canvas ref={ambientRef} className="homeHero__ambient" width="64" height="36" aria-hidden="true" />

        {/* Background Video */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={VIDEO_POSTER}
          className="homeHero__video"
          muted
          playsInline
          preload="auto"
          autoPlay
          loop
          disablePictureInPicture
          aria-hidden="true"
        />
      </div>

      {SLIDES.map((slide, index) => (
        <div
          key={slide.title}
          className={index === view.shown ? `homeHero__slide is-selected ${view.phase}`.trim() : "homeHero__slide"}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${SLIDES.length}`}
        >
          <div className="homeHero__text">
            <p className="homeHero__kicker">{slide.kicker}</p>
            <p className="homeHero__title">{slide.title}</p>
            <div className="homeHero__cta">
              <a href={slide.href} className="rd-btn rd-btn--beige rd-btn--auto">
                {slide.cta}
              </a>
            </div>
          </div>
        </div>
      ))}

      <div className="homeHero__dots">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className="homeHero__dot"
            aria-current={index === view.target}
            onClick={() => select(index)}
            onAnimationEnd={onProgressEnd}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
            <svg className="homeHero__ring" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" focusable="false">
              <circle cx="4" cy="4" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
              <circle cx="4" cy="4" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ))}
      </div>

      <button type="button" className="homeHero__next" onClick={goToNextSection}>
        <span className="sr-only">Navigate to next section</span>
        <svg aria-hidden="true" focusable="false" fill="none" width="18" viewBox="0 0 18 16">
          <path d="m1 4 8 8 8-8" stroke="currentColor" strokeLinecap="square" />
        </svg>
      </button>

      <style
        dangerouslySetInnerHTML={{
          __html: `
/* #0a0a0a matches the clip's dark backdrop; pan-y leaves sideways swipes to the slideshow */
.homeHero{--homeHero-play:running;position:relative;display:grid;background:#0a0a0a;touch-action:pan-y pinch-zoom}
.homeHero:focus{outline:0}
.homeHero:focus-visible{outline:2px solid #fff!important;outline-offset:-6px}
.homeHero__media{grid-area:1/1;position:relative;height:100vh;height:100svh;overflow:hidden}
/* the darkening veil amadeussabra.com lays over its footage */
.homeHero__media::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(180deg,rgba(54,54,54,.2),rgba(4,4,4,.65) 100%)}
.homeHero__video{position:relative;z-index:1;display:block;width:100%;height:100%;object-fit:cover}
.homeHero__ambient{display:none}
/* Wider screens: the whole portrait, centred, edges feathered into the glow */
@media (min-aspect-ratio:3/4){
  .homeHero__ambient{display:block;position:absolute;inset:0;width:100%;height:100%;
    filter:blur(40px) saturate(1.1) brightness(.75);transform:scale(1.2)}
  .homeHero__video{width:auto;max-width:100%;aspect-ratio:1080/1906;margin:0 auto;
    -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 12%,#000 88%,transparent 100%);
            mask-image:linear-gradient(90deg,transparent 0,#000 12%,#000 88%,transparent 100%)}
}

/* Copy: bottom-centre on phones (leaving room for the dots below it), centred
   from 700px; the top padding keeps it clear of the header lying over the
   video. The slides share one cell and only the selected one is visible. */
.homeHero__slide{grid-area:1/1;z-index:3;align-self:end;justify-self:center;max-width:780px;
  margin:64px 20px 96px;padding-top:var(--header-h,0px);text-align:center;color:#fff}
.homeHero__slide:not(.is-selected){visibility:hidden}
@media (min-width:700px){.homeHero__slide{align-self:center;margin:64px 32px}}
@media (min-width:1000px){.homeHero__slide{margin:64px 48px}}
.homeHero__kicker,.homeHero__title{margin:0;font-family:var(--font-heading)!important;font-weight:400!important;
  letter-spacing:.18em!important;text-transform:uppercase;color:#fff!important;overflow-wrap:anywhere}
.homeHero__kicker{font-size:12px!important;line-height:1.7!important}
.homeHero__title{margin-top:16px;font-size:clamp(22px,18.34px + .976vw,32px)!important;line-height:1.5!important}
.homeHero__cta{display:flex;justify-content:center;margin-top:24px}
.homeHero .rd-btn{min-height:0;padding:10.4px 28px}
@media (min-width:1000px){.homeHero__title{margin-top:20px}.homeHero__cta{margin-top:32px}}
@media (min-width:1150px){.homeHero__title{line-height:1.3!important}}

/* Slide change, as in amadeussabra.com's slideshow: the copy sinks and fades
   (.25s), the slides swap at .35s, then the new slide fades in (.8s) while its
   copy rises from .4s and its button from .6s. The button sits inside the
   copy, so its offset adds to the copy's, as on the theme. */
.homeHero__slide.is-leaving .homeHero__text{animation:homeHeroTextOut .25s cubic-bezier(.55,.055,.675,.19) both}
.homeHero__slide.is-leaving .homeHero__cta{animation:homeHeroCtaOut .25s cubic-bezier(.55,.055,.675,.19) both}
.homeHero__slide.is-entering{animation:homeHeroFadeIn .8s cubic-bezier(.25,.46,.45,.94) both}
.homeHero__slide.is-entering .homeHero__text{animation:homeHeroTextIn .6s cubic-bezier(.215,.61,.355,1) .4s both}
.homeHero__slide.is-entering .homeHero__cta{animation:homeHeroCtaIn .6s cubic-bezier(.215,.61,.355,1) .6s both}
@keyframes homeHeroTextOut{to{opacity:0;transform:translateY(10px)}}
@keyframes homeHeroCtaOut{to{opacity:0;transform:translateY(20px)}}
@keyframes homeHeroFadeIn{from{opacity:0}}
@keyframes homeHeroTextIn{from{opacity:0;transform:translateY(30px)}}
@keyframes homeHeroCtaIn{from{opacity:0;transform:translateY(20px)}}

/* Dots: under the copy on phones, bottom right from 700px as on the theme, and
   always above the chat / booking buttons fixed in the page's bottom corners.
   The current one draws a ring that fills in 5s, and the slideshow moves on
   when it completes, so holding the ring holds the slide: it waits while
   keyboard focus is in the hero. */
.homeHero:is(:focus-visible,:has(:focus-visible)){--homeHero-play:paused}
.homeHero__dots{position:absolute;z-index:3;bottom:60px;left:50%;transform:translateX(-50%);
  display:flex;gap:16px;color:#fff}
@media (min-width:700px){.homeHero__dots{left:auto;right:32px;bottom:64px;transform:none}}
@media (min-width:1000px){.homeHero__dots{right:48px}}
.homeHero__dot{position:relative;display:grid;place-content:center;width:6px;height:6px;padding:0;border:0;
  border-radius:50%;background:none;color:inherit;cursor:pointer}
.homeHero__dot::before{content:"";position:absolute;inset:-8px}
.homeHero__dot::after{content:"";position:absolute;inset:0;border-radius:inherit;background:currentColor;
  opacity:.4;transition:opacity .25s}
.homeHero__dot:focus-visible{outline:2px solid #fff!important;outline-offset:4px}
.homeHero__ring{display:block;transform:rotate(-90deg);transition:opacity .25s}
.homeHero__dot[aria-current=true]::after,.homeHero__dot[aria-current=false] .homeHero__ring{opacity:0}
.homeHero__dot[aria-current=false]::after,.homeHero__dot[aria-current=true] .homeHero__ring{transition-delay:.15s}
.homeHero__ring circle:last-child{stroke-dasharray:20.42;stroke-dashoffset:20.42}
.homeHero.is-autoplay .homeHero__dot[aria-current=true] .homeHero__ring circle:last-child{
  animation:homeHeroProgress 5s linear var(--homeHero-play) both}
@keyframes homeHeroProgress{to{stroke-dashoffset:0}}

/* Reduced motion: the copy only fades, and nothing advances by itself (the
   ring that drives autoplay is hidden; the current dot shows solid instead) */
@media (prefers-reduced-motion:reduce){
  .homeHero__text,.homeHero__cta{transform:none!important}
  .homeHero__ring{display:none}
  .homeHero__dot[aria-current=true]::after{opacity:1}
}

/* round "next section" button straddling the bottom edge */
.homeHero__next{position:absolute;z-index:3;bottom:-25px;left:calc(50% - 25px);width:50px;height:50px;
  display:grid;place-items:center;padding:0;border:0;border-radius:9999px;cursor:pointer;
  background:#fff;color:#1c1c1c;box-shadow:0 2px 10px rgba(28,28,28,.15)}
.homeHero__next svg{display:block;width:16px;height:auto}
.homeHero__next:focus-visible{outline:2px solid #1c1c1c!important;outline-offset:3px}
@media (pointer:fine) and (prefers-reduced-motion:no-preference){
  .homeHero__next:hover svg{animation:homeHeroArrow .35s ease-in-out forwards}
}
@keyframes homeHeroArrow{
  0%{opacity:1;transform:translateY(0)}
  50%{opacity:0;transform:translateY(100%)}
  51%{opacity:0;transform:translateY(-100%)}
  to{opacity:1;transform:translateY(0)}
}
`,
        }}
      />
    </section>
  );
};

export default MyCarousel;
