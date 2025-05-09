'use client';

import { useEffect, useState } from 'react';

const ExtensionsGrid = () => {
  const [extensions, setExtensions] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/video');
        const data = await res.json();

        // Extract video URL from img[0]
        const formattedData = data.map((item, index) => ({
          id: item.id || index,
          video: item.img?.[0] || '',
          title: item.title || `Video ${index + 1}`,
        }));

        setExtensions(formattedData);
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 mb-10">
      <h1 className="text-center uppercase text-4xl mb-8">Our Videos</h1>
      <div className="grid grid-cols-1 gap-10">
        {extensions.map((extension) => (
          <div key={extension.id} className="w-full">
            <video
              src={extension.video}
              className="w-full h-auto max-h-[80vh] rounded-lg shadow-md"
              loop
              controls
            />
            <h2 className="mt-4 text-center text-lg font-semibold">{extension.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtensionsGrid;
