'use client';
import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';

const NewsTicker = () => {
  const [titles, setTitles] = useState([]);

  const fetchTitles = async () => {
    try {
      const response = await fetch('api/service');
      const data = await response.json();
      const titlesOnly = data.map(item => item.title);
      setTitles(titlesOnly);
    } catch (error) {
      console.error('Error fetching titles:', error);
    }
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  return (
    <div className="w-full py-2 mt-10">
      <Marquee speed={80} gradient={false}>
        {titles.map((title, index) => (
          <h1 key={index} className="mx-6 font-bold" style={{fontSize: '5em'}}>
            {title}
          </h1>
        ))}
      </Marquee>
    </div>
  );
};

export default NewsTicker;
