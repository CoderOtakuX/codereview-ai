import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").unique().notNull(),
	passwordHash: text("password_hash").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const reviewsTable = pgTable("reviews", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => usersTable.id),
	code: text("code").notNull(),
	language: text("language").notNull(),
	filename: text("filename"),
	status: text("status").default("pending"),
	result: jsonb("result"),
	createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Review = typeof reviewsTable.$inferSelect;
export type NewReview = typeof reviewsTable.$inferInsert;
