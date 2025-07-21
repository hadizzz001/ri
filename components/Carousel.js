"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const slidesData = [
  { id: 1, bottomLine: "Welcome to a world of beauty, expertise, and elegance!" },
  { id: 2, bottomLine: "Beauty Care Is Our Passion" },
  { id: 3, bottomLine: "The brush doesn’t paint… it speaks my passion." },
  { id: 4, bottomLine: "A Haircut That Speaks Confidence" },
  { id: 5, bottomLine: "Bridal Beauty & Luxury Hair Care" },
];

const MyCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleVideoPlay = () => {
    if (!swiperRef.current) return;

    let index = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    // 19 seconds / 5 slides = 3800ms per slide
    timerRef.current = setInterval(() => {
      index++;
      if (index >= slidesData.length) index = 0;
      swiperRef.current.slideToLoop(index); // go to slide
    }, 3800);
  };

  return (
    <div className="relative w-full">
      <Swiper
        modules={[EffectFade]}
        effect="fade"
        loop={true}
        speed={1000}
        className="h-screen"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        {slidesData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative overflow-hidden">
              <video
                src={isMobile ? "../mob.mp4" : "../vid.mp4"}
                className="w-full h-screen object-cover transition-transform duration-[4000ms] ease-in-out scale-110"
                autoPlay
                muted
                loop
                playsInline
                onPlay={handleVideoPlay}
              />
              <div
                className="absolute bottom-0 right-0 z-10"
                style={{
                  width: "550px",
                  height: "550px",
                  backgroundImage: "url('https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/Untitled-11_lfqbgu.webp')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "bottom right",
                  opacity: 0.05,
                  pointerEvents: "none",
                  top: "31em",
                  left: "3em",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-20">
                <h5 className="mb-3 text-white animate-slideInLeft">{slide.bottomLine}</h5>
                <a href="/appointment" className="py-1 myNewButtonHadiz">Book Appointment</a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MyCarousel;
