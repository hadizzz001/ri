"use client";

import React, { useState, useEffect, useRef } from "react";

const slidesData = [
  { id: 1, bottomLine: "Welcome to a world of beauty", subtitle: "Expertise, and elegance!", duration: 3000 },
  { id: 2, bottomLine: "Beauty Care", subtitle: "Is Our Passion", duration: 3000 },
  { id: 3, bottomLine: "The brush doesn’t paint…", subtitle: "it speaks my passion.", duration: 2000 },
  { id: 4, bottomLine: "A Haircut That", subtitle: "Speaks Confidence", duration: 3000 },
  { id: 5, bottomLine: "Bridal Beauty", subtitle: "& Luxury Hair Care", duration: 6000 },
];

const MyCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeBlack, setFadeBlack] = useState(false);
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Slide loop logic with black fade effect
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // Trigger black fade overlay
      setFadeBlack(true);

      // After short fade duration, switch slide and remove black overlay
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slidesData.length);
        setFadeBlack(false);
      }, 300); // fade duration: 300ms
    }, slidesData[currentIndex].duration);

    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex]);

  // Play video on slide change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const slide = slidesData[currentIndex];
  const slideNumber = String(slide.id).padStart(3, "0");
  const videoSrc = isMobile ? `/${slideNumber}mo.mp4` : `/${slideNumber}p.mp4`;

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: "black" }}>
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover scale-110"
        muted
        playsInline
        preload="auto"
        autoPlay
      />

      {/* Black Fade Overlay */}
      <div
        className={`absolute top-0 left-0 w-full h-full bg-black pointer-events-none transition-opacity duration-300 ${
          fadeBlack ? "opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: 50 }}
      />

      {/* Background Graphic */}
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
          opacity: 0.05,
          pointerEvents: "none",
          top: "31em",
          left: "3em",
        }}
      />

      {/* Title & Subtitle - Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-20 px-4">
        <h5 className="myNewButtonHadiz1 whitespace-nowrap">{slide.bottomLine}</h5>
        <p className="myNewButtonHadiz2 whitespace-nowrap">{slide.subtitle}</p>
      </div>

      {/* Book Appointment - Bottom */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
        <a href="/appointment" className="myNewButtonHadiz">
          Book Appointment
        </a>
      </div>
    </div>
  );
};

export default MyCarousel;
