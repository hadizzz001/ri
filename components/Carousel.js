"use client";

import React, { useState, useEffect, useRef } from "react";

const MyCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const videoSrc = isMobile
    ? "https://res.cloudinary.com/dgi9mfldc/video/upload/v1756650010/Comp_1_2_zyhqez.mp4"
    : "https://res.cloudinary.com/dgi9mfldc/video/upload/v1756649976/Comp_1_3_mypzbm.mp4";

  return (
    <div className="px-4 md:px-8 mt-20">
      {/* Banner Wrapper */}
      <div
        className="relative w-full h-screen overflow-hidden rounded-md"
        style={{ backgroundColor: "black" }}
      >
        {/* Background Video */}
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
          autoPlay
          loop
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
          <a href="/appointment" className="myNewButtonHadiz">
            Book Appointment
          </a>
        </div>
      </div>
    </div>
  );
};

export default MyCarousel;
