import { describe, expect, it } from 'bun:test'

import corsConfig from './cors'

describe('cors config', () => {
  it('origin should be typeof string', () => {
    expect(typeof corsConfig.origin).toBe('string')
  })
  it('credentials should be typeof boolean', () => {
    expect(typeof corsConfig.credentials).toBe('boolean')
  })
})
