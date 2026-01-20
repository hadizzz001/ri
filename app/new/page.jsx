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
    <div className="sywPaymentOptions container mt-10">
      {/* same inline style usage (if needed globally) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .border-gray-400 {
              --tw-border-opacity: 1;
              border-color: rgb(156 163 175 / var(--tw-border-opacity)) !important;
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
      <span className="mx-4">
        <h1 className="uppercase myparhal1 text-left">
          <b className="myBold">{allTemp1.title}</b>
        </h1>
      </span>

      {/* Description */}
      <div
        className="mx-4 mt-4 text-black"
        dangerouslySetInnerHTML={{ __html: allTemp1.description }}
      /> 
    </div>
  );
};

export default Page;
