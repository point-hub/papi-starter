import type { IDatabase } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IDeleteExampleRepository {
  handle(_id: string): Promise<IDeleteExampleOutput>
}

export interface IDeleteExampleOutput {
  deleted_count: number
}

export class DeleteRepository implements IDeleteExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string): Promise<IDeleteExampleOutput> {
    return await this.database.collection(collectionName).delete(_id, this.options)
  }
}
