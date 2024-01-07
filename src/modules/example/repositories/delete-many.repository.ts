import type { IDatabase, IDeleteManyOutput, IDeleteManyRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class DeleteManyRepository implements IDeleteManyRepository {
  public collection = collectionName

  constructor(public database: IDatabase) {}

  async handle(ids: string[], options?: unknown): Promise<IDeleteManyOutput> {
    return await this.database.collection(this.collection).deleteMany(ids, options)
  }
}
