import type { IDatabase, IDocument } from '@point-hub/papi'

import { throwApiError } from './throw-api-error'

export interface IUniqueValidation {
  handle(collectionName: string, filter: IDocument, _id?: string): Promise<void>
}

export class UniqueValidation implements IUniqueValidation {
  constructor(
    public database: IDatabase,
    public options?: unknown,
  ) {}

  async handle(collectionName: string, filter: IDocument, _id?: string): Promise<void> {
    const response = await this.database.collection(collectionName).retrieveAll(
      {
        filter: {
          ...filter,
          _id: { $ne: _id },
        },
      },
      this.options,
    )

    if (response.data.length > 0) {
      const keys = Object.keys(filter)
      const keyString = keys.join(', ')
      const errors: Record<string, unknown> = {}
      for (const key in filter) {
        if (keys.length > 1) {
          errors[key] = [`The combination of ${keyString} is exists.`]
        } else {
          errors[key] = [`The ${keyString} is exists.`]
        }
      }
      throwApiError(422, { errors: errors })
    }
  }
}
