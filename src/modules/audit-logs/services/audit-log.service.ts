import { type IDatabase } from '@point-hub/papi';
import { randomUUIDv7 } from 'bun';

export interface IData {
  activity_log_id?: string
  operation_id: string
  entity_type: string
  entity_id: string
  entity_ref: string
  actor_type: string
  actor_id?: string
  actor_name?: string
  action: string
  module: string
  system_reason: string
  user_reason?: string
  changes?: {
    summary: {
      fields: string[]
      count: number
    }
    snapshot: {
      before: object
      after: object
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

export interface ICreateResponse {
  inserted_id: string
}

export interface ICreateManyResponse {
  inserted_ids: string[]
}

export interface IBuildChangesResult<T = Record<string, unknown>> {
  summary: {
    fields: string[]
    count: number
  }
  snapshot: {
    before: Partial<T>
    after: Partial<T>
  }
}

export interface IAuditLogService {
  log(data: IData): Promise<ICreateResponse>
  logs(data: IData[]): Promise<ICreateManyResponse>
  generateOperationId(): string
  buildChanges<T extends object>(
    before: Partial<T>,
    after: Partial<T>,
    options?: {
      ignoreFields?: string[]
      redactFields?: string[]
      redactValue?: unknown
    },
  ): IBuildChangesResult<T>
  mergeDefined<T extends object>(
    base: T,
    patch: Partial<T>,
  ): T
}

export class AuditLogService implements IAuditLogService {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    if (typeof value !== 'object' || value === null) return false;

    // Exclude arrays
    if (Array.isArray(value)) return false;

    // Exclude special objects (Date, Map, Set, RegExp, etc.)
    if (
      value instanceof Date ||
      value instanceof Map ||
      value instanceof Set ||
      value instanceof RegExp
    ) {
      return false;
    }

    // Only plain object literals or objects created with `new Object()`
    return Object.getPrototypeOf(value) === Object.prototype;
  }

  private flattenObject(
    obj: Record<string, unknown>,
    prefix = '',
    result: Record<string, unknown> = {},
  ): Record<string, unknown> {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (this.isPlainObject(value)) {
        this.flattenObject(value, path, result);
      } else {
        result[path] = value;
      }
    }

    return result;
  }

  async log(data: IData): Promise<ICreateResponse> {
    const response = await this.database.collection('audit_logs').create({
      operation_id: data.operation_id,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      entity_ref: data.entity_ref,
      actor_type: data.actor_type,
      actor_id: data.actor_id,
      actor_name: data.actor_name,
      action: data.action,
      module: data.module,
      system_reason: data.system_reason,
      user_reason: data.user_reason,
      changes: data.changes,
      metadata: data.metadata,
      created_at: data.created_at,
    });

    return {
      inserted_id: response.inserted_id,
    };
  }

  async logs(data: IData[]): Promise<ICreateManyResponse> {
    const documents = data.map(item => ({
      operation_id: item.operation_id,
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      entity_ref: item.entity_ref,
      actor_type: item.actor_type,
      actor_id: item.actor_id,
      actor_name: item.actor_name,
      action: item.action,
      module: item.module,
      system_reason: item.system_reason,
      user_reason: item.user_reason,
      changes: item.changes,
      metadata: item.metadata,
      created_at: item.created_at,
    }));

    const response = await this.database.collection('audit_logs').createMany(documents);

    return {
      inserted_ids: response.inserted_ids,
    };
  }

  generateOperationId(): string {
    return randomUUIDv7();
  }

  buildChanges<T extends object>(
    before: Partial<T>,
    after: Partial<T>,
    options?: {
      ignoreFields?: string[]
      redactFields?: string[]
      redactValue?: unknown
    },
  ): IBuildChangesResult<T> {
    const ignore = new Set(options?.ignoreFields ?? []);
    const redact = new Set(options?.redactFields ?? []);
    const redactValue = options?.redactValue ?? '[REDACTED]';

    // Flatten objects for easy comparison
    const flatBefore = this.isPlainObject(before)
      ? this.flattenObject(before as Record<string, unknown>)
      : {};
    const flatAfter = this.isPlainObject(after)
      ? this.flattenObject(after as Record<string, unknown>)
      : {};

    // Collect all keys from both objects
    const allKeys = new Set([
      ...Object.keys(flatBefore),
      ...Object.keys(flatAfter),
    ]);

    const changedFields: string[] = [];

    // Compare raw values (before redaction)
    for (const key of allKeys) {
      if (ignore.has(key)) continue;

      const beforeValue = flatBefore[key];
      const afterValue = flatAfter[key];

      if (beforeValue !== afterValue) {
        changedFields.push(key);
      }
    }

    // Redact snapshot (flattened)
    const redactSnapshot = (flat: Record<string, unknown>) => {
      const result: Record<string, unknown> = { ...flat };
      for (const key of redact) {
        if (key in result) {
          result[key] = redactValue;
        }
      }
      return result;
    };

    return {
      summary: {
        fields: changedFields,
        count: changedFields.length,
      },
      snapshot: {
        before: redactSnapshot(flatBefore) as Partial<T>,
        after: redactSnapshot(flatAfter) as Partial<T>,
      },
    };
  }

  mergeDefined<T extends object>(
    base: T,
    patch: Partial<T>,
  ): T {
    const result: T = { ...base };

    for (const key in patch) {
      const value = patch[key];
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }
};
