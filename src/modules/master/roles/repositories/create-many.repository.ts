import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface ICreateManyRepository {
  handle(documents: IDocument[]): Promise<ICreateManyOutput>
}

export interface ICreateManyOutput {
  inserted_ids: string[]
  inserted_count: number
}

export class CreateManyRepository implements ICreateManyRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(documents: IDocument[]): Promise<ICreateManyOutput> {
    return await this.database.collection(collectionName).createMany(documents, this.options);
  }
}
