import type { IDatabase, IDocument, IUpdateManyOutput, IUpdateManyRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUpdateManyExampleOutput extends IUpdateManyOutput {}
export interface IUpdateManyExampleRepository extends IUpdateManyRepository {
  handle(filter: IDocument, document: IDocument, options?: unknown): Promise<IUpdateManyExampleOutput>
}

export class UpdateManyRepository implements IUpdateManyExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(filter: IDocument, document: IDocument, options?: unknown): Promise<IUpdateManyExampleOutput> {
    return await this.database.collection(collectionName).updateMany(filter, document, options)
  }
}
