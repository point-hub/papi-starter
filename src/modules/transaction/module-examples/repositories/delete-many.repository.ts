import type { IDatabase } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IDeleteManyModuleExampleRepository {
  handle(_ids: string[]): Promise<IDeleteManyModuleExampleOutput>
}

export interface IDeleteManyModuleExampleOutput {
  deleted_count: number
}

export class DeleteManyModuleExampleRepository implements IDeleteManyModuleExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(ids: string[]): Promise<IDeleteManyModuleExampleOutput> {
    return await this.database.collection(collectionName).deleteMany(ids, this.options)
  }
}
