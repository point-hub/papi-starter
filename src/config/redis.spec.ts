import { describe, expect, it } from 'bun:test'

import redisConfig from './redis'

describe('server config', () => {
  it('url should be typeof string', () => {
    expect(typeof redisConfig.url).toBe('string')
  })
})
