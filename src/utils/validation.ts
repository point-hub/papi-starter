import { type IDocument, type ISchemaValidation } from '@point-hub/papi'
import Validatorjs from 'validatorjs'

import { throwApiError } from './throw-api-error'

// https://github.com/mikeerickson/validatorjs
export const schemaValidation: ISchemaValidation = async (document: IDocument, schema: IDocument) => {
  const validation = new Validatorjs(document, schema)

  if (validation.fails()) {
    throwApiError(422, { errors: validation.errors.errors })
  }
}
