import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IData {
  field: string
  actor_type: string
  actor_id: string
  actor_name: string
  newest_created_at: Date
}

export interface IFieldsSummaryRepository {
  handle(query: IQuery): Promise<IFieldsSummaryOutput>
}

export interface IFieldsSummaryOutput {
  data: IData[]
  pagination: IPagination
}

export class FieldsSummaryRepository implements IFieldsSummaryRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(query: IQuery): Promise<IFieldsSummaryOutput> {
    const pipeline: IPipeline[] = [
      {
        $match: {
          $and: [
            { entity_type: query?.['filter.entity_type'] },
            { entity_id: query?.['filter.entity_id'] },
          ],
        },
      },
      { $unwind: '$changes.summary.fields' },
      { $sort: { newest_created_at: -1 } },
      {
        $group: {
          _id: '$changes.summary.fields',
          actor_type: { $first: '$actor_type' },
          actor_id: { $first: '$actor_id' },
          actor_name: { $first: '$actor_name' },
          newest_created_at: { $max: '$created_at' },
        },
      },
      {
        $project: {
          _id: 0,
          field: '$_id',
          actor_type: 1,
          actor_id: 1,
          actor_name: 1,
          newest_created_at: 1,
        },
      },
    ];

    const response = await this.database.collection(collectionName).aggregate<IData>(pipeline, query, this.options);

    return {
      data: response.data.map(item => {
        return {
          field: item.field,
          actor_type: item.actor_type,
          actor_id: item.actor_id,
          actor_name: item.actor_name,
          newest_created_at: item.newest_created_at,
        };
      }),
      pagination: response.pagination,
    };
  }
}
