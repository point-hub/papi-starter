import type { IDatabase, IDeleteManyOutput, IDeleteManyRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDeleteManyExampleOutput extends IDeleteManyOutput {}
export interface IDeleteManyExampleRepository extends IDeleteManyRepository {
  handle(_ids: string[], options?: unknown): Promise<IDeleteManyExampleOutput>
}

export class DeleteManyRepository implements IDeleteManyExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(ids: string[], options?: unknown): Promise<IDeleteManyExampleOutput> {
    return await this.database.collection(collectionName).deleteMany(ids, options)
  }
}
