import { describe, expect, it } from 'bun:test'

import serverConfig from './server'

describe('server config', () => {
  it('host should be typeof string', () => {
    expect(typeof serverConfig.host).toBe('string')
  })

  it('port should be typeof number', () => {
    expect(typeof serverConfig.port).toBe('number')
  })
})
