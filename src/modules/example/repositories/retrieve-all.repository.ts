import type { IDatabase, IQuery, IRetrieveAllOutput, IRetrieveAllRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export class RetrieveAllRepository implements IRetrieveAllRepository {
  public collection = collectionName

  constructor(public database: IDatabase) {}

  async handle(query: IQuery, options?: unknown): Promise<IRetrieveAllOutput> {
    return await this.database.collection(this.collection).retrieveAll(query, options)
  }
}
