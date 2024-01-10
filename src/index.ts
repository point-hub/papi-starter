import { createApp } from './app'
import redisConfig from './config/redis'
import serverConfig from './config/server'
import websocketConfig from './config/websocket'
import { dbConnection } from './database/database'
import { createServer } from './server'
import { RedisClient } from './utils/redis'
import { makeWebSocketServer } from './utils/websocket'

/**
 * Create database connection. It will keep the connection open by default,
 * and use the same connection for all queries. If you need to close the connection,
 * call dbConnection.close() (which is asynchronous and returns a Promise)..
 */
await dbConnection.open()

/**
 * Create redis connection for pub/sub
 */
const redisPublisher = new RedisClient(redisConfig.url, 'publisher')
await redisPublisher.connect()
const redisSubscriber = new RedisClient(redisConfig.url, 'subscriber')
await redisSubscriber.connect()

/**
 * Create websocket connection
 */
const webSocketServer = await makeWebSocketServer(websocketConfig.port, redisPublisher.client, redisSubscriber.client)
/**
 * Create HTTP Server for API
 */
const app = await createApp({ dbConnection, webSocketServer, publisher: redisPublisher.client })
createServer(app, serverConfig)
