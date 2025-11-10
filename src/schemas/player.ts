/**
 * Player validation schemas
 */

import { z } from 'zod';

/**
 * Player schema
 */
export const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'El nombre es obligatorio'),
  type: z.enum(['rival', 'partner', 'both']),
  notes: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.string(),
  lastPlayedAt: z.string().optional(),
  preferredPosition: z.enum(['right', 'left']).optional(),
  playStyle: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
});

/**
 * Player stats schema
 */
export const playerStatsSchema = z.object({
  playerId: z.string(),
  totalMatches: z.number(),
  matchesAgainst: z.number(),
  winsAgainst: z.number(),
  lossesAgainst: z.number(),
  winRateAgainst: z.number(),
  matchesWith: z.number(),
  winsWith: z.number(),
  lossesWith: z.number(),
  winRateWith: z.number(),
  lastFiveResults: z.array(z.enum(['won', 'lost'])).optional(),
  recentForm: z.enum(['hot', 'cold', 'neutral']).optional(),
});

export type PlayerInput = z.infer<typeof playerSchema>;
export type PlayerStatsInput = z.infer<typeof playerStatsSchema>;
