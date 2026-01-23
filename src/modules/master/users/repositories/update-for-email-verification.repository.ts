import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IUpdateForEmailVerificationRepository {
  handle(_id: string, document: IDocument): Promise<IUpdateForEmailVerificationOutput>
}

export interface IUpdateForEmailVerificationOutput {
  matched_count: number
  modified_count: number
}

export class UpdateForEmailVerificationRepository implements IUpdateForEmailVerificationRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string, document: IDocument): Promise<IUpdateForEmailVerificationOutput> {
    return await this.database.collection(collectionName).update(_id, document, this.options);
  }
}
