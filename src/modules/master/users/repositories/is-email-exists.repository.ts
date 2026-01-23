import type { IDatabase } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IIsEmailExistsRepository {
  handle(trimmed_email: string): Promise<boolean>
}

export class IsEmailExistsRepository implements IIsEmailExistsRepository {
  public collection = collectionName;

  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(trimmed_email: string): Promise<boolean> {
    const response = await this.database.collection(this.collection).retrieveMany(
      {
        filter: { trimmed_email: trimmed_email },
      },
      this.options,
    );
    return response.pagination.total_document > 0;
  }
}
