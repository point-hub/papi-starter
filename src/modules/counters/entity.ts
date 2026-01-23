import { BaseEntity } from '@/modules/_shared/entity/base.entity';

import { type ICounter } from './interface';

export const collectionName = 'counters';

export class CounterEntity extends BaseEntity<ICounter> {
  constructor(public data: ICounter) {
    super();

    this.data = this.normalize(this.data);
  }
}
