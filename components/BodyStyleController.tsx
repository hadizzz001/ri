// app/components/BodyStyleController.tsx or .jsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const BodyStyleController = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (pathname === '/') {
        document.body.classList.add('home-page');
      } else {
        document.body.classList.remove('home-page');
      }
    }
  }, [pathname]);

  return null;
};

export default BodyStyleController;
