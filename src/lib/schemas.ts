import { z } from 'zod'

export const DOCUMENT_SLUGS = [
  'tos',
  'privacy',
  'eula',
  'user-agreement',
  'licenses',
] as const

export const createDocumentSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  content: z.string().min(1),
  commitMessage: z.string().min(1).max(200).default('Add document'),
})

export const updateDocumentSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  commitMessage: z.string().min(1).max(200).default('Update document'),
})

export const documentIdSchema = z.object({
  documentId: z.string().min(1),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
