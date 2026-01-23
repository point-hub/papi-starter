import type { IDatabase } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IIsUsernameExistsRepository {
  handle(trimmed_username: string): Promise<boolean>
}

export class IsUsernameExistsRepository implements IIsUsernameExistsRepository {
  public collection = collectionName;

  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(trimmed_username: string): Promise<boolean> {
    const response = await this.database.collection(this.collection).retrieveMany(
      {
        filter: { trimmed_username: trimmed_username },
      },
      this.options,
    );
    return response.pagination.total_document > 0;
  }
}
