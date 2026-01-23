import type { IDatabase, IPipeline } from '@point-hub/papi';

import type { IAuthUser } from '@/modules/master/users/interface';

import { collectionName } from '../entity';
import type { IExample } from '../interface';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput | null>
  raw(_id: string): Promise<IExample | null>
}

export interface IRetrieveOutput {
  _id: string
  code: string
  name: string
  age: number
  gender: string
  notes: string
  composite_unique_1: string
  composite_unique_2: string
  optional_unique: string
  optional_composite_unique_1: string
  optional_composite_unique_2: string
  xxx_composite_unique_1: string
  xxx_composite_unique_2: string
  is_archived: boolean
  created_at: Date
  created_by: IAuthUser
}

export class RetrieveRepository implements IRetrieveRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(_id: string): Promise<IRetrieveOutput | null> {
    const pipeline: IPipeline[] = [];

    pipeline.push(...this.pipeFilter(_id));
    pipeline.push(...this.pipeJoinCreatedById());
    pipeline.push(...this.pipeProject());

    const response = await this.database.collection(collectionName).aggregate<IRetrieveOutput>(pipeline, {}, this.options);
    if (!response || response.data.length === 0) {
      return null;
    }

    return {
      _id: response.data[0]._id,
      code: response.data[0].code,
      name: response.data[0].name,
      age: response.data[0].age,
      gender: response.data[0].gender,
      notes: response.data[0].notes,
      composite_unique_1: response.data[0].composite_unique_1,
      composite_unique_2: response.data[0].composite_unique_2,
      optional_unique: response.data[0].optional_unique,
      optional_composite_unique_1: response.data[0].optional_composite_unique_1,
      optional_composite_unique_2: response.data[0].optional_composite_unique_2,
      xxx_composite_unique_1: response.data[0].xxx_composite_unique_1,
      xxx_composite_unique_2: response.data[0].xxx_composite_unique_2,
      is_archived: response.data[0].is_archived,
      created_at: response.data[0].created_at,
      created_by: response.data[0].created_by,
    };
  }

  async raw(_id: string): Promise<IExample | null> {
    const response = await this.database.collection(collectionName).retrieve<IExample>(_id, this.options);
    if (!response) {
      return null;
    }

    return response;
  }

  private pipeFilter(_id: string): IPipeline[] {
    return [{ $match: { _id } }];
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
