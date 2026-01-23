import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi';
import { BaseMongoDBQueryFilters } from '@point-hub/papi';

import { collectionName } from '../entity';
import type { IRetrieveOutput } from './retrieve.repository';

export interface IRetrieveManyRepository {
  handle(query: IQuery): Promise<IRetrieveManyOutput>
}

export interface IRetrieveManyOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
}

export class RetrieveManyRepository implements IRetrieveManyRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(query: IQuery): Promise<IRetrieveManyOutput> {
    const pipeline: IPipeline[] = [];

    pipeline.push(...this.pipeQueryFilter(query));
    pipeline.push(...this.pipeGroupByOperationID());
    pipeline.push(...this.pipeProject());

    const response = await this.database.collection(collectionName).aggregate<IRetrieveOutput>(pipeline, query, this.options);

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
          actor: item.actor,
          action: item.action,
          module: item.module,
          system_reason: item.system_reason,
          user_reason: item.user_reason,
          changes: item.changes,
          metadata: item.metadata,
          created_at: item.created_at,
        };
      }),
      pagination: response.pagination,
    };
  }

  private pipeQueryFilter(query: IQuery): IPipeline[] {
    const filters: Record<string, unknown>[] = [];

    // General search across multiple fields
    if (query?.['search.all']) {
      const searchRegex = { $regex: query?.['search.all'], $options: 'i' };
      const fields = [
        'entity_type',
        'entity_ref',
        'actor_type',
        'actor_name',
        'action',
        'module',
        'system_reason',
        'user_reason',
      ];
      filters.push({
        $or: fields.map((field) => ({ [field]: searchRegex })),
      });
    }

    // Filter date
    BaseMongoDBQueryFilters.addDateRangeFilter(filters, 'created_at', query?.['search.created_at_from'], query?.['search.created_at_to']);

    // Filter specific field
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'entity_type', query?.['search.entity_type']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'entity_ref', query?.['search.entity_ref']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'actor_type', query?.['search.actor_type']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'actor_name', query?.['search.actor_name']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'action', query?.['search.action']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'module', query?.['search.module']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'system_reason', query?.['search.system_reason']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'user_reason', query?.['search.user_reason']);

    // Filter exact field
    BaseMongoDBQueryFilters.addExactFilter(filters, 'operation_id', query?.['search.operation_id']);
    BaseMongoDBQueryFilters.addExactFilter(filters, 'actor_id', query?.['search.actor_id']);
    BaseMongoDBQueryFilters.addExactFilter(filters, 'entity_id', query?.['search.entity_id']);

    return filters.length > 0 ? [{ $match: { $and: filters } }] : [];
  }

  private pipeGroupByOperationID(): IPipeline[] {
    return [
      {
        $group: {
          _id: '$operation_id',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ];
  }

  private pipeProject(): IPipeline[] {
    return [
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
          actor: 1,
          action: 1,
          module: 1,
          system_reason: 1,
          user_reason: 1,
          changes: 1,
          metadata: 1,
          created_at: 1,
        },
      },
    ];
  }
}
