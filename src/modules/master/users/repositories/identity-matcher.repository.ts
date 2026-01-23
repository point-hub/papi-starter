import type { IDatabase, IPagination, IPipeline } from '@point-hub/papi';

import { collectionName } from '../entity';
import { type IRetrieveOutput } from './retrieve.repository';

export interface IIdentityMatcherRepository {
  handle(trimmed_username_or_email: string): Promise<IIdentityMatcherOutput | null>
}

export interface IIdentityMatcherOutput {
  data: IRetrieveOutput[]
  pagination: IPagination
}

export class IdentityMatcherRepository implements IIdentityMatcherRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(trimmed_username_or_email: string): Promise<IIdentityMatcherOutput | null> {
    const pipeline: IPipeline[] = [];

    pipeline.push({
      $match: {
        $or: [
          { trimmed_username: { $eq: trimmed_username_or_email } },
          { trimmed_email: { $eq: trimmed_username_or_email } },
        ],
      },
    });
    pipeline.push(...this.pipeJoinRole());
    pipeline.push(...this.pipeJoinCreatedById());

    const response = await this.database.collection(collectionName).aggregate(pipeline, {}, this.options);
    if (!response || response.data.length === 0) {
      return null;
    }

    return {
      data: response.data as unknown as IRetrieveOutput[],
      pagination: response.pagination,
    };
  }

  private pipeJoinRole(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'roles',
          let: { roleId: '$role_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$roleId'] } } },
            {
              $project: {
                _id: 1,
                code: 1,
                name: 1,
                permissions: 1,
              },
            },
          ],
          as: 'role',
        },
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
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
}


