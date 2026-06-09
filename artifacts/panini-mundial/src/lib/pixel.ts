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

const FB_PIXEL_ID = "1545212470581501";

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
  fbq("init", FB_PIXEL_ID);
  fbq("track", "PageView");
}

export function pixelViewContent(params: {
  content_ids: string[];
  content_name: string;
  value: number;
  currency: string;
}) {
  fbq("track", "ViewContent", {
    content_ids: params.content_ids,
    content_name: params.content_name,
    value: params.value,
    currency: params.currency,
    content_type: "product",
  });
  ttq("ViewContent", {
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
  fbq("track", "AddToCart", {
    content_ids: params.content_ids,
    content_name: params.content_name,
    value: params.value,
    currency: params.currency,
    content_type: "product",
  });
  ttq("AddToCart", {
    content_id: params.content_ids[0],
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
  fbq("track", "InitiateCheckout", {
    content_ids: params.content_ids,
    value: params.value,
    currency: params.currency,
    num_items: params.num_items,
    content_type: "product",
  });
  ttq("InitiateCheckout", {
    value: params.value,
    currency: params.currency,
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
    {
      content_ids: params.content_ids,
      value: params.value,
      currency: params.currency,
      num_items: params.num_items,
      content_type: "product",
    },
    eventID ? { eventID } : undefined
  );
  ttq("CompletePayment", {
    value: params.value,
    currency: params.currency,
  });
}

void ttq;
