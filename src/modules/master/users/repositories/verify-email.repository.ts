import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IVerifyEmailRepository {
  handle(_id: string, document: IDocument): Promise<IUserVerifyEmailOutput>
}

export interface IUserVerifyEmailOutput {
  matched_count: number
  modified_count: number
}

export class UserVerifyEmailRepository implements IVerifyEmailRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string, document: IDocument): Promise<IUserVerifyEmailOutput> {
    return await this.database.collection(collectionName).update(_id, document, { ...this.options });
  }
}
