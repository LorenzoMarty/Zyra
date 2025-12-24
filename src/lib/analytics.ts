export type AnalyticsEvent = {
  type:
    | "search_performed"
    | "product_viewed"
    | "add_to_cart"
    | "checkout_clicked"
    | "outbound_click";
  payload?: Record<string, unknown>;
  timestamp: number;
};

const STORAGE_KEY = "ml_events";

export function trackEvent(
  type: AnalyticsEvent["type"],
  payload?: AnalyticsEvent["payload"]
) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  const events = existing ? (JSON.parse(existing) as AnalyticsEvent[]) : [];
  events.push({ type, payload, timestamp: Date.now() });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

  if (typeof window.gtag === "function") {
    window.gtag("event", type, payload || {});
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", type, payload || {});
  }
}

export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") {
    return [];
  }
  const existing = window.localStorage.getItem(STORAGE_KEY);
  return existing ? (JSON.parse(existing) as AnalyticsEvent[]) : [];
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}
