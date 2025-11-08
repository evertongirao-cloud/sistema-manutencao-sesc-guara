import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Responsáveis pela manutenção
 */
export const technicians = mysqlTable("technicians", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  specialty: varchar("specialty", { length: 100 }), // elétrica, hidráulica, etc.
  active: int("active").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = typeof technicians.$inferInsert;

/**
 * Chamados de manutenção
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(), // Número único do chamado
  requesterName: varchar("requesterName", { length: 255 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 320 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  problemType: mysqlEnum("problemType", [
    "eletrica",
    "hidraulica",
    "informatica",
    "limpeza",
    "estrutural",
    "outros"
  ]).notNull(),
  description: text("description").notNull(),
  urgency: mysqlEnum("urgency", ["baixa", "media", "alta"]).notNull(),
  status: mysqlEnum("status", ["aberto", "em_execucao", "finalizado"]).default("aberto").notNull(),
  imageUrl: text("imageUrl"), // URL da imagem no S3
  imageKey: text("imageKey"), // Chave da imagem no S3
  technicianId: int("technicianId"), // ID do responsável designado
  notes: text("notes"), // Observações e atualizações
  estimatedCompletion: timestamp("estimatedCompletion"), // Previsão de conclusão
  completedAt: timestamp("completedAt"), // Data de conclusão
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Avaliações pós-serviço
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(), // Referência ao chamado
  rating: int("rating").notNull(), // 1-5 estrelas
  comment: text("comment"), // Comentário opcional
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Histórico de atualizações dos chamados
 */
export const ticketHistory = mysqlTable("ticketHistory", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  action: varchar("action", { length: 255 }).notNull(), // "status_changed", "technician_assigned", "note_added", etc.
  description: text("description").notNull(),
  performedBy: varchar("performedBy", { length: 255 }), // Nome de quem realizou a ação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketHistory = typeof ticketHistory.$inferSelect;
export type InsertTicketHistory = typeof ticketHistory.$inferInsert;

/**
 * Configurações do sistema
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
