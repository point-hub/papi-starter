import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IUpdateManyExampleRepository {
  handle(filter: IDocument, document: IDocument): Promise<IUpdateManyExampleOutput>
}

export interface IUpdateManyExampleOutput {
  matched_count: number
  modified_count: number
}

export class UpdateManyRepository implements IUpdateManyExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(filter: IDocument, document: IDocument): Promise<IUpdateManyExampleOutput> {
    return await this.database
      .collection(collectionName)
      .updateMany(filter, document, { ignoreUndefined: true, ...this.options })
  }
}
