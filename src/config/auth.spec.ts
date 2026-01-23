import { describe, expect, it } from 'bun:test';

import authConfig from './auth';

describe('auth config', () => {
  it('issuer should be typeof string', () => {
    expect(typeof authConfig.issuer).toBe('string');
  });
  it('secret should be typeof string', () => {
    expect(typeof authConfig.secret).toBe('string');
  });
});
