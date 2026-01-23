import { BaseEntity } from '@/modules/_shared/entity/base.entity';

import { type IAuditLog } from './interface';

export const collectionName = 'audit_logs';

export class AuditLogEntity extends BaseEntity<IAuditLog> {
  constructor(public data: IAuditLog) {
    super();

    this.data = this.normalize(this.data);
  }
}
