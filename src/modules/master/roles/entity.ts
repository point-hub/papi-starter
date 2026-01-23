import { BaseEntity } from '@/modules/_shared/entity/base.entity';

import { type IRole } from './interface';

export const collectionName = 'roles';

export class RoleEntity extends BaseEntity<IRole> {
  constructor(public data: IRole) {
    super();

    this.data = this.normalize(this.data);
  }
}
