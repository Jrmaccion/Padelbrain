import { Dimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const getDeviceType = () => {
  const { width } = getScreenDimensions();
  
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
};

export const layout = {
  getPaddingHorizontal: () => {
    const deviceType = getDeviceType();
    switch (deviceType) {
      case 'desktop': return 32;
      case 'tablet': return 24;
      default: return 16;
    }
  },

  getMaxWidth: () => {
    const deviceType = getDeviceType();
    switch (deviceType) {
      case 'desktop': return 1200;
      case 'tablet': return 900;
      default: return '100%' as any;
    }
  },

  getGridColumns: () => {
    const deviceType = getDeviceType();
    switch (deviceType) {
      case 'desktop': return 3;
      case 'tablet': return 2;
      default: return 1;
    }
  },

  getGap: () => {
    const deviceType = getDeviceType();
    switch (deviceType) {
      case 'desktop': return 20;
      case 'tablet': return 16;
      default: return 12;
    }
  },

  isWeb: Platform.OS === 'web',
};

export function useResponsive() {
  const [deviceType, setDeviceType] = useState(getDeviceType());

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    if (Platform.OS === 'web') {
      const listener = () => handleResize();
      window.addEventListener('resize', listener);
      return () => window.removeEventListener('resize', listener);
    }
  }, []);

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    layout,
  };
}