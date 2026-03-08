import MDEditor from '@uiw/react-md-editor'

interface DocumentEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
}

export default function DocumentEditor({
  value,
  onChange,
  height = 500,
}: DocumentEditorProps) {
  return (
    <div data-color-mode="auto">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        preview="edit"
      />
    </div>
  )
}
