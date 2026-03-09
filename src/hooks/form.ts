import { createFormHook } from '@tanstack/react-form'

import {
  EmailField,
  SubscribeButton,
  TextArea,
  TextField,
} from '#/components/app/form-components'
import { fieldContext, formContext } from '#/hooks/form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    EmailField,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
