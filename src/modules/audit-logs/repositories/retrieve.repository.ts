import type { IDatabase, IPipeline } from '@point-hub/papi';

import type { IAuthUser } from '@/modules/master/users/interface';

import { collectionName } from '../entity';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput | null>
}

export interface IRetrieveOutput {
  _id?: string
  operation_id?: string
  entity_type?: string
  entity_id?: string
  entity_ref?: string
  actor_type?: string
  actor_id?: string
  actor_name?: string
  actor: IAuthUser
  action?: string
  module?: string
  system_reason?: string
  user_reason?: string
  changes?: {
    summary?: {
      fields?: string[]
      count?: number
    }
    snapshot?: {
      before?: object
      after?: object
    }
  }
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

export class RetrieveRepository implements IRetrieveRepository {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async handle(_id: string): Promise<IRetrieveOutput | null> {
    const pipeline: IPipeline[] = [];

    pipeline.push(...this.pipeFilter(_id));
    pipeline.push(...this.pipeJoinActorId());
    pipeline.push(...this.pipeProject());

    const response = await this.database.collection(collectionName).aggregate<IRetrieveOutput>(pipeline, {}, this.options);
    if (!response || response.data.length === 0) {
      return null;
    }

    return {
      _id: response.data[0]._id,
      operation_id: response.data[0].operation_id,
      entity_type: response.data[0].entity_type,
      entity_id: response.data[0].entity_id,
      entity_ref: response.data[0].entity_ref,
      actor_type: response.data[0].actor_type,
      actor_id: response.data[0].actor_id,
      actor_name: response.data[0].actor_name,
      actor: response.data[0].actor,
      action: response.data[0].action,
      system_reason: response.data[0].system_reason,
      user_reason: response.data[0].user_reason,
      changes: response.data[0].changes,
      metadata: response.data[0].metadata,
      created_at: response.data[0].created_at,
    };
  }

  private pipeFilter(_id: string): IPipeline[] {
    return [{ $match: { _id } }];
  }

  private pipeJoinActorId(): IPipeline[] {
    return [
      {
        $lookup: {
          from: 'users',
          let: {
            actorId: '$actor_id',
            actorType: '$actor_type',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$actorType', 'user'] },
                    { $eq: ['$_id', '$$actorId'] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1,
                email: 1,
              },
            },
          ],
          as: 'actor',
        },
      },
      {
        $unwind: {
          path: '$actor',
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
          operation_id: 1,
          entity_type: 1,
          entity_id: 1,
          entity_ref: 1,
          actor_type: 1,
          actor_id: 1,
          actor_name: 1,
          actor: {
            _id: '$actor._id',
            name: '$actor.name',
            username: '$actor.username',
            email: '$actor.email',
          },
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
