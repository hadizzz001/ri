"use client";

import React, { useEffect, useRef } from "react";

// Portrait montage. Cloudinary delivers it as H.264 MP4: the uploaded .mov is
// HEVC, which Chrome / Firefox on Android and Windows cannot play.
const VIDEO_SRC =
  "https://res.cloudinary.com/dgi9mfldc/video/upload/q_auto/v1790714141/IMG_7147_epw0az.mp4";
const VIDEO_POSTER =
  "https://res.cloudinary.com/dgi9mfldc/video/upload/so_0,q_auto,f_auto/v1790714141/IMG_7147_epw0az.jpg";

// Copy over the video — laid out like amadeussabra.com's hero
const KICKER = "Where Artistry";
const TITLE = "Meets Your Beauty Vision";

const MyCarousel = () => {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const ambientRef = useRef(null);

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

  return (
    <section ref={heroRef} className="homeHero" aria-label="Welcome">
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

      <div className="homeHero__content">
        <p className="homeHero__kicker">{KICKER}</p>
        <p className="homeHero__title">{TITLE}</p>
        <div className="homeHero__cta">
          <a href="/appointment" className="rd-btn rd-btn--beige rd-btn--auto">
            Book Appointment
          </a>
        </div>
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
/* #0a0a0a matches the clip's dark backdrop */
.homeHero{position:relative;display:grid;background:#0a0a0a}
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

/* Copy: bottom-centre on phones, centred from 700px; the top padding keeps it
   clear of the header lying over the video */
.homeHero__content{grid-area:1/1;z-index:3;align-self:end;justify-self:center;max-width:780px;
  margin:64px 20px;padding-top:var(--header-h,0px);text-align:center;color:#fff}
@media (min-width:700px){.homeHero__content{align-self:center;margin:64px 32px}}
@media (min-width:1000px){.homeHero__content{margin:64px 48px}}
.homeHero__kicker,.homeHero__title{margin:0;font-family:var(--font-heading)!important;font-weight:400!important;
  letter-spacing:.18em!important;text-transform:uppercase;color:#fff!important;overflow-wrap:anywhere}
.homeHero__kicker{font-size:12px!important;line-height:1.7!important}
.homeHero__title{margin-top:16px;font-size:clamp(22px,18.34px + .976vw,32px)!important;line-height:1.5!important}
.homeHero__cta{display:flex;justify-content:center;margin-top:24px}
.homeHero .rd-btn{min-height:0;padding:10.4px 28px}
@media (min-width:1000px){.homeHero__title{margin-top:20px}.homeHero__cta{margin-top:32px}}
@media (min-width:1150px){.homeHero__title{line-height:1.3!important}}

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
