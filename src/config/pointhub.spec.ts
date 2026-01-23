import { describe, expect, it } from 'bun:test';

import pointhubConfig from './pointhub';

describe('pointhub config', () => {
  it('secret should be typeof string', () => {
    expect(typeof pointhubConfig.secret).toBe('string');
  });
});
