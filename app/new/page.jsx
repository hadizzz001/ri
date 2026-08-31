'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const Page = () => {
  const [allTemp1, setAllTemps1] = useState(null);
  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/new/${search}`);
        const data = await response.json();
        setAllTemps1(data[0]);
      } catch (error) {
        console.error('Error fetching the description:', error);
      }
    };

    if (search) fetchData();
  }, [search]);

  if (!allTemp1) return <p>Loading...</p>;

  return (
    <div className="sywPaymentOptions container mt-10 text-center">
      {/* same inline style usage (if needed globally) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .border-gray-400 {
              --tw-border-opacity: 1;
              border-color: rgb(156 163 175 / var(--tw-border-opacity)) !important;
            }
            .news-body,
            .news-body * {
              text-align: center !important;
            }
            .news-body img,
            .news-body iframe,
            .news-body video {
              display: block;
              margin-left: auto;
              margin-right: auto;
              max-width: 100%;
              height: auto;
            }
            .news-body ul,
            .news-body ol {
              list-style-position: inside;
              padding-left: 0;
            }
          `,
        }}
      />

{allTemp1.img && allTemp1.img[0] && (
  <img
    src={allTemp1.img[0]}
    alt={allTemp1.title}
    width={500}
    height={300}
    className="rounded-lg mb-4 mx-auto block"
  />
)}

      {/* Title – same font style */}
      <h1 className="uppercase myparhal1 text-center text-balance max-w-3xl mx-auto px-4">
        <b className="myBold">{allTemp1.title}</b>
      </h1>

      {/* Description */}
      <div
        className="news-body mt-4 px-4 text-black text-center text-pretty max-w-2xl mx-auto leading-relaxed"
        dangerouslySetInnerHTML={{ __html: allTemp1.description }}
      /> 
    </div>
  );
};

export default Page;
