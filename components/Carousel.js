"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dtjcqfoxc/image/upload/v1740571159/qbciw86pbcpdypdii35x.webp",
    topLine: "BRIDE HAIR EXPERT",
    bottomLine: "The Ultimate Design for Your Fashion",
    link: "/shop",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dtjcqfoxc/image/upload/v1740571158/ery1e1zhhy9wlss2j3yu.webp",
    topLine: "HAIR COLORING STYLE",
    bottomLine: "How to make your own clothes",
    link: "/shop",
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
              <img
                src={slide.image}
                alt={slide.topLine}
                className="w-full h-screen object-cover transition-transform duration-[4000ms] ease-in-out scale-110"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center  text-black text-center">
                <h1 className="text-white text-5xl  uppercase animate-slideInLeft">
                  {slide.topLine}
                </h1>
{/*             
                <a
                  href={slide.link}
                  style={{ padding: "1em" }}
                  className="mt-20 px-6 py-2 bg-[#222222] hover:bg-[#444444] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Read More
                </a> */}
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
