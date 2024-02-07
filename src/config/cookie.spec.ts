import { describe, expect, it } from 'bun:test'

import cookieConfig from './cookie'

describe('cookie config', () => {
  it('secret should be typeof string', () => {
    expect(typeof cookieConfig.secret).toBe('string')
  })
})
