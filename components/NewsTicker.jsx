'use client';
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';
import Link from 'next/link';

const NewsTicker = () => {
  const [brands, setBrands] = useState([]);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api1/brand');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <div className="w-full py-2 mt-10 newsTickerBrands">
      <style
        dangerouslySetInnerHTML={{
          __html:
            '.newsTickerBrands .rfm-marquee,.newsTickerBrands .rfm-initial-child-container,.newsTickerBrands .rfm-child{align-items:flex-end !important}' +
            '.newsTickerBrands__head{color:#1c1c1c;padding-top:1.5rem;margin-bottom:1.5rem}' +
            '@media (min-width:1000px){.newsTickerBrands__head{padding-top:2.5rem;margin-bottom:2rem}}',
        }}
      />
      <div className="rd-section-head newsTickerBrands__head">
        <p className="rd-kicker">Our Trusted Brand Partners</p>
        <h2 className="rd-title">Our Premium Brand Portfolio</h2>
      </div>
      <Marquee speed={80} gradient={false} autoFill pauseOnHover={false}>
        {brands
          .filter((brand) => {
            const img = Array.isArray(brand.img) ? brand.img[0] : brand.img;
            return !!img;
          })
          .map((brand) => (
            <Link
              key={brand.id ?? brand._id}
              href={`/shop?brnd=${encodeURIComponent(brand.name)}`}
              className="mx-12 flex items-end justify-center"
            >
              <img
                src={Array.isArray(brand.img) ? brand.img[0] : brand.img}
                alt={brand.name}
                style={{
                  width: '160px',
                  height: '160px',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  display: 'block',
                }}
              />
            </Link>
          ))}
      </Marquee>
    </div>
  );
};

export default NewsTicker;
