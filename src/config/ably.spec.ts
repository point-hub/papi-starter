import { describe, expect, it } from 'bun:test';

import ablyConfig from './ably';

describe('ably config', () => {
  it('ably api key should be typeof string', () => {
    expect(typeof ablyConfig.ablyApiKey).toBe('string');
  });
});
