'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; 

type ImageConfig = {
  top: number;
  side: 'left' | 'right' | 'center';
  cropped: boolean;
  rotate: boolean;
  scale: number;
};

const BackgroundImages = () => {
  const [images, setImages] = useState<ImageConfig[]>([]);
const pathname = usePathname(); 

  useEffect(() => {
    const maxImages = 10;
    const verticalBase = 40; 
  const maxTotalEm = pathname === '/' ? 325 : 100;
    const imagesArray: ImageConfig[] = [];

    let currentTop = 0;

    for (let i = 0; i < maxImages; i++) {
      if (currentTop > maxTotalEm) break;

      const cropped = false; // <--- cropping disabled
      const side = Math.random() < 0.3 ? 'center' : Math.random() < 0.5 ? 'left' : 'right';
      const rotate = false; // optional: disable rotate too
      const scale = +(0.8 + Math.random() * 0.5).toFixed(2);

      imagesArray.push({
        top: currentTop,
        side,
        cropped,
        rotate,
        scale,
      });

      const extraSpace = Math.floor(Math.random() * 70) + verticalBase;
      currentTop += extraSpace;
    }

    setImages(imagesArray);
  }, []);

  const getImageUrl = (side: string) => {
    switch (side) {
      case 'left':
        return 'https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751040038/Untitled-11y_uq85gb.webp';
      case 'right':
        return 'https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751040038/Untitled-11z_kdzeqg.webp';
      default:
        return 'https://res.cloudinary.com/dtjcqfoxc/image/upload/v1751030325/Untitled-11_lfqbgu.webp';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      {images.map((img, idx) => {
        const baseWidth = 250 * 4;
        const width = baseWidth; // full image width
        const height = baseWidth;
        const scaledWidth = width * img.scale;
        const scaledHeight = height * img.scale;

        const sideStyle =
          img.side === 'center'
            ? { left: '50%', transform: `translateX(-50%)` }
            : {
                [img.side]: 0,
                transform: 'none',
              };

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: `${img.top}em`,
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              backgroundImage: `url(${getImageUrl(img.side)})`,
              backgroundSize: `${baseWidth}px ${baseWidth}px`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.1,
              transformOrigin: 'center',
              ...sideStyle,
            }}
          />
        );
      })}
    </div>
  );
};

export default BackgroundImages;
