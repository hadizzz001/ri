"use client"
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GifLoader = () => {
  const [showGif, setShowGif] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Shop page needs more time to load data
    const isShopPage = pathname === '/shop';
    const timeout = isShopPage ? 4000 : 2000;

    const timeoutId = setTimeout(() => {
      setShowGif(false);
    }, timeout);

    // Cleanup the timeout when the component unmounts
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return (
    
    <>
      {showGif && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex:"9999999999"
          }}
        >
          <div
            style={{
              width:"5em",
              zIndex:"9999999999"
            }}
          >
            <img src="/load.gif" alt="Loading" />
          </div>
        </div>
      )}
    </>

  );
};

export default GifLoader;
