import { db, ordersTable } from "@workspace/db";
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

export async function createOrder(
  data: Omit<Order, "orderId" | "createdAt" | "emails">
): Promise<Order> {
  const orderId = generateOrderId();
  const [row] = await db.insert(ordersTable).values({
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

export async function getOrder(orderId: string): Promise<Order | undefined> {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderId, orderId))
    .limit(1);
  return row ? rowToOrder(row) : undefined;
}

export async function getOrderByPaymentIntent(piId: string): Promise<Order | undefined> {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.paymentIntentId, piId))
    .limit(1);
  return row ? rowToOrder(row) : undefined;
}

export async function getOrderByEmail(email: string): Promise<Order | undefined> {
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.customerEmail, email.toLowerCase()))
    .limit(1);
  return row ? rowToOrder(row) : undefined;
}

export async function listOrders(): Promise<Order[]> {
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);
  return rows.map(rowToOrder).reverse();
}

/* Upsert: insert order with a specific ID (used for test / demo orders) */
export async function upsertOrderById(
  data: Omit<Order, "createdAt" | "emails"> & { createdAt?: string }
): Promise<Order> {
  const existing = await getOrder(data.orderId);
  if (existing) return existing;
  const [row] = await db.insert(ordersTable).values({
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

export async function addEmailRecord(
  orderId: string,
  record: import("@workspace/db").EmailRecord
): Promise<void> {
  const existing = await getOrder(orderId);
  if (!existing) return;
  const updated = [...existing.emails, record];
  await db
    .update(ordersTable)
    .set({ emails: updated })
    .where(eq(ordersTable.orderId, orderId));
}
