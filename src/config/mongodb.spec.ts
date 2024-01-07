import { describe, expect, it } from 'bun:test'

import mongodbConfig from './mongodb'

describe('mongodb config', () => {
  it('host should be typeof string', () => {
    expect(typeof mongodbConfig.url).toBe('string')
  })

  it('port should be typeof number', () => {
    expect(typeof mongodbConfig.name).toBe('string')
  })
})
