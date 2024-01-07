import { describe, expect, it } from 'bun:test'

import serverConfig from './websocket'

describe('server config', () => {
  it('port should be typeof number', () => {
    expect(typeof serverConfig.port).toBe('number')
  })
})
