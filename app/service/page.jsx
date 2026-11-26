'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const Page = () => {
  const [allTemp1, setAllTemps1] = useState(null);
  const [data, setData] = useState([]); // ServiceData rows for this service
  const searchParams = useSearchParams();
  const search = searchParams.get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, dataRes] = await Promise.all([
          fetch(`/api/service/${search}`),
          fetch(`/api/servicedata/${search}`),
        ]);
        const service = await serviceRes.json();
        const serviceData = await dataRes.json();

        setAllTemps1(service[0]);
        setData(Array.isArray(serviceData) ? serviceData : []);
      } catch (error) {
        console.error("Error fetching the description:", error);
      }
    };

    if (search) fetchData();
  }, [search]);

  if (!allTemp1) return <p>Loading...</p>;

  const whatsappLink = `https://wa.me/96178808100?text=Hello, I am interested in this service: ${encodeURIComponent(allTemp1.title)}`;

  return (
    <div className="w-full mt-4 mb-4 text-center">
      {/* Original service header (always shown) */}
      <h1 className="text-2xl font-bold mb-4 text-center text-balance max-w-3xl mx-auto px-4">
        {allTemp1.title}
      </h1>

      {allTemp1.description && (
        <p className="mb-6 text-center whitespace-pre-line text-pretty max-w-2xl mx-auto px-4 leading-relaxed">
          {allTemp1.description}
        </p>
      )}

      {allTemp1.img?.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Gallery image ${index + 1}`}
          className="w-full max-w-3xl mx-auto h-auto block mb-4"
        />
      ))}

      {/* Extra service data blocks (shown only when available) */}
      {data.map((item, i) => (
        <div key={item._id || i} className="mb-10 text-center">
          {item.title && (
            <h2 className="text-xl uppercase tracking-wide mb-2 text-center text-balance max-w-3xl mx-auto px-4">
              {item.title}
            </h2>
          )}
          {item.description && (
            <p className="mb-6 text-center whitespace-pre-line text-pretty max-w-2xl mx-auto px-4 leading-relaxed">
              {item.description}
            </p>
          )}
          {item.img?.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={item.title || `Image ${index + 1}`}
              className="w-full max-w-3xl mx-auto h-auto block mb-4"
            />
          ))}
        </div>
      ))}

      <div className="flex justify-center">
        <button
          className="rd-btn rd-btn--auto"
          onClick={() => window.location.href = whatsappLink}
        >
          Contact Us
        </button>
      </div>
    </div>
  );
};

export default Page;
