import { jsonParse, jsonStringify } from '@point-hub/express-utils'
import { type RedisClientType } from 'redis'
import { v4 as uuidv4 } from 'uuid'

interface IData {
  topic: string
  [key: string]: unknown
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const makeWebSocketServer = async (port: number, publisher: RedisClientType, subscriber: RedisClientType) => {
  await subscriber.subscribe('cluster', (message: string, channel: string) => {
    const json = jsonParse(message)
    webSocketServer.publish(json.topic, jsonStringify(json.message))
  })

  const webSocketServer = Bun.serve({
    port: port,
    fetch(req, server) {
      console.log(req, server)
      const sessionId = uuidv4()
      const url = new URL(req.url)
      if (
        server.upgrade(req, {
          headers: {
            'Set-Cookie': `WS_SID=${sessionId};SameSite=None;Secure`,
          },
          data: {
            topic: url.pathname,
          },
        })
      ) {
        console.log('websocket connected')
        return undefined
      }
      console.log('websocket error')
      return new Response('Websocket Server Error', { status: 500 })
    },
    websocket: {
      // a message is received
      message(ws, message) {
        const data = ws.data as IData
        console.info('a message is received', message)
        // publish to redis, so it can distributed to other server in the cluster
        publisher.publish('cluster', jsonStringify({ topic: data.topic, message: message }))
      },
      // a socket is opened
      open(ws) {
        const data = ws.data as IData
        console.info('a socket is opened')
        // subscribe
        ws.subscribe(data.topic)
      },
      // a socket is closed
      close(ws, code, message) {
        const data = ws.data as IData
        // unsubscribe
        ws.unsubscribe(data.topic)
        console.info('a socket is closed')
      },
      // the socket is ready to receive more data
      drain(ws) {
        console.info('the socket is ready to receive more data')
      },
    },
  })
  console.info(`Pointhub Websocket Listening on ws://${webSocketServer.hostname}:${webSocketServer.port}`)

  return webSocketServer
}
