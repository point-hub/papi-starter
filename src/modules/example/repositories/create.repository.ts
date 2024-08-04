import type { ICreateOutput, ICreateRepository, IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICreateExampleOutput extends ICreateOutput {}
export interface ICreateExampleRepository extends ICreateRepository {
  handle(document: IDocument, options?: unknown): Promise<ICreateExampleOutput>
}

export class CreateRepository implements ICreateExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(document: IDocument, options?: unknown): Promise<ICreateExampleOutput> {
    return await this.database.collection(collectionName).create(document, options)
  }
}
