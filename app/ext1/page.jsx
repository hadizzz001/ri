'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const Page = () => {
  const [allTemp1, setAllTemps1] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/ext/${search}`);
        const data = await response.json();
        setAllTemps1(data[0]);
      } catch (error) {
        console.error("Error fetching the description:", error);
      }
    };

    if (search) fetchData();
  }, [search]);

  if (!allTemp1) return <p>Loading...</p>;

  const whatsappLink = `https://wa.me/96178808100?text=Hello, I am interested in this extensions: ${encodeURIComponent(allTemp1.title)}`;

  return (
    <div className="p-4 max-w-md mx-auto mt-20 mb-20">
      <h1 className="text-2xl font-bold mb-4 text-center">{allTemp1.title}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allTemp1.img?.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Gallery image ${index + 1}`}
            width={500}
            height={300}
            className="rounded-lg cursor-pointer"
            onClick={() => setSelectedImg(src)}
          />
        ))}
      </div>

      <button
        className="mt-6 px-4 py-2 bg-[#cab8ac] text-[#100501] rounded-none hover:bg-black block mx-auto"
        onClick={() => window.location.href = whatsappLink}
      >
        Contact Us
      </button>

      {selectedImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} alt="Preview" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default Page;
