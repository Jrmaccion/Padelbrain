import { z } from 'zod';
import { baseItemSchema, rating1to5Schema } from './common';

/**
 * Validation schema for match analysis
 */
const analysisSchema = z.object({
  strengths: z.string().max(500, 'Strengths too long').optional(),
  weaknesses: z.string().max(500, 'Weaknesses too long').optional(),
  tactics: z.string().max(500, 'Tactics too long').optional(),
  technical: rating1to5Schema.optional(),
  tactical: rating1to5Schema.optional(),
  physical: rating1to5Schema.optional(),
  mental: rating1to5Schema.optional(),
});

/**
 * Full validation schema for Match type
 */
export const matchSchema = baseItemSchema.extend({
  tournament: z.string().max(100, 'Tournament name too long').optional(),
  opponents: z
    .array(z.string().min(1, 'Opponent name cannot be empty'))
    .min(1, 'At least one opponent is required')
    .max(4, 'Maximum 4 opponents allowed'),
  result: z.enum(['won', 'lost']),
  score: z.string().max(50, 'Score too long').optional(),
  partner: z.string().max(100, 'Partner name too long').optional(),
  position: z.enum(['right', 'left']).optional(),
  analysis: analysisSchema.optional(),
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
