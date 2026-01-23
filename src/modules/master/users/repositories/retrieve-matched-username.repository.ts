import type { IDatabase, IPagination } from '@point-hub/papi';

import { collectionName } from '../entity';
import { type IRetrieveOutput } from './retrieve.repository';

export interface IRetrieveMatchedUsernameRepository {
  handle(trimmed_username: string, trimmed_email: string): Promise<IRetrieveMatchedUsernameOutput>
}

export interface IRetrieveMatchedUsernameOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
}

export class RetrieveMatchedUsernameRepository implements IRetrieveMatchedUsernameRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(trimmed_username: string, trimmed_email: string): Promise<IRetrieveMatchedUsernameOutput> {
    const response = await this.database.collection(collectionName).retrieveMany(
      {
        filter: {
          $or: [
            {
              trimmed_username: {
                $regex: `^${trimmed_username}$`,
                $options: 'i',
              },
            },
            {
              trimmed_email: {
                $regex: `^${trimmed_email}$`,
                $options: 'i',
              },
            },
          ],
        },
      },
      this.options,
    );

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }
}
