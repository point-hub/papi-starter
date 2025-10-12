import type { IDatabase, IPagination, IPipeline, IQuery } from '@point-hub/papi'
import { BaseMongoDBQueryFilters } from '@point-hub/papi'
import QueryString from 'qs'

import { collectionName } from '../entity'
import { type IRetrieveModuleExampleOutput } from './retrieve.repository'

export interface IRetrieveAllModuleExampleRepository {
  handle(query: IQuery): Promise<IRetrieveAllModuleExampleOutput>
}

export interface IRetrieveAllModuleExampleOutput {
  data: IRetrieveModuleExampleOutput[]
  pagination: IPagination
}

export interface IModuleExampleQueryFilter {
  all?: string
  name?: string
  age?: string
  nationality?: string
}

export interface IModuleExampleQuery extends IQuery {
  filter?: IModuleExampleQueryFilter
}

export class RetrieveAllModuleExampleRepository implements IRetrieveAllModuleExampleRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) {}

  async handle(query: IQuery): Promise<IRetrieveAllModuleExampleOutput> {
    const parsedQuery = QueryString.parse(query as Record<string, string>) as IModuleExampleQuery

    const pipeline: IPipeline[] = this.buildPipeline(parsedQuery)

    const response = await this.database.collection(collectionName).aggregate(pipeline, parsedQuery, this.options)

    return {
      data: response.data as unknown as IRetrieveModuleExampleOutput[],
      pagination: response.pagination,
    }
  }

  private buildPipeline(query: IModuleExampleQuery): IPipeline[] {
    const filters: Record<string, unknown>[] = []
    const { filter } = query

    // General search across multiple fields
    if (filter?.all) {
      const searchRegex = { $regex: filter.all, $options: 'i' }
      const fields = ['name', 'age', 'nationality.label']
      filters.push({
        $or: fields.map((field) => ({ [field]: searchRegex })),
      })
    }

    // Filter specific field
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'name', filter?.name)
    BaseMongoDBQueryFilters.addRegexFilter(filters, 'nationality.label', filter?.nationality)

    // Apply numeric filter using the helper function
    BaseMongoDBQueryFilters.addNumberFilter(filters, 'age', filter?.age)

    return filters.length > 0 ? [{ $match: { $and: filters } }] : []
  }
}
