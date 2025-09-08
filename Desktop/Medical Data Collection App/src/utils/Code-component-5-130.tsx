// Mobile utility functions for better UX on mobile devices

/**
 * Prevents zoom on input focus for iOS devices
 */
export const preventIOSZoom = () => {
  if (typeof document !== 'undefined') {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    } else {
      const newViewport = document.createElement('meta');
      newViewport.name = 'viewport';
      newViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(newViewport);
    }
  }
};

/**
 * Restores normal zoom behavior
 */
export const restoreIOSZoom = () => {
  if (typeof document !== 'undefined') {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0'
      );
    }
  }
};

/**
 * Detects if device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

/**
 * Detects if device is iOS
 */
export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detects if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Gets safe area insets for devices with notches/safe areas
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0')
  };
};

/**
 * Prevents body scroll (useful for modals)
 */
export const disableBodyScroll = () => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
    // Prevent iOS rubber band scrolling
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }
};

/**
 * Re-enables body scroll
 */
export const enableBodyScroll = () => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  }
};

/**
 * Adds haptic feedback on supported devices
 */
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    // Simple vibration fallback
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };
    navigator.vibrate(patterns[type]);
  }
};

/**
 * Smoothly scrolls to an element, accounting for sticky headers
 */
export const smoothScrollToElement = (
  elementId: string, 
  offset: number = 80
) => {
  if (typeof document !== 'undefined') {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }
};

/**
 * Sets up mobile-optimized input behavior
 */
export const setupMobileInputs = () => {
  if (typeof document !== 'undefined' && isIOS()) {
    // Add event listeners to inputs to prevent zoom
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('focus', preventIOSZoom);
      input.addEventListener('blur', restoreIOSZoom);
    });
  }
};

/**
 * Creates a debounced function for resize events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default {
  preventIOSZoom,
  restoreIOSZoom,
  isMobile,
  isIOS,
  isTouchDevice,
  getSafeAreaInsets,
  disableBodyScroll,
  enableBodyScroll,
  hapticFeedback,
  smoothScrollToElement,
  setupMobileInputs,
  debounce
};