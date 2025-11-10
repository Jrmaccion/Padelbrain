import { z } from 'zod';

/**
 * Validation schema for UserProfile
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre demasiado largo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  avatar: z.string().max(50).optional(),
  createdAt: z.string().datetime(),
  lastSyncAt: z.string().datetime().optional(),
  deviceId: z.string().optional(),
});

/**
 * Schema for creating a new user profile
 */
export const createUserProfileSchema = userProfileSchema.omit({
  id: true,
  createdAt: true,
});

/**
 * Schema for sync metadata
 */
export const syncMetadataSchema = z.object({
  version: z.string(),
  exportDate: z.string().datetime(),
  deviceId: z.string(),
  userId: z.string().uuid(),
  dataCount: z.object({
    matches: z.number().min(0),
    trainings: z.number().min(0),
  }),
  dataHash: z.string().optional(),
});

export type UserProfileInput = z.infer<typeof createUserProfileSchema>;
