"use client";

import React, { useEffect, useRef } from "react";

// Portrait montage. Cloudinary delivers it as H.264 MP4: the uploaded .mov is
// HEVC, which Chrome / Firefox on Android and Windows cannot play.
const VIDEO_SRC =
  "https://res.cloudinary.com/dgi9mfldc/video/upload/q_auto/v1790714141/IMG_7147_epw0az.mp4";
const VIDEO_POSTER =
  "https://res.cloudinary.com/dgi9mfldc/video/upload/so_0,q_auto,f_auto/v1790714141/IMG_7147_epw0az.jpg";

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

  return (
    <div className="w-full">
      {/* Banner Wrapper — edge to edge */}
      <div ref={heroRef} className="homeHero relative w-full h-screen overflow-hidden">
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

        {/* Background Graphic Overlay */}
        <div
          className="absolute bottom-0 right-0 z-10"
          style={{
            width: "550px",
            height: "550px",
            backgroundImage:
              "url('https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/Untitled-11_lfqbgu.webp')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "bottom right",
            opacity: 0.025,
            pointerEvents: "none",
            top: "31em",
            left: "3em",
          }}
        />

        {/* Book Appointment */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <a href="/appointment" className="rd-btn rd-btn--light rd-btn--auto whitespace-nowrap">
            Book Appointment
          </a>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
/* #0a0a0a matches the clip's dark backdrop */
.homeHero{background:#0a0a0a}
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
`,
        }}
      />
    </div>
  );
};

export default MyCarousel;
