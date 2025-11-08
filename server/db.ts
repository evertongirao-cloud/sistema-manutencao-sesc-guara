import { eq, desc, and, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tickets, technicians, ratings, ticketHistory, settings, InsertTicket, InsertTechnician, InsertRating, InsertTicketHistory, InsertSetting } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ TICKETS ============

/**
 * Gera um número único de chamado (formato: YYYYMMDD-XXXX)
 */
export async function generateTicketNumber(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Busca o último chamado do dia
  const lastTicket = await db
    .select()
    .from(tickets)
    .where(like(tickets.ticketNumber, `${datePrefix}-%`))
    .orderBy(desc(tickets.ticketNumber))
    .limit(1);

  let sequence = 1;
  if (lastTicket.length > 0) {
    const lastNumber = lastTicket[0].ticketNumber.split('-')[1];
    sequence = parseInt(lastNumber) + 1;
  }

  return `${datePrefix}-${sequence.toString().padStart(4, '0')}`;
}

export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tickets).values(ticket);
  return result;
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTicketByNumber(ticketNumber: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByStatus(status: "aberto" | "em_execucao" | "finalizado") {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tickets).where(eq(tickets.status, status)).orderBy(desc(tickets.createdAt));
}

export async function updateTicket(id: number, updates: Partial<InsertTicket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(tickets).set(updates).where(eq(tickets.id, id));
}

export async function deleteTicket(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(tickets).where(eq(tickets.id, id));
}

export async function searchTickets(filters: {
  status?: string;
  problemType?: string;
  urgency?: string;
  location?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters.status) {
    conditions.push(eq(tickets.status, filters.status as any));
  }
  if (filters.problemType) {
    conditions.push(eq(tickets.problemType, filters.problemType as any));
  }
  if (filters.urgency) {
    conditions.push(eq(tickets.urgency, filters.urgency as any));
  }
  if (filters.location) {
    conditions.push(like(tickets.location, `%${filters.location}%`));
  }
  if (filters.search) {
    conditions.push(
      or(
        like(tickets.ticketNumber, `%${filters.search}%`),
        like(tickets.requesterName, `%${filters.search}%`),
        like(tickets.description, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length === 0) {
    return await getAllTickets();
  }

  return await db
    .select()
    .from(tickets)
    .where(and(...conditions))
    .orderBy(desc(tickets.createdAt));
}

// ============ TECHNICIANS ============

export async function createTechnician(technician: InsertTechnician) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(technicians).values(technician);
}

export async function getAllTechnicians() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(technicians).where(eq(technicians.active, 1)).orderBy(technicians.name);
}

export async function getTechnicianById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(technicians).where(eq(technicians.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTechnician(id: number, updates: Partial<InsertTechnician>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(technicians).set(updates).where(eq(technicians.id, id));
}

export async function deactivateTechnician(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(technicians).set({ active: 0 }).where(eq(technicians.id, id));
}

// ============ RATINGS ============

export async function createRating(rating: InsertRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(ratings).values(rating);
}

export async function getRatingByTicketId(ticketId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(ratings).where(eq(ratings.ticketId, ticketId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllRatings() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(ratings).orderBy(desc(ratings.createdAt));
}

// ============ TICKET HISTORY ============

export async function addTicketHistory(history: InsertTicketHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(ticketHistory).values(history);
}

export async function getTicketHistory(ticketId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(ticketHistory)
    .where(eq(ticketHistory.ticketId, ticketId))
    .orderBy(desc(ticketHistory.createdAt));
}

// ============ SETTINGS ============

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function setSetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSetting(key);
  
  if (existing) {
    return await db.update(settings).set({ value, description }).where(eq(settings.key, key));
  } else {
    return await db.insert(settings).values({ key, value, description });
  }
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(settings);
}

export async function getNotificationEmail(): Promise<string> {
  const setting = await getSetting('notification_email');
  return setting?.value || process.env.NOTIFICATION_EMAIL || '';
}
