import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface ICreateExampleRepository {
  handle(document: IDocument): Promise<ICreateExampleOutput>
}

export interface ICreateExampleOutput {
  inserted_id: string
}

export class CreateExampleRepository implements ICreateExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(document: IDocument): Promise<ICreateExampleOutput> {
    return await this.database.collection(collectionName).create(document, { ignoreUndefined: true, ...this.options })
  }
}
