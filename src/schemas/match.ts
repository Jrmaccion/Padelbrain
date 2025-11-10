import { z } from 'zod';
import { baseItemSchema, rating1to5Schema } from './common';

/**
 * Full validation schema for Match type
 */
export const matchSchema = baseItemSchema.extend({
  tournament: z.string().max(100, 'Tournament name too long').optional(),
  category: z.string().max(100, 'Category too long').optional(),
  round: z.string().max(100, 'Round too long').optional(),
  courtType: z.enum(['interior', 'exterior']).optional(),
  opponents: z
    .object({
      right: z.string().max(100).optional(),
      left: z.string().max(100).optional(),
    })
    .optional(),
  result: z
    .object({
      outcome: z.enum(['won', 'lost']),
      score: z.string().max(50).optional(),
      durationMin: z.number().optional(),
    })
    .optional(),
  partner: z.string().max(100, 'Partner name too long').optional(),
  position: z.enum(['right', 'left']).optional(),
  plan: z.string().max(1000).optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  analysis: z
    .object({
      attack: z.string().max(1000).optional(),
      defense: z.string().max(1000).optional(),
      transitions: z.string().max(1000).optional(),
    })
    .optional(),
  ratings: z
    .object({
      technical: rating1to5Schema.optional(),
      tactical: rating1to5Schema.optional(),
      mental: rating1to5Schema.optional(),
      physical: rating1to5Schema.optional(),
    })
    .optional(),
  reflections: z
    .object({
      learned: z.string().max(1000).optional(),
      diffNextTime: z.string().max(1000).optional(),
    })
    .optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * Schema for match creation (without id)
 */
export const createMatchSchema = matchSchema.omit({ id: true });

/**
 * Schema for match updates (all fields optional except id)
 */
export const updateMatchSchema = matchSchema.partial().required({ id: true });

export type MatchInput = z.infer<typeof createMatchSchema>;
export type MatchUpdate = z.infer<typeof updateMatchSchema>;
