'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';

const FullWidthImageSwiper = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/new');
        const data = await res.json();
        // Filter items that have at least one image
        const filtered = data.filter((item) => item.img?.[0]);
        setItems(filtered);
      } catch (err) {
        console.error('Failed to fetch images:', err);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="w-full h-[550px] overflow-hidden mt-10 mb-20">
<span className="mx-4 flex justify-center mb-4">
  <h1 className="uppercase myparhal1 text-center">
    Our <b className="myBold">News</b>
  </h1>
</span>

      <Swiper
        modules={[A11y, Autoplay]}
        spaceBetween={10}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 4,
          },
        }}
      >
        {items.map((item) => (
          <SwiperSlide key={item._id}>
            <div className="w-full h-[550px] relative">
              <a href={`/new?id=${item._id}`}>
                <img
                  src={item.img[0]}
                  alt="Slide"
                  className="object-cover w-full h-full"
                />
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
};

export default FullWidthImageSwiper;
