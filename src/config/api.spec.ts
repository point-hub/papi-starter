import { describe, expect, it } from 'bun:test';

import apiConfig from './api';

describe('api config', () => {
  it('base url should be typeof string', () => {
    expect(typeof apiConfig.baseUrl).toBe('string');
  });
  it('client url should be typeof string', () => {
    expect(typeof apiConfig.clientUrl).toBe('string');
  });
});
