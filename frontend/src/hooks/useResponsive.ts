import { useState, useEffect } from 'react';

export interface ResponsiveInfo {
  isMobile: boolean;   // < 768px
  isTablet: boolean;   // 768~1023px
  isDesktop: boolean;  // >= 1024px
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveInfo => {
  const [info, setInfo] = useState<ResponsiveInfo>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const h = typeof window !== 'undefined' ? window.innerHeight : 1080;
    return { isMobile: w < 768, isTablet: w >= 768 && w < 1024, isDesktop: w >= 1024, width: w, height: h };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setInfo({ isMobile: w < 768, isTablet: w >= 768 && w < 1024, isDesktop: w >= 1024, width: w, height: h });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return info;
};
