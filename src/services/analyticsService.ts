export function track(e: string, p?: Record<string, any>) {
  // Only log in development - replace with actual analytics service in production
  if (__DEV__) {
    console.log("[analytics]", e, p ?? {});
  }

  // TODO: Implement actual analytics service (Google Analytics, Mixpanel, etc.)
  // Example:
  // if (!__DEV__) {
  //   Analytics.logEvent(e, p);
  // }
}
