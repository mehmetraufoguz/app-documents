import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { magicLink } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '#/db/index'
import * as schema from '#/db/schema'
import { env } from '#/env.server'

const trustedProxies = env.TRUSTED_PROXIES
  ? env.TRUSTED_PROXIES.split(',').map((s) => s.trim()).filter(Boolean)
  : undefined

export const auth = betterAuth({
  ...(trustedProxies && { trustedProxies }),
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`[magic-link] To: ${email}\nURL: ${url}`)
      },
    }),
    tanstackStartCookies(),
  ],
})
