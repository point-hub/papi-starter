import { BaseEntity } from '@/modules/_shared/entity/base.entity';

import { type IExample } from './interface';

export const collectionName = 'examples';

export class ExampleEntity extends BaseEntity<IExample> {
  constructor(public data: IExample) {
    super();

    this.data = this.normalize(this.data);
  }
}
