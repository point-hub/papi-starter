import type { IDatabase, IQuery, IRetrieveAllOutput, IRetrieveAllRepository } from '@point-hub/papi'

import { collectionName } from '../entity'
import { IRetrieveExampleOutput } from './retrieve.repository'

export interface IRetrieveAllExampleOutput extends IRetrieveAllOutput {
  data: IRetrieveExampleOutput[]
}
export interface IRetrieveAllExampleRepository extends IRetrieveAllRepository {
  handle(query: IQuery, options?: unknown): Promise<IRetrieveAllExampleOutput>
}

export class RetrieveAllRepository implements IRetrieveAllExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(query: IQuery, options?: unknown): Promise<IRetrieveAllExampleOutput> {
    const response = await this.database.collection(collectionName).retrieveAll(query, options)
    return {
      data: response.data as IRetrieveExampleOutput[],
      pagination: response.pagination,
    }
  }
}
