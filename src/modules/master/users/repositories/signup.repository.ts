import type { IDatabase, IDocument } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface ISignupRepository {
  handle(document: IDocument): Promise<ISignupOutput>
}

export interface ISignupOutput {
  inserted_id: string
}

export class SignupRepository implements ISignupRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(document: IDocument): Promise<ISignupOutput> {
    return await this.database.collection(collectionName).create({ ...document, created_at: new Date() }, this.options);
  }
}
