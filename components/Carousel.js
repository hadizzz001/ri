"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    video: "https://res.cloudinary.com/www-eliesaab-com/video/upload/c_scale,f_auto,h_1200,q_auto/v1744893489/trial_rpxj2w.mp4",
    topLine: "BRIDE HAIR EXPERT",
    bottomLine: "Bridal hair elegance",
    link: "/appointment",
  },
  {
    id: 2,
    video: "https://res.cloudinary.com/www-eliesaab-com/video/upload/c_scale,f_auto,h_1200,q_auto/v1737360408/marina_banner2_w7vbhe.mp4",
    topLine: "HAIR COLORING STYLE",
    bottomLine: "Vibrant color touch",
    link: "/appointment",
  },
];

const MyCarousel = () => {
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
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative overflow-hidden">
              {/* Video */}
              <video
                src={slide.video}
                className="w-full h-screen object-cover transition-transform duration-[4000ms] ease-in-out scale-110"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* Pattern overlay at bottom-right, fully visible */}
              <div
                className="absolute bottom-0 right-0 z-10"
                style={{
                  width: '550px', // set a fixed width
                  height: '550px', // set a fixed height
                  backgroundImage:
                    "url('https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/Untitled-11_lfqbgu.webp')",
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'bottom right',
                  opacity: 0.05,
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: "31em",
                  left: "3em",
                }}
              />

              {/* Text + Button Layer */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-black text-center z-20">
                <h5 className="mb-3 text-white uppercase animate-slideInLeft">
                  {slide.bottomLine}
                </h5>
                <h1 className="text-white uppercase animate-slideInLeft">
                  {slide.topLine}
                </h1>

                {/* CTA Button */}
                <a
                  href={slide.link}
                  className="text-[12px] uppercase mt-20 px-7 py-3 bg-[#cab8ac] text-black transition-all duration-300 transform hover:scale-105 z-30 selected-hour"
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
