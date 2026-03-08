import { createServerFn } from '@tanstack/react-start'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '#/db/index'
import { documents } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  readDocumentAtVersion,
  writeAndCommit,
  getDocumentHistory,
} from '#/server/git/repository'
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdSchema,
} from '#/lib/schemas'

// --- Public functions ---

export const getDocument = createServerFn({ method: 'GET' })
  .inputValidator((input: { documentId: string }) => documentIdSchema.parse(input))
  .handler(async ({ data }) => {
    const rows = await db.select().from(documents).where(eq(documents.id, data.documentId))
    return rows[0] ?? null
  })

export const getDocumentWithHistory = createServerFn({ method: 'GET' })
  .inputValidator((input: { documentId: string }) => documentIdSchema.parse(input))
  .handler(async ({ data }) => {
    const rows = await db.select().from(documents).where(eq(documents.id, data.documentId))
    const doc = rows[0]
    if (!doc) return null

    const versions = await getDocumentHistory(doc.filePath, 5)
    return { ...doc, versions }
  })

export const getDocumentContent = createServerFn({ method: 'GET' })
  .inputValidator((input: { documentId: string; version?: string }) => ({
    documentId: documentIdSchema.shape.documentId.parse(input.documentId),
    version: typeof input.version === 'string' && input.version ? input.version : 'main',
  }))
  .handler(async ({ data }) => {
    const rows = await db.select().from(documents).where(eq(documents.id, data.documentId))
    const doc = rows[0]
    if (!doc) return null

    const content = await readDocumentAtVersion(doc.filePath, data.version)
    return { ...doc, content, version: data.version }
  })

// --- Auth-required functions ---

export const listDocuments = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAuth()
    return db.select().from(documents).orderBy(asc(documents.title))
  })

export const createDocument = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => createDocumentSchema.parse(input))
  .handler(async ({ data }) => {
    const session = await requireAuth()
    const id = nanoid()
    const filePath = `${data.slug}.md`

    await writeAndCommit(filePath, data.content, data.commitMessage)

    await db.insert(documents).values({
      id,
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      filePath,
      createdBy: session.user.email,
    })

    return { id }
  })

export const updateDocument = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => updateDocumentSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAuth()
    const rows = await db.select().from(documents).where(eq(documents.id, data.id))
    const doc = rows[0]
    if (!doc) throw new Error('Document not found')

    await writeAndCommit(doc.filePath, data.content, data.commitMessage)

    await db.update(documents).set({ updatedAt: new Date() }).where(eq(documents.id, data.id))

    return { id: data.id }
  })
