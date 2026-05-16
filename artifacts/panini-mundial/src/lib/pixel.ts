declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom" | "init",
      event: string,
      params?: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => void;
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

export function pixelPageView() {
  fbq("track", "PageView");
}

export function pixelViewContent(params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  fbq("track", "ViewContent", { ...params, content_type: "product" });
}

export function pixelAddToCart(params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  fbq("track", "AddToCart", { ...params, content_type: "product" });
}

export function pixelInitiateCheckout(params: {
  content_ids: string[];
  value: number;
  currency: string;
  num_items: number;
}) {
  fbq("track", "InitiateCheckout", { ...params, content_type: "product" });
}

export function pixelPurchase(
  params: {
    content_ids: string[];
    value: number;
    currency: string;
    num_items: number;
  },
  eventID?: string
) {
  fbq(
    "track",
    "Purchase",
    { ...params, content_type: "product" },
    eventID ? { eventID } : undefined
  );
}
