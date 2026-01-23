import type { IDatabase } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IDeleteRepository {
  handle(_id: string): Promise<IDeleteOutput>
}

export interface IDeleteOutput {
  deleted_count: number
}

export class DeleteRepository implements IDeleteRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string): Promise<IDeleteOutput> {
    return await this.database.collection(collectionName).delete(_id, this.options);
  }
}
