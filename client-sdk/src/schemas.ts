/**
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

/**
 * Schema for validating base URL
 */
export const baseUrlSchema = z
  .url('Invalid base URL format')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Base URL must use http or https protocol');

/**
 * Schema for document ID
 */
export const documentIdSchema = z
  .string()
  .min(1, 'Document ID cannot be empty');

/**
 * Schema for version info in history
 */
export const versionInfoSchema = z.record(z.string(), z.any());

/**
 * Schema for document metadata response
 */
export const documentMetadataSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  updatedAt: z.string(),
  versions: z.array(versionInfoSchema),
});

/**
 * Schema for fetch options validation
 */
export const fetchOptionsSchema = z.object({
  baseUrl: baseUrlSchema,
  documentId: documentIdSchema,
  version: z.string().optional().default('main'),
});
