import type { IDatabase, IPagination, IQuery } from '@point-hub/papi'

import { collectionName } from '../entity'
import { type IRetrieveExampleOutput } from './retrieve.repository'

export interface IRetrieveAllExampleRepository {
  handle(query: IQuery): Promise<IRetrieveAllExampleOutput>
}

export interface IRetrieveAllExampleOutput {
  data: IRetrieveExampleOutput[]
  pagination: IPagination
}

export class RetrieveAllExampleRepository implements IRetrieveAllExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(query: IQuery): Promise<IRetrieveAllExampleOutput> {
    const response = await this.database.collection(collectionName).retrieveAll(query, this.options)
    return {
      data: response.data as unknown as IRetrieveExampleOutput[],
      pagination: response.pagination,
    }
  }
}
