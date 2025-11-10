import { z } from 'zod';

/**
 * Validation schema for Rating1to5 type
 */
export const rating1to5Schema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

/**
 * Validation schema for wellness ratings
 */
export const wellnessSchema = z.object({
  energy: rating1to5Schema,
  stress: rating1to5Schema,
  sleep: rating1to5Schema,
  motivation: rating1to5Schema,
});

/**
 * Validation schema for BaseItem fields
 */
export const baseItemSchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  location: z.string().min(1, 'Location is required').max(100, 'Location too long'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  wellness: wellnessSchema,
});
