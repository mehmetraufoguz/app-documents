import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface Version {
  commit: string
  shortHash: string
  message: string
  author: string
  date: string
}

interface VersionSelectorProps {
  versions: Version[]
  documentId: string
}

export function VersionSelector({ versions, documentId }: VersionSelectorProps) {
  const navigate = useNavigate()
  // biome-ignore lint/suspicious/noExplicitAny: search params vary per route
  const search = useSearch({ strict: false }) as any
  const currentVersion = search?.version ?? 'main'

  const handleChange = (value: string) => {
    navigate({
      to: '/documents/$documentId',
      params: { documentId },
      search: value === 'main' ? {} : { version: value },
    })
  }

  return (
    <Select value={currentVersion} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select version" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="main">main (latest)</SelectItem>
        {versions.map((v) => (
          <SelectItem key={v.commit} value={v.commit}>
            <span className="font-mono text-xs">{v.shortHash}</span>
            <span className="ml-2 text-muted-foreground truncate max-w-[120px]">
              {v.message}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
