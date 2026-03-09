import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect /dashboard/deleted → /deleted-documents
export const Route = createFileRoute('/_admin/dashboard/deleted')({
  loader: () => {
    throw redirect({ to: '/deleted-documents' })
  },
  component: () => null,
})
