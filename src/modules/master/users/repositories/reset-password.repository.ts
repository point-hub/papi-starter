import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IResetPasswordRepository {
  handle(_id: string, document: IDocument): Promise<IResetPasswordOutput>
}

export interface IResetPasswordOutput {
  matched_count: number
  modified_count: number
}

export class ResetPasswordRepository implements IResetPasswordRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string, document: IDocument): Promise<IResetPasswordOutput> {
    return await this.database.collection(collectionName).update(_id, document, this.options);
  }
}
