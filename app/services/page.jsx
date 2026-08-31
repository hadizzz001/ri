'use client';
import { useState, useEffect } from 'react';

const ServicesGrid = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/service');
        const data = await res.json();
        setServices(data); // assuming the API returns an array
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className=" mx-auto py-10 mb-20 mt-20">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {services.map((service, index) => (
          <div key={service.id || index} className="flex h-full flex-col text-center">
            <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-black/5">
              <img
                src={service.img?.[0] || '/fallback.jpg'}
                className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-500 grayscale hover:grayscale-0"
                alt={service.title || 'Service Image'}
                loading="lazy"
              />
            </div>
            <h5 className="mx-2 uppercase mypar11223 mb-3 text-balance">{service.title}</h5>
            <p className="mx-2 my-2 text-pretty">{service.description}</p>
            <button
              className="mx-auto text-[12px] uppercase mt-auto pt-0 px-6 py-3 bg-[#cab8ac] text-[#100501] transition-all duration-300 transform hover:scale-105"
              onClick={() => window.location.href = `service?id=${service._id}`}
            >
              Discover More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesGrid;
