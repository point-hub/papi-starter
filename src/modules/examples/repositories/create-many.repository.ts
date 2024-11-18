import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface ICreateManyExampleRepository {
  handle(documents: IDocument[]): Promise<ICreateManyExampleOutput>
}

export interface ICreateManyExampleOutput {
  inserted_ids: string[]
  inserted_count: number
}

export class CreateManyRepository implements ICreateManyExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(documents: IDocument[]): Promise<ICreateManyExampleOutput> {
    return await this.database
      .collection(collectionName)
      .createMany(documents, { ignoreUndefined: true, ...this.options })
  }
}
