import type { IDatabase } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IDeleteManyRepository {
  handle(_ids: string[]): Promise<IDeleteManyOutput>
}

export interface IDeleteManyOutput {
  deleted_count: number
}

export class DeleteManyRepository implements IDeleteManyRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(ids: string[]): Promise<IDeleteManyOutput> {
    return await this.database.collection(collectionName).deleteMany(ids, this.options);
  }
}
