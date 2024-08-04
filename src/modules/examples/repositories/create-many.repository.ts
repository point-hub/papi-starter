import type { ICreateManyOutput, ICreateManyRepository, IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICreateManyExampleOutput extends ICreateManyOutput {}
export interface ICreateManyExampleRepository extends ICreateManyRepository {
  handle(documents: IDocument[], options?: unknown): Promise<ICreateManyExampleOutput>
}

export class CreateManyRepository implements ICreateManyExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(documents: IDocument[], options?: unknown): Promise<ICreateManyExampleOutput> {
    return await this.database.collection(collectionName).createMany(documents, options)
  }
}
