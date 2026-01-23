import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IFieldHistoryOutput {
  _id?: string
  operation_id?: string
  entity_type?: string
  entity_id?: string
  entity_ref?: string
  actor_type?: string
  actor_id?: string
  actor_name?: string
  action?: string
  module?: string
  system_reason?: string
  user_reason?: string
  field?: string
  before?: string
  after?: string
  metadata?: {
    ip?: string
    device?: {
      type?: string
      model?: string
      vendor?: string
    }
    browser?: {
      type?: string
      name?: string
      version?: string
    }
    os?: {
      name?: string
      version?: string
    }
  }
  created_at: Date
}

export interface IFieldHistoriesRepository {
  handle(query: IQuery): Promise<IFieldHistoriesOutput>
}

export interface IFieldHistoriesOutput {
  data: IFieldHistoryOutput[]
  pagination: IPagination
}

export class FieldHistoriesRepository implements IFieldHistoriesRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(query: IQuery): Promise<IFieldHistoriesOutput> {
    const pipeline: IPipeline[] = [
      {
        $match: {
          entity_type: query?.['search.entity_type'],
          entity_id: query?.['search.entity_id'],
        },
      },
      {
        $match: {
          'changes.summary.fields': {
            $in: [query?.['search.field']],
          },
        },
      },
      {
        $unwind: '$changes.summary.fields',
      },
      {
        $match: {
          'changes.summary.fields': query?.['search.field'],
        },
      },
      {
        $project: {
          _id: 1,
          operation_id: 1,
          entity_type: 1,
          entity_id: 1,
          entity_ref: 1,
          actor_type: 1,
          actor_id: 1,
          actor_name: 1,
          action: 1,
          module: 1,
          system_reason: 1,
          user_reason: 1,
          field: '$changes.summary.fields',
          before: {
            $getField: {
              field: '$changes.summary.fields',
              input: '$changes.snapshot.before',
            },
          },
          after: {
            $getField: {
              field: '$changes.summary.fields',
              input: '$changes.snapshot.after',
            },
          },
          created_at: 1,
        },
      },
      {
        $match: {
          $or: [
            { before: { $exists: true, $ne: null } },
            { after: { $exists: true, $ne: null } },
          ],
        },
      },
    ];
    const response = await this.database.collection(collectionName).aggregate<IFieldHistoryOutput>(pipeline, query, this.options);

    return {
      data: response.data.map(item => {
        return {
          _id: item._id,
          operation_id: item.operation_id,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          entity_ref: item.entity_ref,
          actor_type: item.actor_type,
          actor_id: item.actor_id,
          actor_name: item.actor_name,
          action: item.action,
          module: item.module,
          system_reason: item.system_reason,
          user_reason: item.user_reason,
          metadata: item.metadata,
          field: item.field,
          before: item.before,
          after: item.after,
          created_at: item.created_at,
        };
      }),
      pagination: response.pagination,
    };
  }
}
