import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IUpdateRepository {
  handle(_id: string, document: IDocument): Promise<IUpdateOutput>
}

export interface IUpdateOutput {
  matched_count: number
  modified_count: number
}

export class UpdateRepository implements IUpdateRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(_id: string, document: IDocument): Promise<IUpdateOutput> {
    return await this.database.collection(collectionName).update(_id, document, this.options);
  }
}
