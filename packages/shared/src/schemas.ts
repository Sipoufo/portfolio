// schemas.ts
// Zod validators for the shared domain types. Consumed by the backend for
// input validation and by the admin frontend for form validation.

import { z } from 'zod';

export const langSchema = z.enum(['fr', 'en']);

export const localizedStringSchema = z.object({
  fr: z.string().min(1),
  en: z.string().min(1),
});

export const socialSchema = z.object({
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const profileInputSchema = z.object({
  name: z.string().min(1),
  title: localizedStringSchema,
  summary: localizedStringSchema,
  email: z.string().email(),
  phone: z.string().optional(),
  location: localizedStringSchema,
  socials: socialSchema.default({}),
});

export const experienceInputSchema = z.object({
  company: z.string().min(1),
  role: localizedStringSchema,
  location: localizedStringSchema,
  startDate: z.string().min(4),
  endDate: z.string().nullable(),
  current: z.boolean().default(false),
  bullets: z.array(localizedStringSchema).default([]),
  tech: z.array(z.string()).default([]),
  order: z.number().int().nonnegative().default(0),
});

export const projectInputSchema = z.object({
  name: z.string().min(1),
  role: localizedStringSchema,
  startDate: z.string().min(4),
  endDate: z.string().nullable(),
  description: localizedStringSchema,
  tech: z.array(z.string()).default([]),
  links: z
    .array(z.object({ label: z.string().min(1), url: z.string().url() }))
    .default([]),
  order: z.number().int().nonnegative().default(0),
});

export const skillCategorySchema = z.enum([
  'mobile',
  'backend',
  'frontend',
  'database',
  'devops',
  'management',
  'language',
]);

export const skillInputSchema = z.object({
  category: skillCategorySchema,
  name: z.string().min(1),
  level: z.number().int().min(0).max(100).optional(),
  order: z.number().int().nonnegative().default(0),
});

export const educationInputSchema = z.object({
  school: z.string().min(1),
  degree: localizedStringSchema,
  startDate: z.string().min(4),
  endDate: z.string().nullable(),
  location: localizedStringSchema,
  order: z.number().int().nonnegative().default(0),
});

export const interestInputSchema = z.object({
  label: localizedStringSchema,
  order: z.number().int().nonnegative().default(0),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type SkillInput = z.infer<typeof skillInputSchema>;
export type EducationInput = z.infer<typeof educationInputSchema>;
export type InterestInput = z.infer<typeof interestInputSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
