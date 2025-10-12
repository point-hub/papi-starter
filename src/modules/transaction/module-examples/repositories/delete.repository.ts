import type { IDatabase } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface IDeleteModuleExampleRepository {
  handle(_id: string): Promise<IDeleteModuleExampleOutput>
}

export interface IDeleteModuleExampleOutput {
  deleted_count: number
}

export class DeleteModuleExampleRepository implements IDeleteModuleExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string): Promise<IDeleteModuleExampleOutput> {
    return await this.database.collection(collectionName).delete(_id, this.options)
  }
}
