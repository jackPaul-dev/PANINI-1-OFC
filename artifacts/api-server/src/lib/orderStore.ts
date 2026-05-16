export interface EmailRecord {
  day: number;
  subject: string;
  resendId: string | null;
  status: "sent" | "scheduled" | "failed";
  scheduledAt: string | null;
  sentAt: string;
}

export interface Order {
  orderId: string;
  paymentIntentId: string;
  customerEmail: string;
  customerName: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  amount: number;
  items: string[];
  createdAt: string;
  emails: EmailRecord[];
}

const orders = new Map<string, Order>();
const byPaymentIntent = new Map<string, string>();
const byEmail = new Map<string, string>();

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "PAN-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function createOrder(data: Omit<Order, "orderId" | "createdAt" | "emails">): Order {
  const orderId = generateOrderId();
  const order: Order = {
    ...data,
    orderId,
    createdAt: new Date().toISOString(),
    emails: [],
  };
  orders.set(orderId, order);
  if (data.paymentIntentId) byPaymentIntent.set(data.paymentIntentId, orderId);
  byEmail.set(data.customerEmail.toLowerCase(), orderId);
  return order;
}

export function upsertOrder(data: Omit<Order, "emails"> & { emails?: EmailRecord[] }): Order {
  const existing = orders.get(data.orderId);
  if (existing) {
    const updated = { ...existing, ...data, emails: data.emails ?? existing.emails };
    orders.set(data.orderId, updated);
    return updated;
  }
  const order: Order = { ...data, emails: data.emails ?? [] };
  orders.set(data.orderId, order);
  if (data.paymentIntentId) byPaymentIntent.set(data.paymentIntentId, data.orderId);
  byEmail.set(data.customerEmail.toLowerCase(), data.orderId);
  return order;
}

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}

export function getOrderByPaymentIntent(piId: string): Order | undefined {
  const id = byPaymentIntent.get(piId);
  return id ? orders.get(id) : undefined;
}

export function getOrderByEmail(email: string): Order | undefined {
  const id = byEmail.get(email.toLowerCase());
  return id ? orders.get(id) : undefined;
}

export function listOrders(): Order[] {
  return Array.from(orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addEmailRecord(orderId: string, record: EmailRecord): void {
  const order = orders.get(orderId);
  if (order) {
    order.emails.push(record);
  }
}
