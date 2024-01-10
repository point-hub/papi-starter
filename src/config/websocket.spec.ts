import { describe, expect, it } from 'bun:test'

import websocketConfig from './websocket'

describe('server config', () => {
  it('port should be typeof number', () => {
    expect(typeof websocketConfig.port).toBe('number')
  })
})
