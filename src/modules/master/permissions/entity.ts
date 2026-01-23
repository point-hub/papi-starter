import { BaseEntity } from '@/modules/_shared/entity/base.entity';

import { type IPermission } from './interface';

export const collectionName = 'permissions';

export class PermissionEntity extends BaseEntity<IPermission> {
  constructor(public data: IPermission) {
    super();

    this.data = this.normalize(this.data);
  }
}
