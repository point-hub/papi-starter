import type { IDatabase } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IDeleteManyRepository {
  handle(filter: string[] | Record<string, unknown>): Promise<IDeleteManyOutput>
}

export interface IDeleteManyOutput {
  deleted_count: number
}

export class DeleteManyRepository implements IDeleteManyRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(filter: string[] | Record<string, unknown>): Promise<IDeleteManyOutput> {
    return await this.database.collection(collectionName).deleteMany(filter, this.options);
  }
}
