import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DOCS_REPO_PATH: z.string().min(1, 'DOCS_REPO_PATH is required'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
  // Comma-separated list of trusted proxy IPs/CIDRs (e.g. "172.16.0.0/12" for Docker networks)
  TRUSTED_PROXIES: z.string().optional(),
})

export const env = envSchema.parse(process.env)
