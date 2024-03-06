import { createApp } from './app'
import serverConfig from './config/server'
import { dbConnection } from './database/database'
import { createServer } from './server'

/**
 * Create database connection. It will keep the connection open by default,
 * and use the same connection for all queries. If you need to close the connection,
 * call dbConnection.close() (which is asynchronous and returns a Promise)..
 */
await dbConnection.open()

/**
 * Create HTTP Server for API
 */
const app = await createApp({ dbConnection })
createServer(app, serverConfig)
