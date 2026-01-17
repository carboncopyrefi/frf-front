import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.PROD && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);
}

export function trackEvent(action: string, params?: Record<string, any>) {
  if (import.meta.env.PROD && window.gtag) {
    window.gtag("event", action, params);
  }
}