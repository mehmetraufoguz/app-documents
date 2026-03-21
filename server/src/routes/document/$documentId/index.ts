import { createFileRoute } from '@tanstack/react-router'
import { getDocumentWithHistory } from '#/server/functions/documents.fns'

export const Route = createFileRoute('/document/$documentId/')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const doc = await getDocumentWithHistory({
          data: { documentId: params.documentId },
        })
        if (!doc) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const body = JSON.stringify({
          id: doc.id,
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          updatedAt: new Date(doc.updatedAt).toISOString(),
          versions: doc.versions,
        })

        return new Response(body, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          },
        })
      },
    },
  },
})
