import { describe, expect, it } from 'bun:test';

import { bulkUpdatePolicyService } from './bulk-update-policy.service';

describe('bulkUpdatePolicyService.unique', () => {
  it('returns null when no unique fields are touched', () => {
    const data = {
      age: 30,
      gender: 'male',
      notes: 'test',
    };

    const result = bulkUpdatePolicyService.unique(data, ['name']);

    expect(result).toBeNull();
  });

  it('returns error when a unique field is touched', () => {
    const data = {
      name: 'John Doe',
    };

    const result = bulkUpdatePolicyService.unique(data, ['name']);

    expect(result).toEqual({
      name: ['This name field cannot be updated in bulk operations.'],
    });
  });

  it('returns errors for multiple unique fields', () => {
    const data = {
      name: 'john',
      email: 'test@example.com',
      username: 'john',
    };

    const result = bulkUpdatePolicyService.unique(data, ['email', 'username']);

    expect(result).toEqual({
      email: ['This email field cannot be updated in bulk operations.'],
      username: ['This username field cannot be updated in bulk operations.'],
    });
  });

  it('treats undefined unique fields as touched', () => {
    const data = {
      name: undefined,
    };

    const result = bulkUpdatePolicyService.unique(data, ['name']);

    expect(result).toEqual({
      name: ['This name field cannot be updated in bulk operations.'],
    });
  });

  it('returns null for empty update payload', () => {
    const data = {};

    const result = bulkUpdatePolicyService.unique(data, ['name']);

    expect(result).toBeNull();
  });
});
