declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom" | "init",
      event: string,
      params?: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

function fbq(
  action: "track" | "trackCustom" | "init",
  event: string,
  params?: Record<string, unknown>,
  options?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(action, event, params, options);
  }
}

function ttq(event: string, params?: Record<string, unknown>) {
  try {
    const t = (window as any).ttq;
    if (t && typeof t.track === "function") {
      t.track(event, params);
    }
  } catch (_) {}
}

export function pixelPageView() {
  // pixels not configured
}

export function pixelViewContent(_params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  // pixels not configured
}

export function pixelAddToCart(_params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  // pixels not configured
}

export function pixelInitiateCheckout(_params: {
  content_ids: string[];
  value: number;
  currency: string;
  num_items: number;
}) {
  // pixels not configured
}

export function pixelPurchase(
  _params: {
    content_ids: string[];
    value: number;
    currency: string;
    num_items: number;
  },
  _eventID?: string
) {
  // pixels not configured
}

// suppress unused warning — helpers kept for when pixels are re-added
void fbq;
void ttq;
