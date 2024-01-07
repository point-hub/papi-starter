import type { ICreateManyOutput, ICreateManyRepository, IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export class CreateManyRepository implements ICreateManyRepository {
  public collection = collectionName

  constructor(public database: IDatabase) {}

  async handle(documents: IDocument[], options?: unknown): Promise<ICreateManyOutput> {
    return await this.database.collection(this.collection).createMany(documents, options)
  }
}
