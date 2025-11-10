import { z } from 'zod';
import { baseItemSchema, rating1to5Schema } from './common';

/**
 * Validation schema for training post-review
 */
const postReviewSchema = z.object({
  technical: rating1to5Schema.optional(),
  tactical: rating1to5Schema.optional(),
  physical: rating1to5Schema.optional(),
  mental: rating1to5Schema.optional(),
  overall: rating1to5Schema.optional(),
});

/**
 * Full validation schema for Training type
 */
export const trainingSchema = baseItemSchema.extend({
  coach: z.string().max(100, 'Coach name too long').optional(),
  goals: z.string().max(500, 'Goals too long').optional(),
  trainingPartners: z
    .array(z.string().min(1, 'Partner name cannot be empty'))
    .max(10, 'Maximum 10 training partners allowed')
    .optional(),
  postReview: postReviewSchema.optional(),
});

/**
 * Schema for training creation (without id)
 */
export const createTrainingSchema = trainingSchema.omit({ id: true });

/**
 * Schema for training updates (all fields optional except id)
 */
export const updateTrainingSchema = trainingSchema.partial().required({ id: true });

export type TrainingInput = z.infer<typeof createTrainingSchema>;
export type TrainingUpdate = z.infer<typeof updateTrainingSchema>;
