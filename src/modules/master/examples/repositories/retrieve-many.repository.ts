import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi';
import { BaseMongoDBQueryFilters } from '@point-hub/papi';

import { collectionName } from '../entity';
import type { IExample } from '../interface';
import type { IRetrieveOutput } from './retrieve.repository';

export interface IRetrieveManyRepository {
  handle(query: IQuery): Promise<IRetrieveManyOutput>
  raw(query: IQuery): Promise<IRetrieveManyRawOutput>
}

export interface IRetrieveManyOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
}

export interface IRetrieveManyRawOutput {
  data: IExample[]
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
    pipeline.push(...this.pipeJoinCreatedById());
    pipeline.push(...this.pipeProject());

    const response = await this.database.collection(collectionName).aggregate<IRetrieveOutput>(pipeline, query, this.options);

    return {
      data: response.data.map(item => {
        return {
          _id: item._id,
          code: item.code,
          name: item.name,
          age: item.age,
          gender: item.gender,
          notes: item.notes,
          composite_unique_1: item.composite_unique_1,
          composite_unique_2: item.composite_unique_2,
          optional_unique: item.optional_unique,
          optional_composite_unique_1: item.optional_composite_unique_1,
          optional_composite_unique_2: item.optional_composite_unique_2,
          xxx_composite_unique_1: item.xxx_composite_unique_1,
          xxx_composite_unique_2: item.xxx_composite_unique_2,
          is_archived: item.is_archived,
          created_at: item.created_at,
          created_by: item.created_by,
        };
      }),
      pagination: response.pagination,
    };
  }

  async raw(query: IQuery): Promise<IRetrieveManyRawOutput> {
    return await this.database.collection(collectionName).retrieveMany<IExample>(query, this.options);
  }

  private pipeQueryFilter(query: IQuery): IPipeline[] {
    const filters: Record<string, unknown>[] = [];

    // General search across multiple fields
    if (query?.['search.all']) {
      const searchRegex = { $regex: query?.['search.all'], $options: 'i' };
      const fields = ['code', 'name', 'composite_unique_1', 'composite_unique_2', 'age', 'gender', 'optional_unique_1'];
      filters.push({
        $or: fields.map((field) => ({ [field]: searchRegex })),
      });
    }

    // Filter specific field
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'code', query?.['search.code']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'name', query?.['search.name']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'composite_unique_1', query?.['search.composite_unique_1']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'composite_unique_2', query?.['search.composite_unique_2']);
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'optional_unique', query?.['search.optional_unique']);

    // Filter exact field
    BaseMongoDBQueryFilters.addExactFilter(filters, 'gender', query?.['search.gender']);

    // Apply numeric filter using the helper function
    BaseMongoDBQueryFilters.addNumberFilter(filters, 'age', query?.['search.age']);

    // Filter boolean
    BaseMongoDBQueryFilters.addBooleanFilter(filters, 'is_archived', query?.['search.is_archived']);

    return filters.length > 0 ? [{ $match: { $and: filters } }] : [];
  }

  private pipeJoinCreatedById(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'users',
          let: { userId: '$created_by_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1,
                email: 1,
              },
            },
          ],
          as: 'created_by',
        },
      },
      {
        $unwind: {
          path: '$created_by',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private pipeProject(): IPipeline[] {
    return [
      {
        $project: {
          _id: 1,
          code: 1,
          name: 1,
          age: 1,
          gender: 1,
          notes: 1,
          composite_unique_1: 1,
          composite_unique_2: 1,
          optional_unique: 1,
          optional_composite_unique_1: 1,
          optional_composite_unique_2: 1,
          xxx_composite_unique_1: 1,
          xxx_composite_unique_2: 1,
          is_archived: 1,
          created_at: 1,
          created_by: 1,
        },
      },
    ];
  }
}
