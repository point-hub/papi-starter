import type { IDatabase, IDeleteOutput, IDeleteRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDeleteExampleOutput extends IDeleteOutput {}
export interface IDeleteExampleRepository extends IDeleteRepository {
  handle(_id: string, options?: unknown): Promise<IDeleteExampleOutput>
}

export class DeleteRepository implements IDeleteExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(_id: string, options?: unknown): Promise<IDeleteExampleOutput> {
    return await this.database.collection(collectionName).delete(_id, options)
  }
}
