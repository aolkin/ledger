import * as cuid2 from '@paralleldrive/cuid2'
import { Prisma, PrismaClient } from '@prisma/client'
import { inferAsyncReturnType, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { z } from 'zod'

const idLength = 16
const createId = cuid2.init({ length: idLength })

type Context = inferAsyncReturnType<() => { prisma: PrismaClient }>
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    if (error.cause instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.cause.code) {
        case 'P2025':
          return {
            ...shape,
            data: {
              ...shape.data,
              code: 'NOT_FOUND',
              httpStatus: 404,
            },
          }
      }
    }
    return shape
  },
})
// Define your data models using Zod for validation
const ObjectIdSchema = z.string().min(idLength).max(idLength)
const ColorSchema = z.string()
const LedgerMetaSchema = z.object({
  id: ObjectIdSchema,
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
})
const LedgerTemplateSchema = z.object({
  ledgerId: ObjectIdSchema,
  id: ObjectIdSchema,
  title: z.string(),
  value: z.number(),
  unit: z.string(),
  group: z.string(),
  color: ColorSchema.nullish(),
  notes: z.string().nullish(),
})
const LedgerEntrySchema = LedgerTemplateSchema.extend({
  multiplier: z.number(),
  timestamp: z.date().optional(),
})
// Partial update schemas
const LedgerIdSchema = z.object({ ledgerId: ObjectIdSchema })
const LedgerObjectIdsSchema = LedgerIdSchema.and(
  z.object({ id: ObjectIdSchema }),
)
const PartialLedgerMetaSchema = LedgerMetaSchema.partial().and(
  z.object({ id: ObjectIdSchema }),
)
const PartialLedgerTemplateSchema = LedgerTemplateSchema.partial().and(
  LedgerObjectIdsSchema,
)
const PartialLedgerEntrySchema = LedgerEntrySchema.partial().and(
  LedgerObjectIdsSchema,
)

// Define your tRPC procedures
export const appRouter = t.router({
  ledger: t.router({
    list: t.procedure.query(async ({ ctx }) =>
      ctx.prisma.ledgerMeta.findMany(),
    ),
    get: t.procedure.input(LedgerIdSchema).query(async ({ input, ctx }) =>
      ctx.prisma.ledgerMeta.findUniqueOrThrow({
        where: { id: input.ledgerId },
      }),
    ),
    create: t.procedure
      .input(LedgerMetaSchema.omit({ id: true }))
      .mutation(async ({ input, ctx }) =>
        ctx.prisma.ledgerMeta.create({
          data: { ...input, id: createId() },
        }),
      ),
    update: t.procedure
      .input(PartialLedgerMetaSchema)
      .mutation(async ({ input, ctx }) =>
        ctx.prisma.ledgerMeta.update({
          where: { id: input.id },
          data: input,
        }),
      ),
    delete: t.procedure
      .input(LedgerIdSchema)
      .mutation(async ({ input, ctx }) => {
        const ledger = await ctx.prisma.ledgerMeta.findUniqueOrThrow({
          where: { id: input.ledgerId },
          include: { templates: true, entries: true },
        })
        if (ledger.templates.length === 0 && ledger.entries.length === 0) {
          await ctx.prisma.updateLog.deleteMany({
            where: { ledgerId: input.ledgerId },
          })
        }
        return ctx.prisma.ledgerMeta.delete({ where: { id: input.ledgerId } })
      }),
  }),
  template: t.router({
    create: t.procedure
      .input(LedgerTemplateSchema.omit({ id: true }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.ledgerTemplate.create({
          data: {
            ...input,
            id: createId(),
            updates: {
              create: [
                {
                  ledgerId: input.ledgerId,
                  action: 'create',
                },
              ],
            },
          },
          // include: { updates: true },
        })
      }),

    getForLedger: t.procedure
      .input(LedgerIdSchema)
      .query(
        async ({ input, ctx }) =>
          await ctx.prisma.ledgerTemplate.findMany({ where: input }),
      ),

    // Partial update for LedgerTemplate
    update: t.procedure
      .input(PartialLedgerTemplateSchema)
      .mutation(async ({ input, ctx }) => {
        const { id, ledgerId, ...updateData } = input
        return await ctx.prisma.ledgerTemplate.update({
          where: { id, ledgerId },
          data: {
            ...updateData,
            updates: {
              create: [
                {
                  ledgerId,
                  action: 'update',
                },
              ],
            },
          },
          // include: { updates: true },
        })
      }),

    delete: t.procedure
      .input(LedgerObjectIdsSchema)
      .mutation(
        async ({ input, ctx }) =>
          await ctx.prisma.ledgerTemplate.delete({ where: input }),
      ),
  }),
  entry: t.router({
    // LedgerEntry procedures
    create: t.procedure
      .input(LedgerEntrySchema.omit({ id: true }))
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.ledgerEntry.create({
          data: {
            ...input,
            id: createId(),
            author: 'default',
            updates: {
              create: [
                {
                  ledgerId: input.ledgerId,
                  action: 'create',
                },
              ],
            },
          },
          // include: { updates: true },
        })
      }),

    getForLedger: t.procedure
      .input(LedgerIdSchema)
      .query(async ({ input, ctx }) => {
        return ctx.prisma.ledgerEntry.findMany({
          where: input,
        })
      }),

    // Partial update for LedgerEntry
    update: t.procedure
      .input(PartialLedgerEntrySchema)
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input
        return await ctx.prisma.ledgerEntry.update({
          where: { id },
          data: {
            ...updateData,
            updates: {
              create: [
                {
                  ledgerId: input.ledgerId,
                  action: 'update',
                },
              ],
            },
          },
          // include: { updates: true },
        })
      }),

    delete: t.procedure
      .input(LedgerObjectIdsSchema)
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.ledgerEntry.delete({ where: input })
      }),
  }),

  // Get updates since a given timestamp
  getUpdatesSince: t.procedure
    .input(z.object({ since: z.date() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.updateLog.findMany({
        where: {
          timestamp: {
            gt: input.since,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
        include: {
          ledgerTemplate: true,
          ledgerEntry: true,
        },
      })
    }),
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
