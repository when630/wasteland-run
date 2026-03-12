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
    // 높이 500px 미만이면 가로 모드 모바일로 판정
    const isMobile = w < 768 || h < 500;
    return { isMobile, isTablet: !isMobile && w < 1024, isDesktop: w >= 1024 && h >= 500, width: w, height: h };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768 || h < 500;
      setInfo({ isMobile, isTablet: !isMobile && w < 1024, isDesktop: w >= 1024 && h >= 500, width: w, height: h });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return info;
};
