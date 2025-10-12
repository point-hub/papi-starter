import type { IDatabase } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IDeleteManyExampleRepository {
  handle(_ids: string[]): Promise<IDeleteManyExampleOutput>
}

export interface IDeleteManyExampleOutput {
  deleted_count: number
}

export class DeleteManyExampleRepository implements IDeleteManyExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(ids: string[]): Promise<IDeleteManyExampleOutput> {
    return await this.database.collection(collectionName).deleteMany(ids, this.options)
  }
}
