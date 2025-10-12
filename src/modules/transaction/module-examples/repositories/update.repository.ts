import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IUpdateModuleExampleRepository {
  handle(_id: string, document: IDocument): Promise<IUpdateModuleExampleOutput>
}

export interface IUpdateModuleExampleOutput {
  matched_count: number
  modified_count: number
}

export class UpdateModuleExampleRepository implements IUpdateModuleExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string, document: IDocument): Promise<IUpdateModuleExampleOutput> {
    return await this.database
      .collection(collectionName)
      .update(_id, { $set: document }, { ignoreUndefined: true, ...this.options })
  }
}
