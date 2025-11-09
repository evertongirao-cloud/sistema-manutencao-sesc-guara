import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { sendNewTicketNotification, sendTicketConfirmation, sendStatusChangeNotification, sendRatingRequest } from "./email";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ TICKETS ============
  tickets: router({
    create: publicProcedure
      .input(z.object({
        requesterName: z.string().min(1, "Nome é obrigatório"),
        requesterEmail: z.string().email("E-mail inválido"),
        location: z.string().min(1, "Localidade é obrigatória"),
        problemType: z.enum(["eletrica", "hidraulica", "informatica", "limpeza", "estrutural", "outros"]),
        description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
        urgency: z.enum(["baixa", "media", "alta"]),
        imageData: z.string().optional(),
        imageMimeType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ticketNumber = await db.generateTicketNumber();
        let imageUrl: string | undefined;
        let imageKey: string | undefined;
        if (input.imageData && input.imageMimeType) {
          const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const extension = input.imageMimeType.split('/')[1];
          const fileName = `tickets/${ticketNumber}-${Date.now()}.${extension}`;
          const uploadResult = await storagePut(fileName, buffer, input.imageMimeType);
          imageUrl = uploadResult.url;
          imageKey = uploadResult.key;
        }
        await db.createTicket({
          ticketNumber,
          requesterName: input.requesterName,
          requesterEmail: input.requesterEmail,
          location: input.location,
          problemType: input.problemType,
          description: input.description,
          urgency: input.urgency,
          status: "aberto",
          imageUrl,
          imageKey,
        });
        const ticket = await db.getTicketByNumber(ticketNumber);
        if (ticket) {
          await db.addTicketHistory({
            ticketId: ticket.id,
            action: "created",
            description: "Chamado criado",
            performedBy: input.requesterName,
          });
          
          // Buscar e-mail do responsável se houver
          let responsibleEmail: string | null = null;
          if (ticket.technicianId) {
            const technician = await db.getTechnicianById(ticket.technicianId);
            responsibleEmail = technician?.email || null;
          }
          
          await sendNewTicketNotification({
            ticketNumber,
            requesterName: input.requesterName,
            requesterEmail: input.requesterEmail,
            location: input.location,
            problemType: input.problemType,
            description: input.description,
            urgency: input.urgency,
            imageUrl,
            responsibleEmail,
          });
          await sendTicketConfirmation({
            ticketNumber,
            requesterName: input.requesterName,
            requesterEmail: input.requesterEmail,
            location: input.location,
            problemType: input.problemType,
            description: input.description,
            urgency: input.urgency,
          });
        }
        return { ticketNumber, success: true };
      }),
    list: publicProcedure.query(async () => {
      return await db.getAllTickets();
    }),
    getByNumber: publicProcedure
      .input(z.object({ ticketNumber: z.string() }))
      .query(async ({ input }) => {
        return await db.getTicketByNumber(input.ticketNumber);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketById(input.id);
      }),
    listByStatus: publicProcedure
      .input(z.object({ status: z.enum(["aberto", "em_execucao", "finalizado"]) }))
      .query(async ({ input }) => {
        return await db.getTicketsByStatus(input.status);
      }),
    search: publicProcedure
      .input(z.object({
        status: z.string().optional(),
        problemType: z.string().optional(),
        urgency: z.string().optional(),
        location: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.searchTickets(input);
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["aberto", "em_execucao", "finalizado"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.id);
        if (!ticket) throw new Error("Chamado não encontrado");
        await db.updateTicket(input.id, { status: input.status });
        await db.addTicketHistory({
          ticketId: input.id,
          action: "status_changed",
          description: `Status alterado para: ${input.status}`,
          performedBy: ctx.user.name || ctx.user.email || "Administrador",
        });
        const technician = ticket.technicianId ? await db.getTechnicianById(ticket.technicianId) : null;
        await sendStatusChangeNotification({
          ticketNumber: ticket.ticketNumber,
          requesterEmail: ticket.requesterEmail,
          requesterName: ticket.requesterName,
          newStatus: input.status,
          notes: technician ? `Responsável: ${technician.name}` : undefined,
        });
        if (input.status === "finalizado") {
          await db.updateTicket(input.id, { completedAt: new Date() });
        }
        return { success: true };
      }),
    assignTechnician: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        technicianId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const technician = await db.getTechnicianById(input.technicianId);
        if (!technician) throw new Error("Responsável não encontrado");
        await db.updateTicket(input.ticketId, { technicianId: input.technicianId });
        await db.addTicketHistory({
          ticketId: input.ticketId,
          action: "technician_assigned",
          description: `Responsável designado: ${technician.name}`,
          performedBy: ctx.user.name || ctx.user.email || "Administrador",
        });
        return { success: true };
      }),
    addNotes: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        notes: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getTicketById(input.ticketId);
        const currentNotes = ticket?.notes || "";
        const timestamp = new Date().toLocaleString('pt-BR');
        const author = ctx.user.name || ctx.user.email || "Administrador";
        const newNotes = currentNotes 
          ? `${currentNotes}\n\n[${timestamp}] ${author}:\n${input.notes}`
          : `[${timestamp}] ${author}:\n${input.notes}`;
        await db.updateTicket(input.ticketId, { notes: newNotes });
        await db.addTicketHistory({
          ticketId: input.ticketId,
          action: "note_added",
          description: `Observação adicionada: ${input.notes.substring(0, 100)}...`,
          performedBy: author,
        });
        return { success: true };
      }),
    setEstimatedCompletion: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        estimatedCompletion: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateTicket(input.ticketId, { estimatedCompletion: input.estimatedCompletion });
        await db.addTicketHistory({
          ticketId: input.ticketId,
          action: "estimated_completion_set",
          description: `Previsão de conclusão definida para: ${input.estimatedCompletion.toLocaleDateString('pt-BR')}`,
          performedBy: ctx.user.name || ctx.user.email || "Administrador",
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTicket(input.id);
        return { success: true };
      }),
    getHistory: publicProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketHistory(input.ticketId);
      }),
    stats: publicProcedure.query(async () => {
      const tickets = await db.getAllTickets();
      const totalTickets = tickets.length;
      const completedTickets = tickets.filter(t => t.status === 'finalizado').length;
      const inProgressTickets = tickets.filter(t => t.status === 'em_execucao').length;
      const openTickets = tickets.filter(t => t.status === 'aberto').length;
      
      const completionRate = totalTickets > 0
        ? Math.round((completedTickets / totalTickets) * 100)
        : 0;
      
      return {
        totalTickets,
        completedTickets,
        inProgressTickets,
        openTickets,
        completionRate,
      };
    }),
  }),

  technicians: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTechnicians();
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        specialty: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createTechnician({
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          specialty: input.specialty || null,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        specialty: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateTechnician(id, updates);
        return { success: true };
      }),
    deactivate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deactivateTechnician(input.id);
        return { success: true };
      }),
  }),

  ratings: router({
    create: publicProcedure
      .input(z.object({
        ticketId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getRatingByTicketId(input.ticketId);
        if (existing) {
          throw new Error("Este chamado já foi avaliado");
        }
        await db.createRating({
          ticketId: input.ticketId,
          rating: input.rating,
          comment: input.comment || null,
        });
        return { success: true };
      }),
    getByTicket: publicProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRatingByTicketId(input.ticketId);
      }),
    list: protectedProcedure.query(async () => {
      return await db.getAllRatings();
    }),
    stats: publicProcedure.query(async () => {
      const ratings = await db.getAllRatings();
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;
      
      const recentRatings = ratings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      return {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        recentRatings,
      };
    }),
  }),

  settings: router({
    get: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSetting(input.key);
      }),
    set: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.setSetting(input.key, input.value, input.description);
        return { success: true };
      }),
    list: protectedProcedure.query(async () => {
      return await db.getAllSettings();
    }),
    testEmail: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const { sendEmail } = await import('./email');
        const result = await sendEmail({
          to: input.email,
          subject: 'Teste de E-mail - Sistema de Manutenção',
          html: '<h1>Teste de E-mail</h1><p>Este é um e-mail de teste do Sistema de Manutenção Sesc Guará.</p>',
        });
        return { success: result };
      }),
  }),
});

export type AppRouter = typeof appRouter;
