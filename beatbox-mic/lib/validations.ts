/**
 * Validation Schemas (Zod)
 *
 * Type-safe input validation for:
 * - Authentication (login, signup, password reset)
 * - File uploads (audio files)
 * - Preset creation/editing
 * - Comments
 */

import { z } from 'zod';

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const passwordResetSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

export const audioUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
    .refine(
      (file) =>
        ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'].includes(file.type),
      'File must be MP3, WAV, OGG, or M4A format'
    ),
  filename: z
    .string()
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Filename contains invalid characters')
    .optional(),
});

// =============================================================================
// PRESET SCHEMAS
// =============================================================================

export const presetCreateSchema = z.object({
  name: z
    .string()
    .min(3, 'Preset name must be at least 3 characters')
    .max(100, 'Preset name must be at most 100 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Preset name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  isPublic: z.boolean().default(false),
});

export const presetUpdateSchema = presetCreateSchema.partial();

// =============================================================================
// COMMENT SCHEMAS
// =============================================================================

export const commentCreateSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be at most 500 characters'),
  presetId: z.string().cuid(),
  parentId: z.string().cuid().optional(),
});

export const commentUpdateSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be at most 500 characters'),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type AudioUploadInput = z.infer<typeof audioUploadSchema>;
export type PresetCreateInput = z.infer<typeof presetCreateSchema>;
export type PresetUpdateInput = z.infer<typeof presetUpdateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;
