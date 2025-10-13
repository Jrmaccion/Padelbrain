import { z } from 'zod';

// Rating schema
export const rating1to5Schema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5)
]);

// Base item schema
export const baseItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  date: z.string().min(1, 'Date is required').refine((val) => {
    return !isNaN(Date.parse(val));
  }, 'Date must be a valid ISO date string'),
  location: z.string().optional(),
  notes: z.string().optional(),
  sleep: rating1to5Schema.optional(),
  energy: rating1to5Schema.optional(),
  nutrition: rating1to5Schema.optional(),
  health: rating1to5Schema.optional(),
  stress: rating1to5Schema.optional(),
  time: z.string().optional(),
  weather: z.string().optional()
});

// Match schema
export const matchSchema = baseItemSchema.extend({
  tournament: z.string().optional(),
  category: z.string().optional(),
  round: z.string().optional(),
  courtType: z.enum(['interior', 'exterior']).optional(),
  opponents: z.object({
    right: z.string().optional(),
    left: z.string().optional()
  }).optional(),
  result: z.object({
    outcome: z.enum(['won', 'lost']),
    score: z.string().optional(),
    durationMin: z.number().positive().optional()
  }).optional(),
  partner: z.string().optional(),
  position: z.enum(['right', 'left']).optional(),
  plan: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  analysis: z.object({
    attack: z.string().optional(),
    defense: z.string().optional(),
    transitions: z.string().optional()
  }).optional(),
  ratings: z.object({
    technical: rating1to5Schema.optional(),
    tactical: rating1to5Schema.optional(),
    mental: rating1to5Schema.optional(),
    physical: rating1to5Schema.optional()
  }).optional(),
  reflections: z.object({
    learned: z.string().optional(),
    diffNextTime: z.string().optional()
  }).optional(),
  keywords: z.array(z.string()).optional()
});

// Training schema
export const trainingSchema = baseItemSchema.extend({
  coach: z.string().optional(),
  goals: z.array(z.string()).optional(),
  postReview: z.object({
    technical: rating1to5Schema.optional(),
    tactical: rating1to5Schema.optional(),
    mental: rating1to5Schema.optional(),
    physical: rating1to5Schema.optional(),
    learned: z.string().optional(),
    improveNext: z.string().optional()
  }).optional(),
  trainingPartners: z.array(z.string()).optional()
});

// Type exports
export type Rating1to5 = z.infer<typeof rating1to5Schema>;
export type BaseItem = z.infer<typeof baseItemSchema>;
export type Match = z.infer<typeof matchSchema>;
export type Training = z.infer<typeof trainingSchema>;

// Validation helper functions
export const validateMatch = (data: unknown) => {
  return matchSchema.safeParse(data);
};

export const validateTraining = (data: unknown) => {
  return trainingSchema.safeParse(data);
};
