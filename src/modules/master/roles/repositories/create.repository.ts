import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface ICreateRepository {
  handle(document: IDocument): Promise<ICreateOutput>
}

export interface ICreateOutput {
  inserted_id: string
}

export class CreateRepository implements ICreateRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(document: IDocument): Promise<ICreateOutput> {
    return await this.database.collection(collectionName).create(document, this.options);
  }
}
