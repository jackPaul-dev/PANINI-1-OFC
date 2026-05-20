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
  fbq("track", "PageView");
}

export function pixelViewContent(params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  fbq("track", "ViewContent", { ...params, content_type: "product" });
  ttq("ViewContent", {
    content_type: "product",
    content_id: params.content_ids[0],
    content_name: params.content_name,
    value: params.value,
    currency: params.currency,
  });
}

export function pixelAddToCart(params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  fbq("track", "AddToCart", { ...params, content_type: "product" });
  ttq("AddToCart", {
    content_type: "product",
    content_id: params.content_ids[0],
    content_name: params.content_name,
    value: params.value,
    currency: params.currency,
  });
}

export function pixelInitiateCheckout(params: {
  content_ids: string[];
  value: number;
  currency: string;
  num_items: number;
}) {
  fbq("track", "InitiateCheckout", { ...params, content_type: "product" });
  ttq("InitiateCheckout", {
    content_type: "product",
    content_id: params.content_ids[0],
    value: params.value,
    currency: params.currency,
    quantity: params.num_items,
  });
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
  ttq("CompletePayment", {
    content_type: "product",
    content_id: params.content_ids[0],
    value: params.value,
    currency: params.currency,
    quantity: params.num_items,
    order_id: eventID,
  });
}
