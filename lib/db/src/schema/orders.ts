import { pgTable, text, real, jsonb, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  orderId         : text("order_id").primaryKey(),
  paymentIntentId : text("payment_intent_id").notNull().unique(),
  customerEmail   : text("customer_email").notNull(),
  customerName    : text("customer_name").notNull(),
  address         : text("address").notNull().default(""),
  city            : text("city").notNull().default(""),
  postalCode      : text("postal_code").notNull().default(""),
  province        : text("province").notNull().default(""),
  country         : text("country").notNull().default("IT"),
  amount          : real("amount").notNull(),
  items           : jsonb("items").notNull().$type<string[]>().default([]),
  emails          : jsonb("emails").notNull().$type<EmailRecord[]>().default([]),
  createdAt       : timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface EmailRecord {
  day        : number;
  subject    : string;
  resendId   : string | null;
  status     : "sent" | "scheduled" | "failed";
  scheduledAt: string | null;
  sentAt     : string;
}
