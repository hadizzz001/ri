'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const Page = () => {
  const [allTemp1, setAllTemps1] = useState(null);
  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/service/${search}`);
        const data = await response.json();
        console.log("data: ", data);

        setAllTemps1(data[0]);
      } catch (error) {
        console.error("Error fetching the description:", error);
      }
    };

    if (search) fetchData();
  }, [search]);

  if (!allTemp1) return <p>Loading...</p>;

  const whatsappLink = `https://wa.me/96178808100?text=Hello, I am interested in this service: ${encodeURIComponent(allTemp1.title)}`;

  return (
    <div className="p-4 max-w-md mx-auto">
      {allTemp1.img && allTemp1.img[0] && (
        <img
          src={allTemp1.img[0]}
          alt={allTemp1.title}
          width={500}
          height={300}
          className="rounded-lg mb-4"
        />
      )}
      <h1 className="text-2xl font-bold mb-2">{allTemp1.title}</h1>
      <p className="mb-4 text-gray-700">{allTemp1.description}</p>
 
                  <button
              className="mt-4 px-4 py-2 bg-[#7c7974] text-white rounded-full hover:bg-black"
              onClick={() => window.location.href = whatsappLink}
            >
              Contact Us
            </button>
    </div>
  );
};

export default Page;
