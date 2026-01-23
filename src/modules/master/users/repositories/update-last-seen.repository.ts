import type { IDatabase } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IUpdateLastSeenRepository {
  handle(_id: string): Promise<IUpdateLastSeenOutput>
}

export interface IUpdateLastSeenOutput {
  matched_count: number
  modified_count: number
}

export class UpdateLastSeenRepository implements IUpdateLastSeenRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(_id: string): Promise<IUpdateLastSeenOutput> {
    return await this.database.collection(collectionName).update(_id, { last_seen: new Date() }, this.options);
  }
}
