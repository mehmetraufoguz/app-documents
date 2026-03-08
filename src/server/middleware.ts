import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  })
  return session
}

export async function requireAuth() {
  const session = await getAuthSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

