import { type IDocument } from '@point-hub/papi';
import Validatorjs from 'validatorjs';

import { throwApiError } from '../utils/throw-api-error';

export interface ISchemaUniqueValidationService {
  validate(document: IDocument, schema: IDocument): void;
}


/**
 * Flatten a deeply nested object into dot-notation keys.
 * Example:
 *   { profile: { status: 'ok' } }
 * → { 'profile.status': 'ok' }
 *
 * Supports:
 * - Nested objects and arrays
 * - Skips null / undefined gracefully
 * - Prevents circular references
 */
export function flattenObject<T extends object>(
  obj: T,
  parentKey = '',
  result: Record<string, unknown> = {},
  seen = new WeakSet<object>(),
): Record<string, unknown> {
  if (obj === null || typeof obj !== 'object') {
    if (parentKey) result[parentKey] = obj;
    return result;
  }

  // Prevent circular references
  if (seen.has(obj)) return result;
  seen.add(obj);

  for (const [key, value] of Object.entries(obj) as [string, unknown][]) {
    if (value === undefined) continue;

    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(value)) {
      result[newKey] = value;
    } else if (value !== null && typeof value === 'object') {
      flattenObject(value as object, newKey, result, seen);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

// https://github.com/mikeerickson/validatorjs
export const validate = (document: IDocument, schema: IDocument) => {
  const validation = new Validatorjs(flattenObject(document), schema);
  validation.setAttributeFormatter(function (attribute) {
    return attribute.replace(/ /g, '_');
  });

  registerUsernameFormatRules();

  if (validation.fails()) {
    throwApiError(422, { message: 'Validation failed, Please check the highlighted fields.', errors: validation.errors.errors });
  }
};

/**
 * Static schema validation service (singleton)
 */
export const SchemaUniqueValidationService: ISchemaUniqueValidationService = {
  validate,
};

export function registerUsernameFormatRules() {
  // Custom Rule: Username Format (Alphanumeric and Dot only)
  Validatorjs.register(
    'username_format',
    function (value) {
      // Allow only letters (a-z, A-Z), numbers (0-9), and the dot symbol (.).
      const usernameRegex = /^[a-zA-Z0-9.]+$/;

      // Ensure it's a string and matches the pattern.
      return typeof value === 'string' && usernameRegex.test(value);
    },
    'The :attribute field must only contain letters, numbers, and the dot symbol (.).',
  );
}
