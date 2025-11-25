
/**
 * Analytics Service
 * Handles event tracking for user interactions.
 * Currently logs to console. To enable Google Analytics:
 * 1. Uncomment the script in index.html
 * 2. Add your Measurement ID there.
 */

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  // 1. Log to console for immediate verification during development
  console.log(`📊 [Analytics] ${eventName}:`, params);

  // 2. Send to Google Analytics if initialized
  const w = window as any;
  if (typeof w !== 'undefined' && w.gtag) {
    w.gtag('event', eventName, params);
  }
};
