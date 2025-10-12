import type { IDatabase, IDocument } from '@point-hub/papi'

import { throwApiError } from './throw-api-error'

export interface IFilter {
  match: IDocument
  replaceErrorAttribute?: IDocument
}

export interface IUniqueValidation {
  handle(collectionName: string, filter: IFilter, _id?: string): Promise<void>
}

export class UniqueValidation implements IUniqueValidation {
  constructor(
    public database: IDatabase,
    public options?: unknown,
  ) {}

  async handle(collectionName: string, filter: IFilter, _id?: string): Promise<void> {
    const response = await this.database.collection(collectionName).retrieveAll(
      {
        filter: {
          ...filter.match,
          _id: { $ne: _id },
        },
      },
      this.options,
    )

    if (response.data.length > 0) {
      const keys = Object.keys(filter.match)
      const keyString = keys.join(', ')
      const errors: Record<string, string[]> = {}

      for (const key in filter.match) {
        if (keys.length > 1) {
          errors[key] = [`The combination of ${keyString} is exists.`]
        } else {
          errors[key] = [`The ${keyString} is exists.`]
        }
      }

      /**
       * updatedErrors replace field names in the error messages.
       *
       * For example, our internal database field uses trimmed_username to check for uniqueness by
       * ignoring spaces in the username, while still allowing users to include spaces when logging in,
       * so we return the error field as username instead of trimmed_username.
       */
      const updatedErrors = Object.entries(errors).reduce(
        (acc, [key, value]) => {
          const newKey = filter.replaceErrorAttribute?.[key] || key
          acc[newKey] = value.map((msg) => msg.replaceAll(key, newKey))
          return acc
        },
        {} as Record<string, string[]>,
      )

      throwApiError(422, { errors: updatedErrors })
    }
  }
}
