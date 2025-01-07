import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IUpdateExampleRepository {
  handle(_id: string, document: IDocument): Promise<IUpdateExampleOutput>
}

export interface IUpdateExampleOutput {
  matched_count: number
  modified_count: number
}

export class UpdateExampleRepository implements IUpdateExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string, document: IDocument): Promise<IUpdateExampleOutput> {
    return await this.database
      .collection(collectionName)
      .update(_id, { $set: document }, { ignoreUndefined: true, ...this.options })
  }
}
