import type { IDatabase, IDocument, IUpdateOutput, IUpdateRepository } from '@point-hub/papi'

import { collectionName } from '../entity'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUpdateExampleOutput extends IUpdateOutput {}
export interface IUpdateExampleRepository extends IUpdateRepository {
  handle(_id: string, document: IDocument, options?: unknown): Promise<IUpdateExampleOutput>
}

export class UpdateRepository implements IUpdateExampleRepository {
  constructor(public database: IDatabase) {}

  async handle(_id: string, document: IDocument, options?: unknown): Promise<IUpdateExampleOutput> {
    return await this.database.collection(collectionName).update(_id, document, options)
  }
}
