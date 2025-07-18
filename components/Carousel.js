"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const slidesData = [
  {
    id: 1,
    topLine: "BRIDE HAIR EXPERT",
    bottomLine: "Bridal hair elegance",
    link: "/appointment",
  },
];

const MyCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        loop={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        speed={1000}
        className="h-screen"
      >
        {slidesData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative overflow-hidden">
              {/* Video */}
              <video
                src={isMobile ? "../mob.mp4" : "../vid.mp4"}
                className="w-full h-screen object-cover transition-transform duration-[4000ms] ease-in-out scale-110"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* Pattern overlay */}
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
                  position: "absolute",
                  top: "31em",
                  left: "3em",
                }}
              />

              {/* Text + Button Layer */}
              <div className="absolute inset-0 flex flex-col items-center text-black text-center z-20
  justify-end pb-10 md:justify-center md:pb-0">

                <h5 className="mb-3 text-black uppercase animate-slideInLeft">
                  {slide.bottomLine}
                </h5>
                <h1 className="text-black uppercase animate-slideInLeft">
                  {slide.topLine}
                </h1>
                <a
                  href={slide.link}
                  className="text-[12px] uppercase mt-20 px-7 py-3 bg-[#cab8ac] text-black transition-all duration-300 transform hover:scale-105 z-30"
                >
                  Book Now
                </a>
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

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default MyCarousel;
