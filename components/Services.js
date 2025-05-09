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
    <div className="container mx-auto px-4 py-10 mb-10">
      <h1 className="text-center uppercase mypar1122" style={{ fontSize: '40px' }}>Hair Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div key={service.id || index} className="p-6 rounded-3xl text-center">
            <div className="w-60 h-60 mx-auto mb-4">
              <img
                src={service.img?.[0] || '/fallback.jpg'} // fallback if image missing
                width={240}
                height={240}
                className="object-cover w-full h-full transition-all duration-500 grayscale hover:grayscale-0"
                style={{ clipPath: 'circle(50%)' }}
                alt={service.title || 'Service Image'}
              />
            </div>
            <h3 className="text-xl font-semibold">{service.title}</h3>
            <p className="text-gray-600 my-2">{service.description}</p>
            <button
              className="mt-4 px-4 py-2 bg-[#7c7974] text-white rounded-full hover:bg-black"
              onClick={() => window.location.href = `service?id=${service._id}`}
            >
              Learn More
            </button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesGrid;
