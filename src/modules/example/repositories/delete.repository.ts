import type { IDatabase, IDeleteOutput, IDeleteRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class DeleteRepository implements IDeleteRepository {
  public collection = collectionName

  constructor(public database: IDatabase) {}

  async handle(_id: string, options?: unknown): Promise<IDeleteOutput> {
    return await this.database.collection(this.collection).delete(_id, options)
  }
}
