import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface ICreateManyModuleExampleRepository {
  handle(documents: IDocument[]): Promise<ICreateManyModuleExampleOutput>
}

export interface ICreateManyModuleExampleOutput {
  inserted_ids: string[]
  inserted_count: number
}

export class CreateManyModuleExampleRepository implements ICreateManyModuleExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(documents: IDocument[]): Promise<ICreateManyModuleExampleOutput> {
    return await this.database
      .collection(collectionName)
      .createMany(documents, { ignoreUndefined: true, ...this.options })
  }
}
