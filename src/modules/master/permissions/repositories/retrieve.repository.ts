import type { IDatabase, IPipeline } from '@point-hub/papi';

import { collectionName } from '../entity';

export interface IRetrieveRepository {
  handle(_id: string): Promise<IRetrieveOutput | null>
}

export interface IRetrieveOutput {
  _id: string
  name: string
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
    pipeline.push(...this.pipeProject());

    const response = await this.database.collection(collectionName).aggregate(pipeline, {}, this.options);
    if (!response || response.data.length === 0) {
      return null;
    }

    const result = response.data[0] as IRetrieveOutput;

    return {
      _id: result._id as string,
      name: result.name as string,
      created_at: result.created_at as Date,
    };
  }

  private pipeFilter(_id: string): IPipeline[] {
    return [{ $match: { _id } }];
  }

  private pipeProject(): IPipeline[] {
    return [
      {
        $project: {
          _id: 1,
          name: 1,
          created_at: 1,
        },
      },
    ];
  }
}
