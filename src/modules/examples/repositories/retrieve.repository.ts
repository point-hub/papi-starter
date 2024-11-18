import type { IDatabase } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IRetrieveExampleRepository {
  handle(_id: string): Promise<IRetrieveExampleOutput>
}

export interface IRetrieveExampleOutput {
  _id: string
  name: string
  phone: string
  created_date: string
  updated_date: string
}

export class RetrieveRepository implements IRetrieveExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string): Promise<IRetrieveExampleOutput> {
    const response = await this.database.collection(collectionName).retrieve(_id, this.options)
    return {
      _id: response._id,
      name: response.name as string,
      phone: response.phone as string,
      created_date: response.created_date as string,
      updated_date: response.updated_date as string,
    }
  }
}
