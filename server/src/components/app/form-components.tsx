import { useStore } from '@tanstack/react-form'

import { useFieldContext, useFormContext } from '#/hooks/form-context'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea as ShadcnTextarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-sm text-destructive mt-1"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

export function TextField({
  label,
  placeholder,
  list,
}: {
  label: string
  placeholder?: string
  list?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={field.name} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={field.name}
        value={field.state.value}
        placeholder={placeholder}
        list={list}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="mt-1.5"
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function EmailField({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={field.name} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={field.name}
        type="email"
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="mt-1.5"
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function TextArea({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={field.name} className="text-sm font-medium">
        {label}
      </Label>
      <ShadcnTextarea
        id={field.name}
        value={field.state.value}
        rows={rows}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="mt-1.5"
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
