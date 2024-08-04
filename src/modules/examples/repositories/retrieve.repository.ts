import type { IDatabase, IRetrieveOutput, IRetrieveRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IRetrieveExampleOutput extends IRetrieveOutput {
  name: string
  phone: string
  created_date: string
  updated_date: string
}
export interface IRetrieveExampleRepository extends IRetrieveRepository {
  handle(_id: string, options?: unknown): Promise<IRetrieveExampleOutput>
}

export class RetrieveRepository implements IRetrieveExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(_id: string, options?: unknown): Promise<IRetrieveExampleOutput> {
    const response = await this.database.collection(collectionName).retrieve(_id, options)
    return {
      _id: response._id,
      name: response.name as string,
      phone: response.phone as string,
      created_date: response.created_date as string,
      updated_date: response.updated_date as string,
    }
  }
}
