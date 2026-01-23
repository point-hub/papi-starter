import type { IDatabase, IPipeline } from '@point-hub/papi';

import { collectionName } from '../entity';
import type { IAuthUser, IUser } from '../interface';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput | null>
  raw(_id: string): Promise<IUser | null>
}

export interface IRetrieveOutput {
  _id: string
  name: string
  username: string
  email: string
  trimmed_username?: string
  trimmed_email?: string
  notes: string
  role_id?: string
  avatar_url?: string
  password?: string
  role: {
    _id: string
    code: string
    name: string
    permissions: string[]
  }
  email_verification?: {
    code?: string
    url?: string
    requested_at?: Date
    is_verified?: boolean
    verified_at?: Date
  }
  request_password?: {
    requested_at?: Date
    code?: string
    url?: string
  }
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
    pipeline.push(...this.pipeJoinRole());
    pipeline.push(...this.pipeJoinCreatedById());
    pipeline.push(...this.pipeProject());

    const response = await this.database.collection(collectionName).aggregate(pipeline, {}, this.options);
    if (!response || response.data.length === 0) {
      return null;
    }

    const result = response.data[0] as IRetrieveOutput;

    return {
      _id: result._id as string,
      username: result.username as string,
      name: result.name as string,
      email: result.email as string,
      notes: result.notes as string,
      role: {
        _id: result.role._id as string,
        code: result.role.code as string,
        name: result.role.name as string,
        permissions: result.role.permissions as string[],
      },
      password: result.password as string,
      is_archived: result.is_archived as boolean,
      created_at: result.created_at as Date,
      created_by: result.created_by as IAuthUser,
    };
  }

  async raw(_id: string): Promise<IUser | null> {
    const response = await this.database.collection(collectionName).retrieve<IUser>(_id, this.options);
    if (!response) {
      return null;
    }

    return response;
  }

  private pipeFilter(_id: string): IPipeline[] {
    return [{ $match: { _id } }];
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

  private pipeProject(): IPipeline[] {
    return [
      {
        $project: {
          _id: 1,
          name: 1,
          username: 1,
          email: 1,
          role: 1,
          notes: 1,
          is_archived: 1,
          created_at: 1,
          created_by: 1,
        },
      },
    ];
  }
}
