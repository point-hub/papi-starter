import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IUpdateManyModuleExampleRepository {
  handle(filter: IDocument, document: IDocument): Promise<IUpdateManyModuleExampleOutput>
}

export interface IUpdateManyModuleExampleOutput {
  matched_count: number
  modified_count: number
}

export class UpdateManyModuleExampleRepository implements IUpdateManyModuleExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(filter: IDocument, document: IDocument): Promise<IUpdateManyModuleExampleOutput> {
    return await this.database
      .collection(collectionName)
      .updateMany(filter, { $set: document }, { ignoreUndefined: true, ...this.options })
  }
}
