import type { IDatabase } from '@point-hub/papi';

/**
 * Error payload format for uniqueness validation.
 */
export interface IPayloadUniqueError {
  [path: string]: string[];
}

/**
 * Validation service interface.
 */
export interface IUniqueValidationService {
  validate<T extends object>(
    collectionName: string,
    data: T,
    options?: {
      except?: T;
      ignoreUndefined?: boolean
      replaceErrorAttribute?: Record<string, string>;
    },
  ): Promise<IPayloadUniqueError | null>;

  validateMany<T extends object>(
    collectionName: string,
    data: T[],
    fields: readonly (keyof T)[],
    options?: {
      except?: T;
      ignoreUndefined?: boolean
      replaceErrorAttribute?: Record<string, string>;
    },
  ): Promise<IPayloadUniqueError | null>;
}

export class UniqueValidationService implements IUniqueValidationService {
  constructor(
    public readonly database: IDatabase,
    public readonly options?: unknown,
  ) { }

  /**
   * Validate uniqueness inside the request payload (no database access).
   *
   * Supports:
   * - Single-field unique
   * - Composite unique (multiple fields)
   * - Optional validation when fields exist only
   *
   * ---
   *
   * @example
   * Example 1 — Single field must be unique
   *
   * data = [
   *   { name: 'john' },
   *   { name: 'jane' },
   *   { name: 'john' },
   * ]
   *
   * fields = ['name']
   *
   * Result:
   * {
   *   'data.0.name': ['The name field must be unique.'],
   *   'data.2.name': ['The name field must be unique.'],
   * }
   *
   * ---
   *
   * @example
   * Example 2 — Composite unique (name + age)
   *
   * data = [
   *   { name: 'john', age: 10 },
   *   { name: 'john', age: 10 },
   *   { name: 'john', age: 10 },
   * ]
   *
   * fields = ['name', 'age']
   *
   * Result:
   * {
   *   'data.0.name': ['The combination of name, age field must be unique.'],
   *   'data.1.name': ['The combination of name, age field must be unique.'],
   *   'data.2.name': ['The combination of name, age field must be unique.'],
   * }
   *
   * ---
   *
   * @example
   * Example 3 — Single field unique only if field exists
   *
   * data = [
   *   { name: 'john', age: 10 },
   *   { age: 10 },
   * ]
   *
   * fields = ['name']
   * options.ignoreUndefined = true
   *
   * Result:
   * null
   *
   * ---
   *
   * @example
   * Example 4 — Composite unique only if all fields exist
   *
   * data = [
   *   { name: 'john', age: 10 },
   *   { age: 10 },
   * ]
   *
   * fields = ['name', 'age']
   * options.ignoreUndefined = true
   *
   * Result:
   * null
   */
  private validatePayload<T extends object>(
    data: T[],
    fields: readonly string[],
    options?: {
      ignoreUndefined?: boolean;
      replaceErrorAttribute?: Record<string, string>;
    },
  ): IPayloadUniqueError | null {
    const seen = new Map<string, number[]>();
    const errors: IPayloadUniqueError = {};

    data.forEach((item, index) => {
      const record = item as Record<string, unknown>;

      const values = fields.map(field => {
        const value = record[field];
        if (value === undefined || value === null) return undefined;
        return String(value).trim();
      });
      const hasAllValues = values.every(v => v);
      const hasAnyValue = values.some(v => v);

      if (options && options.ignoreUndefined) {
        if (!hasAnyValue) return;
        if (!hasAllValues) return;
      }
      const compositeKey = JSON.stringify(values);
      const indexes = seen.get(compositeKey) ?? [];

      indexes.push(index);
      seen.set(compositeKey, indexes);
    });

    /**
     * Generate errors for duplicates
     */
    const displayFields = fields.map(
      f => options?.replaceErrorAttribute?.[f] ?? f,
    );

    for (const indexes of seen.values()) {
      if (indexes.length < 2) continue;

      for (const index of indexes) {
        for (const replacedField of displayFields) {
          const path = data.length === 1 ? replacedField : `data.${index}.${replacedField}`;

          errors[path] = [
            displayFields.length > 1
              ? `The combination of ${displayFields.join(', ')} field must be unique.`
              : `The ${displayFields[0]} field must be unique.`,
          ];
        }
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Find duplicate in database
   */
  private async validateInDB<T extends object>(
    collectionName: string,
    data: T[],
    fields: readonly string[],
    options?: {
      except?: T;
      ignoreUndefined?: boolean
      replaceErrorAttribute?: Record<string, string>;
    },
  ): Promise<IPayloadUniqueError | null> {

    const errors: IPayloadUniqueError = {};
    const filters: Record<string, unknown>[] = [];

    /**
     * Build query filters from payload
     */
    data.forEach((item) => {
      const record = item as Record<string, unknown>;
      const values = fields.map(field => record[field]);
      const hasAllValues = values.every(v => v !== undefined && v !== null);
      const hasAnyValue = values.some(v => v !== undefined && v !== null);

      if (options?.ignoreUndefined) {
        if (!hasAnyValue) return;
        if (!hasAllValues) return;
      }

      const andFilter: Record<string, unknown> = {};

      fields.forEach(field => {
        andFilter[field] = record[field];
      });

      filters.push(andFilter);
    });

    if (filters.length === 0) return null;

    /**
     * Build DB filter
     */
    const filter: Record<string, unknown> = {
      $or: filters.map(f => ({ $and: Object.entries(f).map(([k, v]) => ({ [k]: v })) })),
    };

    /**
     * Exclude self (update case)
     */
    if (options?.except) {
      filter['$and'] = Object.entries(options.except).map(
        ([key, value]) => ({ [key]: { $ne: value } }),
      );
    }

    // DB call to retrieve all data
    const result = await this.database
      .collection(collectionName)
      .retrieveMany({ filter }, this.options);

    if (result.data.length === 0) return null;

    /**
     * Build error paths
     */
    const displayFields = fields.map(
      f => options?.replaceErrorAttribute?.[f] ?? f,
    );

    data.forEach((item, index) => {
      const record = item as Record<string, unknown>;

      // Check if this payload row exists in DB result
      const matched = result.data.some(doc =>
        fields.every(field => {
          const payloadValue = record[field];
          const dbValue = (doc as Record<string, unknown>)[field];

          if (options?.ignoreUndefined) {
            if (payloadValue === undefined || payloadValue === null) return false;
          }

          return payloadValue === dbValue;
        }),
      );

      if (!matched) return;

      // Create errors per display field
      for (const displayField of displayFields) {
        const path = data.length === 1 ? displayField : `data.${index}.${displayField}`;

        errors[path] = [
          displayFields.length > 1
            ? `The combination of ${displayFields.join(', ')} field must be unique.`
            : `The ${displayFields[0]} field must be unique.`,
        ];
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Validate unique field
   *
   * @param collectionName
   * @param data
   * @param options
   */
  async validate<T extends object>(
    collectionName: string,
    data: T,
    options?: {
      except?: T;
      replaceErrorAttribute?: Record<string, string>;
    },
  ): Promise<IPayloadUniqueError | null> {
    const fields = Object.keys(data) as (keyof T)[];

    // Reuse validateMany by wrapping data into array
    return this.validateMany(
      collectionName,
      [data],
      fields,
      options,
    );
  }

  /**
   * Validate unique field in array of object
   *
   * @param collectionName
   * @param data
   * @param fields
   * @param options
   * @returns
   */
  async validateMany<T extends object>(
    collectionName: string,
    data: T[],
    fields: readonly (keyof T)[],
    options?: {
      except?: T;
      ignoreUndefined?: boolean
      replaceErrorAttribute?: Record<string, string>;
    },
  ): Promise<IPayloadUniqueError | null> {
    const fieldNames = fields.map(String);

    /**
     * Step 1: payload-level validation
     */
    const payloadErrors = this.validatePayload(
      data,
      fieldNames,
      options,
    );
    if (payloadErrors) return payloadErrors;

    /**
     * Step 2: database-level validation
     */
    return this.validateInDB(
      collectionName,
      data,
      fieldNames,
      options,
    );
  }
}
