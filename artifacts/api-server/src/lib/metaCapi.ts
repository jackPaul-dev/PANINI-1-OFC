import { createHash } from "crypto";

const PIXEL_ID = "1545212470581501";
const ACCESS_TOKEN = process.env.META_PIXEL_ACCESS_TOKEN ?? "";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function capiPurchase(params: {
  eventId: string;
  email: string;
  name?: string;
  amount: number;
  currency: string;
  contentIds: string[];
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
}): Promise<void> {
  if (!ACCESS_TOKEN) return;

  const nameParts = (params.name ?? "").trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        action_source: "website",
        event_source_url: params.sourceUrl ?? "https://paniniworldcup2026.site/checkout",
        user_data: {
          em: [sha256(params.email)],
          ...(firstName && { fn: [sha256(firstName)] }),
          ...(lastName && { ln: [sha256(lastName)] }),
          ...(params.clientIp && { client_ip_address: params.clientIp }),
          ...(params.userAgent && { client_user_agent: params.userAgent }),
        },
        custom_data: {
          currency: params.currency.toUpperCase(),
          value: params.amount,
          content_ids: params.contentIds,
          content_type: "product",
          num_items: params.contentIds.length,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.warn("Meta CAPI error:", text);
    }
  } catch (err) {
    console.warn("Meta CAPI request failed:", err);
  }
}
