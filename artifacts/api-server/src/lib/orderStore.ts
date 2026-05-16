/**
 * Hybrid order store:
 *   - Uses PostgreSQL (Drizzle) when DATABASE_URL is set (production with DB)
 *   - Falls back to in-memory Map when DATABASE_URL is not set (Heroku without DB addon)
 */
import { db as dbConnection, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type { EmailRecord } from "@workspace/db";

export interface Order {
  orderId         : string;
  paymentIntentId : string;
  customerEmail   : string;
  customerName    : string;
  address         : string;
  city            : string;
  postalCode      : string;
  province        : string;
  country         : string;
  amount          : number;
  items           : string[];
  createdAt       : string;
  emails          : import("@workspace/db").EmailRecord[];
}

/* ── In-memory fallback ── */
const memOrders          = new Map<string, Order>();
const memByPaymentIntent = new Map<string, string>();

const useDb = dbConnection !== null;

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "PAN-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function rowToOrder(row: typeof ordersTable.$inferSelect): Order {
  return {
    orderId         : row.orderId,
    paymentIntentId : row.paymentIntentId,
    customerEmail   : row.customerEmail,
    customerName    : row.customerName,
    address         : row.address,
    city            : row.city,
    postalCode      : row.postalCode,
    province        : row.province,
    country         : row.country,
    amount          : row.amount,
    items           : row.items as string[],
    createdAt       : row.createdAt.toISOString(),
    emails          : (row.emails ?? []) as import("@workspace/db").EmailRecord[],
  };
}

/* ── createOrder ── */
export async function createOrder(
  data: Omit<Order, "orderId" | "createdAt" | "emails">
): Promise<Order> {
  const orderId = generateOrderId();

  if (useDb && dbConnection) {
    const [row] = await dbConnection.insert(ordersTable).values({
      orderId,
      paymentIntentId : data.paymentIntentId,
      customerEmail   : data.customerEmail,
      customerName    : data.customerName,
      address         : data.address ?? "",
      city            : data.city ?? "",
      postalCode      : data.postalCode ?? "",
      province        : data.province ?? "",
      country         : data.country ?? "IT",
      amount          : data.amount,
      items           : data.items ?? [],
      emails          : [],
    }).returning();
    return rowToOrder(row);
  }

  /* In-memory fallback */
  const order: Order = {
    ...data,
    orderId,
    createdAt: new Date().toISOString(),
    emails   : [],
  };
  memOrders.set(orderId, order);
  memByPaymentIntent.set(data.paymentIntentId, orderId);
  return order;
}

/* ── upsertOrderById (test / demo orders with known ID) ── */
export async function upsertOrderById(
  data: Omit<Order, "createdAt" | "emails"> & { createdAt?: string }
): Promise<Order> {
  const existing = await getOrder(data.orderId);
  if (existing) return existing;

  if (useDb && dbConnection) {
    const [row] = await dbConnection.insert(ordersTable).values({
      orderId         : data.orderId,
      paymentIntentId : data.paymentIntentId,
      customerEmail   : data.customerEmail,
      customerName    : data.customerName,
      address         : data.address ?? "",
      city            : data.city ?? "",
      postalCode      : data.postalCode ?? "",
      province        : data.province ?? "",
      country         : data.country ?? "IT",
      amount          : data.amount,
      items           : data.items ?? [],
      emails          : [],
      createdAt       : data.createdAt ? new Date(data.createdAt) : new Date(),
    }).returning();
    return rowToOrder(row);
  }

  /* In-memory fallback */
  const order: Order = {
    ...data,
    createdAt: data.createdAt ?? new Date().toISOString(),
    emails   : [],
  };
  memOrders.set(data.orderId, order);
  memByPaymentIntent.set(data.paymentIntentId, data.orderId);
  return order;
}

/* ── getOrder ── */
export async function getOrder(orderId: string): Promise<Order | undefined> {
  if (useDb && dbConnection) {
    const [row] = await dbConnection
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.orderId, orderId))
      .limit(1);
    return row ? rowToOrder(row) : undefined;
  }
  return memOrders.get(orderId);
}

/* ── getOrderByPaymentIntent ── */
export async function getOrderByPaymentIntent(piId: string): Promise<Order | undefined> {
  if (useDb && dbConnection) {
    const [row] = await dbConnection
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.paymentIntentId, piId))
      .limit(1);
    return row ? rowToOrder(row) : undefined;
  }
  const id = memByPaymentIntent.get(piId);
  return id ? memOrders.get(id) : undefined;
}

/* ── listOrders ── */
export async function listOrders(): Promise<Order[]> {
  if (useDb && dbConnection) {
    const rows = await dbConnection
      .select()
      .from(ordersTable)
      .orderBy(ordersTable.createdAt);
    return rows.map(rowToOrder).reverse();
  }
  return Array.from(memOrders.values()).reverse();
}

/* ── addEmailRecord ── */
export async function addEmailRecord(
  orderId: string,
  record: import("@workspace/db").EmailRecord
): Promise<void> {
  if (useDb && dbConnection) {
    const existing = await getOrder(orderId);
    if (!existing) return;
    await dbConnection
      .update(ordersTable)
      .set({ emails: [...existing.emails, record] })
      .where(eq(ordersTable.orderId, orderId));
    return;
  }
  const order = memOrders.get(orderId);
  if (order) order.emails.push(record);
}
