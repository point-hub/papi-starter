import type { IDatabase, IDocument } from '@point-hub/papi'

import { collectionName } from '../entity'

export interface ICreateModuleExampleRepository {
  handle(document: IDocument): Promise<ICreateModuleExampleOutput>
}

export interface ICreateModuleExampleOutput {
  inserted_id: string
}

export class CreateModuleExampleRepository implements ICreateModuleExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(document: IDocument): Promise<ICreateModuleExampleOutput> {
    return await this.database.collection(collectionName).create(document, { ignoreUndefined: true, ...this.options })
  }
}
