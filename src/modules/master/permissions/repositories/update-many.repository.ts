import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IUpdateManyRepository {
  handle(filter: IDocument, document: IDocument): Promise<IUpdateManyOutput>
}

export interface IUpdateManyOutput {
  matched_count: number
  modified_count: number
}

export class UpdateManyRepository implements IUpdateManyRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(filter: IDocument, document: IDocument): Promise<IUpdateManyOutput> {
    return await this.database.collection(collectionName).updateMany(filter, document, this.options);
  }
}
