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
        const response = await fetch(`/api/service/${search}`);
        const data = await response.json();
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
    <div className="w-full px-2 mt-4 mb-4"> {/* small padding so images are not stuck */}
      <h1 className="text-2xl font-bold mb-4 text-center">{allTemp1.title}</h1>

      {allTemp1.img?.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Gallery image ${index + 1}`}
          className="w-full block mb-4"
        />
      ))}

      <div className="flex justify-center">
        <button
          className="px-6 py-2 bg-[#cab8ac] text-[#100501]"
          onClick={() => window.location.href = whatsappLink}
        >
          Contact Us
        </button>
      </div>
    </div>
  );
};

export default Page;
