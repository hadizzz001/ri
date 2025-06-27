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
<div className="mx-auto py-10 mb-20 lg:max-w-[800px]">
  <div className="grid grid-cols-1">
    {services.map((service, index) => (
      <div key={service.id || index} className="text-center">
        <div className="w-full h-[350px] mb-4 lg:h-[550px]">
          <img
            src={service.img?.[0] || '/fallback.jpg'}
            className="object-cover w-full h-full transition-all duration-500 grayscale hover:grayscale-0"
            alt={service.title || 'Service Image'}
          />
        </div>
        <h5 className="mx-2 uppercase mypar11223 mb-3 bold">{service.title}</h5>
        <p className="mx-2 my-2">{service.description}</p>
        <button
          className="text-[12px] uppercase mt-4 mb-10 px-6 py-3 bg-[#cab8ac] text-[#100501] transition-all duration-300 transform hover:scale-105"
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
